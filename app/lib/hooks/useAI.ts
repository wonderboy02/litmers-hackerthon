import { useMutation } from '@tanstack/react-query'
import { toast } from '@/app/lib/toast'

/**
 * AI Hooks
 * FR-040 ~ FR-045 AI 기능을 위한 React Query Hooks
 */

/**
 * FR-040: 이슈 요약 생성
 */
export function useGenerateSummary(projectId: string, issueId: string) {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/projects/${projectId}/issues/${issueId}/ai/summary`,
        {
          method: 'POST',
        }
      )

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error?.message || 'AI 요약 생성에 실패했습니다')
      }

      const data = await res.json()
      return data.summary
    },
    onSuccess: () => {
      toast.success('AI 요약이 생성되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * FR-041: 해결 전략 제안
 */
export function useGenerateSuggestion(projectId: string, issueId: string) {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/projects/${projectId}/issues/${issueId}/ai/suggestion`,
        {
          method: 'POST',
        }
      )

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error?.message || 'AI 제안 생성에 실패했습니다')
      }

      const data = await res.json()
      return data.suggestion
    },
    onSuccess: () => {
      toast.success('AI 해결 전략이 생성되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * FR-043: 라벨 추천 (기존 이슈용)
 */
export function useRecommendLabels(projectId: string, issueId: string) {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/projects/${projectId}/issues/${issueId}/ai/labels`,
        {
          method: 'POST',
        }
      )

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error?.message || 'AI 라벨 추천에 실패했습니다')
      }

      const data = await res.json()
      return data.labels
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * FR-043: 라벨 추천 (이슈 생성 전용 - title/description 직접 전달)
 */
export function useRecommendLabelsForNewIssue(projectId: string) {
  return useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      const res = await fetch(`/api/projects/${projectId}/ai/recommend-labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error?.message || 'AI 라벨 추천에 실패했습니다')
      }

      const result = await res.json()
      return result.labels as string[]
    },
    onSuccess: () => {
      toast.success('AI가 라벨을 추천했습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * FR-044: 중복 이슈 탐지
 */
export function useDetectDuplicates(projectId: string) {
  return useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      const res = await fetch(`/api/projects/${projectId}/issues/ai/duplicates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error?.message || 'AI 중복 탐지에 실패했습니다')
      }

      const result = await res.json()
      return result.duplicates
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * FR-045: 댓글 요약
 */
export function useSummarizeComments(projectId: string, issueId: string) {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/projects/${projectId}/issues/${issueId}/ai/comments`,
        {
          method: 'POST',
        }
      )

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error?.message || 'AI 댓글 요약에 실패했습니다')
      }

      const data = await res.json()
      return data.summary
    },
    onSuccess: () => {
      toast.success('AI 댓글 요약이 생성되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
