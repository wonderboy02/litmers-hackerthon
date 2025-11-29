'use client'

import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface IssueCardProps {
  issue: {
    id: string
    title: string
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
    assignee?: {
      id: string
      name: string
      profile_image?: string
    }
    due_date?: string
    labels?: Array<{
      label: {
        id: string
        name: string
        color: string
      }
    }>
    subtasks?: Array<{
      id: string
      is_completed: boolean
    }>
  }
}

export function IssueCard({ issue }: IssueCardProps) {
  const params = useParams()
  const teamId = params.teamId as string
  const projectId = params.projectId as string

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'LOW': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '🔴'
      case 'MEDIUM': return '🟡'
      case 'LOW': return '⚪'
      default: return '⚪'
    }
  }

  const completedSubtasks = issue.subtasks?.filter(st => st.is_completed).length || 0
  const totalSubtasks = issue.subtasks?.length || 0

  const isDueSoon = issue.due_date && new Date(issue.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const isOverdue = issue.due_date && new Date(issue.due_date) < new Date()

  return (
    <div className="bg-white border-l-4 border-l-blue-500 rounded-lg p-4 shadow-sm hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing border border-gray-200">
      {/* 우선순위 및 라벨 */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getPriorityColor(issue.priority)}`}>
          {getPriorityIcon(issue.priority)} {issue.priority}
        </span>
        {issue.labels && issue.labels.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {issue.labels.map((labelRel: any) => (
              <span
                key={labelRel.label.id}
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: `${labelRel.label.color}15`,
                  color: labelRel.label.color,
                  border: `1.5px solid ${labelRel.label.color}40`
                }}
              >
                {labelRel.label.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 제목 */}
      <h4 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2 leading-snug">
        {issue.title}
      </h4>

      {/* 메타 정보 */}
      <div className="space-y-2 mb-3 text-xs text-gray-600">
        {/* 담당자 */}
        {issue.assignee && (
          <div className="flex items-center gap-2">
            {issue.assignee.profile_image ? (
              <img
                src={issue.assignee.profile_image}
                alt={issue.assignee.name}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center text-xs font-semibold text-white">
                {issue.assignee.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-medium">{issue.assignee.name}</span>
          </div>
        )}

        {/* 서브태스크 진행률 */}
        {totalSubtasks > 0 && (
          <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-md w-fit">
            <span className="text-xs">✅</span>
            <span className="font-medium">{completedSubtasks}/{totalSubtasks}</span>
          </div>
        )}

        {/* 마감일 */}
        {issue.due_date && (
          <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md font-medium ${isOverdue ? 'bg-red-50 text-red-600' : isDueSoon ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-600'}`}>
            <span>📅</span>
            <span>{new Date(issue.due_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
      </div>

      {/* 상세보기 버튼 */}
      <Link
        href={`/teams/${teamId}/projects/${projectId}/issues/${issue.id}`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="block w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700 py-2 border-t border-gray-100 hover:bg-blue-50 rounded-b transition-colors cursor-pointer"
      >
        상세보기 →
      </Link>
    </div>
  )
}
