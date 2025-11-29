'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useDeleteIssue } from '@/app/lib/hooks/useIssues'

interface Issue {
  id: string
  title: string
  description: string | null
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  due_date: string | null
  created_at: string
  state: {
    id: string
    name: string
    color: string | null
  }
  assignee: {
    id: string
    name: string
    email: string
  } | null
  labels: Array<{
    id: string
    name: string
    color: string
  }>
  _count?: {
    subtasks: number
    comments: number
  }
}

interface IssueListProps {
  projectId: string
  issues: Issue[]
  onCreateClick?: () => void
}

export function IssueList({ projectId, issues, onCreateClick }: IssueListProps) {
  const params = useParams()
  const teamId = params.teamId as string
  const deleteMutation = useDeleteIssue(projectId)
  const [deletingIssueId, setDeletingIssueId] = useState<string | null>(null)

  const handleDeleteClick = async (e: React.MouseEvent, issueId: string, issueTitle: string) => {
    e.preventDefault() // Link 클릭 방지
    e.stopPropagation() // 이벤트 전파 중단

    const confirmed = window.confirm(`"${issueTitle}" 이슈를 삭제하시겠습니까?`)
    if (!confirmed) return

    setDeletingIssueId(issueId)
    try {
      await deleteMutation.mutateAsync(issueId)
    } finally {
      setDeletingIssueId(null)
    }
  }

  if (issues.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-500 mb-4">아직 이슈가 없습니다.</p>
          <button
            onClick={onCreateClick}
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            첫 이슈 만들기 →
          </button>
        </div>
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return '높음'
      case 'MEDIUM':
        return '보통'
      case 'LOW':
        return '낮음'
      default:
        return priority
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return '기한 초과'
    if (diffDays === 0) return '오늘'
    if (diffDays === 1) return '내일'
    if (diffDays <= 7) return `${diffDays}일 후`

    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-2">
      {issues.map((issue) => (
        <Link
          key={issue.id}
          href={`/teams/${teamId}/projects/${projectId}/issues/${issue.id}`}
          className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            {/* 왼쪽: 이슈 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {/* 우선순위 */}
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded border ${getPriorityColor(issue.priority)}`}
                >
                  {getPriorityLabel(issue.priority)}
                </span>

                {/* 상태 */}
                <span
                  className="px-2 py-0.5 text-xs font-medium rounded"
                  style={{
                    backgroundColor: issue.state.color
                      ? `${issue.state.color}20`
                      : '#f3f4f6',
                    color: issue.state.color || '#6b7280',
                    border: `1px solid ${issue.state.color || '#d1d5db'}`,
                  }}
                >
                  {issue.state.name}
                </span>

                {/* 라벨 */}
                {issue.labels.map((label) => (
                  <span
                    key={label.id}
                    className="px-2 py-0.5 text-xs font-medium rounded"
                    style={{
                      backgroundColor: `${label.color}20`,
                      color: label.color,
                      border: `1px solid ${label.color}`,
                    }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>

              {/* 제목 */}
              <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">
                {issue.title}
              </h3>

              {/* 설명 */}
              {issue.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {issue.description}
                </p>
              )}

              {/* 메타 정보 */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {issue.assignee && (
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    {issue.assignee.name}
                  </span>
                )}

                {issue._count && issue._count.comments > 0 && (
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    {issue._count.comments}
                  </span>
                )}

                {issue._count && issue._count.subtasks > 0 && (
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    {issue._count.subtasks}
                  </span>
                )}

                <span>
                  {new Date(issue.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>

            {/* 오른쪽: 마감일 & 삭제 버튼 */}
            <div className="flex items-center gap-2">
              {issue.due_date && (
                <div className="flex-shrink-0">
                  <div
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      new Date(issue.due_date) < new Date()
                        ? 'bg-red-100 text-red-800'
                        : new Date(issue.due_date).getTime() - new Date().getTime() <
                            7 * 24 * 60 * 60 * 1000
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {formatDate(issue.due_date)}
                  </div>
                </div>
              )}

              {/* 삭제 버튼 */}
              <button
                onClick={(e) => handleDeleteClick(e, issue.id, issue.title)}
                disabled={deletingIssueId === issue.id}
                className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="이슈 삭제"
              >
                {deletingIssueId === issue.id ? (
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
