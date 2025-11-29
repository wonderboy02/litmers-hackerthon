'use client'

import { useState } from 'react'
import { useCreateSubtask, useUpdateSubtask, useDeleteSubtask } from '@/app/lib/hooks/useIssues'
import { Button } from '@/app/components/common'

interface SubtaskListProps {
  projectId: string
  issueId: string
  subtasks: Array<{
    id: string
    title: string
    is_completed: boolean
  }>
}

export function SubtaskList({ projectId, issueId, subtasks }: SubtaskListProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const createMutation = useCreateSubtask(projectId, issueId)
  const updateMutation = useUpdateSubtask(projectId, issueId)
  const deleteMutation = useDeleteSubtask(projectId, issueId)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return

    createMutation.mutate(newSubtaskTitle, {
      onSuccess: () => {
        setNewSubtaskTitle('')
        setIsAdding(false)
      }
    })
  }

  const handleToggle = (subtaskId: string, currentStatus: boolean) => {
    updateMutation.mutate({
      subtaskId,
      isCompleted: !currentStatus
    })
  }

  const handleDelete = (subtaskId: string) => {
    if (confirm('서브태스크를 삭제하시겠습니까?')) {
      deleteMutation.mutate(subtaskId)
    }
  }

  const completedCount = subtasks.filter(st => st.is_completed).length
  const totalCount = subtasks.length

  return (
    <div className="space-y-3">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          서브태스크
          {totalCount > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              {completedCount}/{totalCount} 완료
            </span>
          )}
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + 추가
          </button>
        )}
      </div>

      {/* 진행률 바 */}
      {totalCount > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      )}

      {/* 서브태스크 목록 */}
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded group"
          >
            {/* 체크박스 */}
            <input
              type="checkbox"
              checked={subtask.is_completed}
              onChange={() => handleToggle(subtask.id, subtask.is_completed)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />

            {/* 제목 */}
            <span
              className={`flex-1 text-sm ${
                subtask.is_completed
                  ? 'line-through text-gray-400'
                  : 'text-gray-700'
              }`}
            >
              {subtask.title}
            </span>

            {/* 삭제 버튼 */}
            <button
              onClick={() => handleDelete(subtask.id)}
              className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 text-xs transition-opacity"
            >
              삭제
            </button>
          </div>
        ))}
      </div>

      {/* 새 서브태스크 추가 폼 */}
      {isAdding && (
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="서브태스크 제목..."
            className="flex-1 text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <Button
            type="submit"
            size="sm"
            isLoading={createMutation.isPending}
          >
            추가
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              setIsAdding(false)
              setNewSubtaskTitle('')
            }}
          >
            취소
          </Button>
        </form>
      )}

      {/* 빈 상태 */}
      {subtasks.length === 0 && !isAdding && (
        <p className="text-sm text-gray-500 text-center py-4">
          서브태스크가 없습니다. 추가 버튼을 클릭하여 생성하세요.
        </p>
      )}
    </div>
  )
}
