'use client'

import { useParams } from 'next/navigation'
import { useIssue, useUpdateIssue } from '@/app/lib/hooks/useIssues'
import { LoadingSpinner, Card, Button, Breadcrumb } from '@/app/components/common'
import { CommentSection } from '@/app/components/issues/CommentSection'
import { SubtaskList } from '@/app/components/issues/SubtaskList'
import { useGenerateSummary, useGenerateSuggestion } from '@/app/lib/hooks/useAI'
import { useState } from 'react'
import { Sparkles, Lightbulb } from 'lucide-react'

export default function IssueDetailPage() {
  const params = useParams()
  const teamId = params.teamId as string
  const projectId = params.projectId as string
  const issueId = params.issueId as string

  const { data: issue, isLoading } = useIssue(projectId, issueId)
  const updateMutation = useUpdateIssue(projectId, issueId)

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: '',
    description: '',
  })

  // AI 기능 (FR-040, FR-041)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
  const [showAiSummary, setShowAiSummary] = useState(false)
  const [showAiSuggestion, setShowAiSuggestion] = useState(false)

  const summaryMutation = useGenerateSummary(projectId, issueId)
  const suggestionMutation = useGenerateSuggestion(projectId, issueId)

  // description 길이 체크 (10자 초과 필요)
  const canUseAI = (issue?.description?.length || 0) > 10

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
        // description 변경 시 AI 캐시 초기화
        setAiSummary(null)
        setAiSuggestion(null)
      }
    })
  }

  // FR-040: AI 요약 생성
  const handleGenerateSummary = async () => {
    try {
      const summary = await summaryMutation.mutateAsync()
      setAiSummary(summary)
      setShowAiSummary(true)
    } catch (error) {
      // 에러는 Hook의 onError에서 처리됨 (Toast 표시)
      console.error('AI 요약 생성 에러:', error)
    }
  }

  // FR-041: AI 해결 전략 제안
  const handleGenerateSuggestion = async () => {
    try {
      const suggestion = await suggestionMutation.mutateAsync()
      setAiSuggestion(suggestion)
      setShowAiSuggestion(true)
    } catch (error) {
      // 에러는 Hook의 onError에서 처리됨 (Toast 표시)
      console.error('AI 해결 전략 생성 에러:', error)
    }
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
              <div className="space-y-4">
                <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>

                {/* AI 버튼 (FR-040, FR-041) */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateSummary}
                    disabled={!canUseAI || summaryMutation.isPending}
                    isLoading={summaryMutation.isPending}
                    title={!canUseAI ? 'AI 기능은 설명이 10자 초과일 때 사용 가능합니다' : ''}
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    AI 요약
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateSuggestion}
                    disabled={!canUseAI || suggestionMutation.isPending}
                    isLoading={suggestionMutation.isPending}
                    title={!canUseAI ? 'AI 기능은 설명이 10자 초과일 때 사용 가능합니다' : ''}
                  >
                    <Lightbulb className="w-4 h-4 mr-1" />
                    AI 해결 전략
                  </Button>
                </div>

                {/* AI 요약 결과 (FR-040) */}
                {showAiSummary && aiSummary && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">AI 요약</h3>
                      </div>
                      <button
                        onClick={() => setShowAiSummary(false)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        닫기
                      </button>
                    </div>
                    <p className="text-blue-900 whitespace-pre-wrap">{aiSummary}</p>
                  </div>
                )}

                {/* AI 해결 전략 결과 (FR-041) */}
                {showAiSuggestion && aiSuggestion && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-purple-600" />
                        <h3 className="font-semibold text-purple-900">AI 해결 전략</h3>
                      </div>
                      <button
                        onClick={() => setShowAiSuggestion(false)}
                        className="text-purple-600 hover:text-purple-800 text-sm"
                      >
                        닫기
                      </button>
                    </div>
                    <p className="text-purple-900 whitespace-pre-wrap">{aiSuggestion}</p>
                  </div>
                )}
              </div>
            )}
            {!issue.description && (
              <p className="text-gray-500 text-sm">설명이 없습니다</p>
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
