'use client'

import React, { useState } from 'react'
import { Modal } from '@/app/components/common/Modal'
import { useCreateIssue } from '@/app/lib/hooks/useIssues'
import { useProjectStates, useProjectLabels } from '@/app/lib/hooks/useProjects'
import { useTeamMembers } from '@/app/lib/hooks/useTeams'

interface CreateIssueModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  teamId: string
}

export function CreateIssueModal({
  isOpen,
  onClose,
  projectId,
  teamId,
}: CreateIssueModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [dueDate, setDueDate] = useState('')
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])

  const createIssueMutation = useCreateIssue(projectId)
  const { data: states } = useProjectStates(projectId)
  const { data: labels } = useProjectLabels(projectId)
  const { data: members } = useTeamMembers(teamId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      return
    }

    try {
      // dueDate를 ISO 8601 형식으로 변환
      let dueDateISO: string | undefined = undefined
      if (dueDate) {
        // "2025-12-02" -> "2025-12-02T00:00:00.000Z"
        dueDateISO = new Date(dueDate + 'T00:00:00.000Z').toISOString()
      }

      await createIssueMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        assigneeUserId: assigneeId || undefined,
        dueDate: dueDateISO,
        labelIds: selectedLabels,
      })

      // 폼 초기화
      setTitle('')
      setDescription('')
      setPriority('MEDIUM')
      setAssigneeId('')
      setDueDate('')
      setSelectedLabels([])
      onClose()
    } catch (error) {
      // 에러는 useCreateIssue의 onError에서 처리됨
      console.error('이슈 생성 실패:', error)
    }
  }

  const toggleLabel = (labelId: string) => {
    if (selectedLabels.includes(labelId)) {
      setSelectedLabels(selectedLabels.filter((id) => id !== labelId))
    } else {
      if (selectedLabels.length >= 5) {
        alert('최대 5개까지 선택 가능합니다.')
        return
      }
      setSelectedLabels([...selectedLabels, labelId])
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="새 이슈 만들기" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              title.trim() ? 'border-gray-300' : 'border-red-300 bg-red-50'
            }`}
            placeholder="이슈 제목을 입력하세요"
            maxLength={200}
            required
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">{title.length}/200</p>
            {!title.trim() && (
              <p className="text-xs text-red-500">제목은 필수입니다</p>
            )}
          </div>
        </div>

        {/* 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="이슈에 대한 설명을 작성하세요"
            rows={6}
            maxLength={5000}
          />
          <p className="text-xs text-gray-500 mt-1">{description.length}/5000</p>
        </div>

        {/* 우선순위 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">우선순위</label>
          <div className="flex gap-2">
            {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-colors ${
                  priority === p
                    ? p === 'HIGH'
                      ? 'bg-red-100 border-red-300 text-red-800'
                      : p === 'MEDIUM'
                        ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                        : 'bg-green-100 border-green-300 text-green-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {p === 'HIGH' ? '높음' : p === 'MEDIUM' ? '보통' : '낮음'}
              </button>
            ))}
          </div>
        </div>

        {/* 담당자 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">담당자</label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">미지정</option>
            {members?.map((member: any) => {
              // member.users 또는 member.user 구조 모두 지원
              const user = member.users || member.user || member
              if (!user || !user.id) return null

              return (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              )
            })}
          </select>
        </div>

        {/* 마감일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">마감일</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 라벨 */}
        {labels && labels.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              라벨 (최대 5개)
            </label>
            <div className="flex flex-wrap gap-2">
              {labels.map((label: any) => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggleLabel(label.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    selectedLabels.includes(label.id)
                      ? 'ring-2 ring-offset-2'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: `${label.color}30`,
                    color: label.color,
                    borderColor: label.color,
                    border: '1px solid',
                    ringColor: selectedLabels.includes(label.id)
                      ? label.color
                      : 'transparent',
                  }}
                >
                  {label.name}
                  {selectedLabels.includes(label.id) && ' ✓'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex flex-col gap-2 pt-4 border-t">
          {!title.trim() && (
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <svg
                className="w-4 h-4 text-yellow-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-xs text-yellow-800">
                제목을 입력해야 이슈를 생성할 수 있습니다.
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!title.trim() || createIssueMutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
              title={!title.trim() ? '제목을 입력해주세요' : ''}
            >
              {createIssueMutation.isPending ? '생성 중...' : '이슈 생성'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
