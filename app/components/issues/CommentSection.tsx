'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Button, Card } from '@/app/components/common'

interface CommentSectionProps {
  issueId: string
  projectId: string
}

export function CommentSection({ issueId, projectId }: CommentSectionProps) {
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')

  // 댓글 조회
  const { data: comments } = useQuery({
    queryKey: ['comments', issueId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/issues/${issueId}/comments`)
      if (!res.ok) throw new Error('Failed')
      return res.json()
    }
  })

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] })
      setContent('')
    }
  })

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
