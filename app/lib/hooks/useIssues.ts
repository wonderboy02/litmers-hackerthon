'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/app/lib/toast'
import type { CreateIssueInput, UpdateIssueInput, MoveIssueInput, IssueFilterInput } from '@/app/lib/validators/issue.schema'

/**
 * 이슈 관련 React Query Hooks
 */

/**
 * 이슈 상세 조회
 */
export function useIssue(projectId: string, issueId: string) {
  return useQuery({
    queryKey: ['issues', issueId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/issues/${issueId}`)
      if (!res.ok) throw new Error('이슈를 불러오는데 실패했습니다')
      return res.json()
    },
    enabled: !!issueId
  })
}

/**
 * 프로젝트의 이슈 목록 조회 (검색/필터링)
 */
export function useIssues(projectId: string, filters?: IssueFilterInput) {
  return useQuery({
    queryKey: ['issues', projectId, filters],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (filters?.search) params.append('search', filters.search)
      if (filters?.stateIds) params.append('stateIds', filters.stateIds.join(','))
      if (filters?.assigneeIds) params.append('assigneeIds', filters.assigneeIds.join(','))
      if (filters?.priorities) params.append('priorities', filters.priorities.join(','))
      if (filters?.labelIds) params.append('labelIds', filters.labelIds.join(','))
      if (filters?.hasDueDate !== undefined) params.append('hasDueDate', filters.hasDueDate.toString())
      if (filters?.dueDateFrom) params.append('dueDateFrom', filters.dueDateFrom)
      if (filters?.dueDateTo) params.append('dueDateTo', filters.dueDateTo)

      const res = await fetch(`/api/projects/${projectId}/issues?${params}`)
      if (!res.ok) throw new Error('이슈 목록을 불러오는데 실패했습니다')
      return res.json()
    },
    enabled: !!projectId
  })
}

/**
 * 이슈 생성
 */
export function useCreateIssue(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateIssueInput) => {
      console.log('🚀 이슈 생성 요청:', data)
      const res = await fetch(`/api/projects/${projectId}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      console.log('📡 API 응답 상태:', res.status, res.ok)
      if (!res.ok) {
        const error = await res.json()
        console.error('❌ API 에러:', error)
        throw new Error(error.message || '이슈 생성에 실패했습니다')
      }
      const result = await res.json()
      console.log('✅ 이슈 생성 성공:', result)
      return result
    },
    onSuccess: (data) => {
      console.log('🎉 onSuccess 호출됨:', data)
      console.log('🔄 캐시 무효화 시작...')
      queryClient.invalidateQueries({ queryKey: ['issues', projectId] })
      queryClient.invalidateQueries({ queryKey: ['kanban', projectId] })
      console.log('✨ 토스트 표시...')
      toast.success('이슈가 생성되었습니다')
    },
    onError: (error: Error) => {
      console.error('💥 onError 호출됨:', error)
      toast.error(error.message)
    }
  })
}

/**
 * 이슈 수정
 */
export function useUpdateIssue(projectId: string, issueId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateIssueInput) => {
      const res = await fetch(`/api/projects/${projectId}/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || '이슈 수정에 실패했습니다')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId] })
      queryClient.invalidateQueries({ queryKey: ['issues', projectId] })
      queryClient.invalidateQueries({ queryKey: ['kanban', projectId] })
      toast.success('이슈가 수정되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * 이슈 이동 (Drag & Drop)
 */
export function useMoveIssue(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ issueId, ...data }: MoveIssueInput & { issueId: string }) => {
      const res = await fetch(`/api/projects/${projectId}/issues/${issueId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || '이슈 이동에 실패했습니다')
      }
      return res.json()
    },
    onMutate: async (variables) => {
      // Optimistic Update
      await queryClient.cancelQueries({ queryKey: ['issues', projectId] })

      const previousIssues = queryClient.getQueryData(['issues', projectId])

      // 낙관적 업데이트 (UI 즉시 반영)
      queryClient.setQueryData(['issues', projectId], (old: any) => {
        if (!old) return old
        return old.map((issue: any) =>
          issue.id === variables.issueId
            ? { ...issue, state_id: variables.newStateId }
            : issue
        )
      })

      return { previousIssues }
    },
    onError: (error: Error, variables, context) => {
      // 에러 시 롤백
      if (context?.previousIssues) {
        queryClient.setQueryData(['issues', projectId], context.previousIssues)
      }
      toast.error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', projectId] })
      queryClient.invalidateQueries({ queryKey: ['kanban', projectId] })
    }
  })
}

/**
 * 이슈 삭제
 */
export function useDeleteIssue(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (issueId: string) => {
      const res = await fetch(`/api/projects/${projectId}/issues/${issueId}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || '이슈 삭제에 실패했습니다')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', projectId] })
      queryClient.invalidateQueries({ queryKey: ['kanban', projectId] })
      toast.success('이슈가 삭제되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * 이슈 히스토리 조회
 */
export function useIssueHistory(projectId: string, issueId: string) {
  return useQuery({
    queryKey: ['issues', issueId, 'history'],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/issues/${issueId}/history`)
      if (!res.ok) throw new Error('히스토리를 불러오는데 실패했습니다')
      return res.json()
    },
    enabled: !!issueId
  })
}

/**
 * 서브태스크 생성
 */
export function useCreateSubtask(projectId: string, issueId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch(`/api/projects/${projectId}/issues/${issueId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || '서브태스크 생성에 실패했습니다')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId] })
      toast.success('서브태스크가 추가되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * 서브태스크 수정
 */
export function useUpdateSubtask(projectId: string, issueId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ subtaskId, ...data }: { subtaskId: string; title?: string; isCompleted?: boolean }) => {
      const res = await fetch(`/api/projects/${projectId}/issues/${issueId}/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || '서브태스크 수정에 실패했습니다')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * 서브태스크 삭제
 */
export function useDeleteSubtask(projectId: string, issueId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (subtaskId: string) => {
      const res = await fetch(`/api/projects/${projectId}/issues/${issueId}/subtasks/${subtaskId}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || '서브태스크 삭제에 실패했습니다')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId] })
      toast.success('서브태스크가 삭제되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}
