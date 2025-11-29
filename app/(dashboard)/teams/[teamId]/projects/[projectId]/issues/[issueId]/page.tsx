'use client'

import { useParams } from 'next/navigation'
import { useIssue, useUpdateIssue } from '@/app/lib/hooks/useIssues'
import { LoadingSpinner, Card, Button } from '@/app/components/common'
import { CommentSection } from '@/app/components/issues/CommentSection'
import { SubtaskList } from '@/app/components/issues/SubtaskList'
import { useState } from 'react'

export default function IssueDetailPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const issueId = params.issueId as string

  const { data: issue, isLoading } = useIssue(projectId, issueId)
  const updateMutation = useUpdateIssue(projectId, issueId)

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: '',
    description: '',
  })

  if (isLoading) return <LoadingSpinner fullScreen />

  if (!issue) {
    return (
      <Card className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">이슈를 찾을 수 없습니다</h3>
      </Card>
    )
  }

  const handleEdit = () => {
    setEditData({
      title: issue.title,
      description: issue.description || '',
    })
    setIsEditing(true)
  }

  const handleSave = () => {
    updateMutation.mutate(editData, {
      onSuccess: () => {
        setIsEditing(false)
      }
    })
  }

  const priorityColors = {
    HIGH: 'bg-red-100 text-red-700 border-red-200',
    MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    LOW: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* 헤더 */}
      <Card className="mb-6">
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="text-2xl font-bold border-b-2 border-blue-500 w-full focus:outline-none"
            />
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} isLoading={updateMutation.isPending}>
                저장
              </Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                취소
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{issue.title}</h1>
              <Button variant="ghost" size="sm" onClick={handleEdit}>
                수정
              </Button>
            </div>
            {issue.description && (
              <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
            )}
          </div>
        )}
      </Card>

      {/* 이슈 정보 */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">상태</label>
              <p className="font-medium text-gray-900">{issue.state?.name || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">우선순위</label>
              <div className="mt-1">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${priorityColors[issue.priority as keyof typeof priorityColors]}`}>
                  {issue.priority === 'HIGH' && '🔴 높음'}
                  {issue.priority === 'MEDIUM' && '🟡 보통'}
                  {issue.priority === 'LOW' && '⚪ 낮음'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">담당자</label>
              <p className="font-medium text-gray-900">{issue.assignee?.name || '없음'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">마감일</label>
              <p className="font-medium text-gray-900">
                {issue.due_date ? new Date(issue.due_date).toLocaleDateString('ko-KR') : '없음'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 라벨 */}
      {issue.labels && issue.labels.length > 0 && (
        <Card className="mb-6">
          <h3 className="text-sm text-gray-500 mb-2">라벨</h3>
          <div className="flex flex-wrap gap-2">
            {issue.labels.map((label: any) => (
              <span
                key={label.id}
                className="px-3 py-1 rounded-full text-sm font-medium border"
                style={{
                  backgroundColor: `${label.color}20`,
                  color: label.color,
                  borderColor: `${label.color}40`,
                }}
              >
                {label.name}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* 서브태스크 */}
      {issue.subtasks && (
        <Card className="mb-6">
          <SubtaskList
            projectId={projectId}
            issueId={issueId}
            subtasks={issue.subtasks}
          />
        </Card>
      )}

      {/* 댓글 */}
      <Card>
        <CommentSection projectId={projectId} issueId={issueId} />
      </Card>
    </div>
  )
}
