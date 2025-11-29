'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/app/lib/toast'
import type {
  CreateProjectInput,
  UpdateProjectInput,
  CreateCustomStateInput,
  CreateLabelInput,
} from '@/app/lib/validators/project.schema'

/**
 * 프로젝트 관련 React Query Hooks
 */

/**
 * 팀의 프로젝트 목록 조회
 * FR-021
 */
export function useProjects(teamId: string, includeArchived: boolean = false) {
  return useQuery({
    queryKey: ['projects', teamId, includeArchived],
    queryFn: async () => {
      const params = new URLSearchParams({
        teamId,
        includeArchived: includeArchived.toString(),
      })
      const res = await fetch(`/api/projects?${params}`)
      if (!res.ok) throw new Error('프로젝트 목록을 불러오는데 실패했습니다')
      const data = await res.json()
      return data.projects
    },
    enabled: !!teamId,
  })
}

/**
 * 프로젝트 상세 조회
 * FR-022
 */
export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`)
      if (!res.ok) throw new Error('프로젝트를 불러오는데 실패했습니다')
      const data = await res.json()
      return data.project
    },
    enabled: !!projectId,
  })
}

/**
 * 프로젝트 생성
 * FR-020
 * ⭐ 기본 상태 3개 자동 생성됨 (Backlog, In Progress, Done)
 */
export function useCreateProject(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateProjectInput & { teamId: string }) => {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '프로젝트 생성에 실패했습니다')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', teamId] })
      toast.success('프로젝트가 생성되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * 프로젝트 수정
 * FR-023
 */
export function useUpdateProject(projectId: string, teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateProjectInput) => {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '프로젝트 수정에 실패했습니다')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects', teamId] })
      toast.success('프로젝트가 수정되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * 프로젝트 삭제
 * FR-025
 */
export function useDeleteProject(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (projectId: string) => {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '프로젝트 삭제에 실패했습니다')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', teamId] })
      toast.success('프로젝트가 삭제되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * 프로젝트 아카이브
 * FR-026
 */
export function useArchiveProject(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ projectId, archive }: { projectId: string; archive: boolean }) => {
      const res = await fetch(`/api/projects/${projectId}/archive`, {
        method: archive ? 'POST' : 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '아카이브 처리에 실패했습니다')
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects', teamId] })
      toast.success(variables.archive ? '프로젝트가 아카이브되었습니다' : '아카이브가 해제되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * 즐겨찾기 토글
 * FR-027
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ projectId, isFavorite }: { projectId: string; isFavorite: boolean }) => {
      const res = await fetch(`/api/projects/${projectId}/favorite`, {
        method: isFavorite ? 'DELETE' : 'POST',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '즐겨찾기 처리에 실패했습니다')
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success(variables.isFavorite ? '즐겨찾기가 해제되었습니다' : '즐겨찾기에 추가되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * 프로젝트 상태(칸반 컬럼) 목록 조회
 */
export function useProjectStates(projectId: string) {
  return useQuery({
    queryKey: ['project-states', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/states`)
      if (!res.ok) throw new Error('프로젝트 상태를 불러오는데 실패했습니다')
      const data = await res.json()
      return data.states
    },
    enabled: !!projectId,
  })
}

/**
 * 커스텀 상태 생성
 * FR-053
 */
export function useCreateState(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCustomStateInput) => {
      const res = await fetch(`/api/projects/${projectId}/states`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '상태 생성에 실패했습니다')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-states', projectId] })
      toast.success('상태가 생성되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * 프로젝트 라벨 목록 조회
 */
export function useProjectLabels(projectId: string) {
  return useQuery({
    queryKey: ['project-labels', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/labels`)
      if (!res.ok) throw new Error('라벨을 불러오는데 실패했습니다')
      const data = await res.json()
      return data.labels
    },
    enabled: !!projectId,
  })
}

/**
 * 라벨 생성
 * FR-038
 */
export function useCreateLabel(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateLabelInput) => {
      const res = await fetch(`/api/projects/${projectId}/labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '라벨 생성에 실패했습니다')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-labels', projectId] })
      toast.success('라벨이 생성되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
