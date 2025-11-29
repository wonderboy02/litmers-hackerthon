'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Button, Card } from '@/app/components/common'
import { useSummarizeComments } from '@/app/lib/hooks/useAI'
import { MessageSquare } from 'lucide-react'

interface CommentSectionProps {
  issueId: string
  projectId: string
}

export function CommentSection({ issueId, projectId }: CommentSectionProps) {
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')

  // AI 댓글 요약 상태 (FR-045)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [showAiSummary, setShowAiSummary] = useState(false)

  // 댓글 조회
  const { data: comments } = useQuery({
    queryKey: ['comments', issueId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/issues/${issueId}/comments`)
      if (!res.ok) throw new Error('Failed')
      return res.json()
    }
  })

  // AI 댓글 요약 mutation (FR-045)
  const summaryMutation = useSummarizeComments(projectId, issueId)

  // 댓글 5개 이상일 때만 AI 요약 가능
  const canUseSummary = (comments?.length || 0) >= 5

  // 댓글 작성
  const createMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/projects/${projectId}/issues/${issueId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onMutate: async (newContent) => {
      await queryClient.cancelQueries({ queryKey: ['comments', issueId] })

      const previousComments = queryClient.getQueryData(['comments', issueId])

      // Optimistic Update - 임시 댓글 추가
      queryClient.setQueryData(['comments', issueId], (old: any) => {
        const tempComment = {
          id: `temp-${Date.now()}`,
          content: newContent,
          created_at: new Date().toISOString(),
          user: {
            name: '나', // 실제로는 현재 사용자 정보를 가져와야 함
            id: 'temp-user'
          }
        }
        return old ? [...old, tempComment] : [tempComment]
      })

      return { previousComments }
    },
    onError: (error, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', issueId], context.previousComments)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] })
      setContent('')
    }
  })

  // FR-045: AI 댓글 요약 생성
  const handleGenerateSummary = async () => {
    try {
      const summary = await summaryMutation.mutateAsync()
      setAiSummary(summary)
      setShowAiSummary(true)
    } catch (error) {
      // 에러는 Hook의 onError에서 처리됨 (Toast 표시)
      console.error('AI 댓글 요약 생성 에러:', error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      createMutation.mutate(content)
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">댓글</h2>

      {/* 댓글 목록 */}
      <div className="space-y-3 mb-6">
        {comments?.map((comment: any) => (
          <Card key={comment.id} padding="sm" className="bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {comment.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{comment.user.name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleString('ko-KR')}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          </Card>
        ))}
        {(!comments || comments.length === 0) && (
          <p className="text-sm text-gray-500 text-center py-8">아직 댓글이 없습니다</p>
        )}
      </div>

      {/* AI 댓글 요약 버튼 (FR-045) */}
      {comments && comments.length > 0 && (
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerateSummary}
            disabled={!canUseSummary || summaryMutation.isPending}
            isLoading={summaryMutation.isPending}
            title={!canUseSummary ? 'AI 댓글 요약은 댓글이 5개 이상일 때 사용 가능합니다' : ''}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            AI 댓글 요약
          </Button>

          {/* AI 요약 결과 (FR-045) */}
          {showAiSummary && aiSummary && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <h3 className="font-semibold text-green-900">AI 댓글 요약</h3>
                </div>
                <button
                  onClick={() => setShowAiSummary(false)}
                  className="text-green-600 hover:text-green-800 text-sm"
                >
                  닫기
                </button>
              </div>
              <p className="text-green-900 whitespace-pre-wrap">{aiSummary}</p>
            </div>
          )}
        </div>
      )}

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 입력하세요..."
          className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!content.trim() || createMutation.isPending}
            isLoading={createMutation.isPending}
          >
            댓글 작성
          </Button>
        </div>
      </form>
    </div>
  )
}
