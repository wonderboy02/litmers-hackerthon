'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/app/lib/toast'
import type { Database } from '@/types/supabase'

type Team = Database['public']['Tables']['teams']['Row']
type TeamMember = Database['public']['Tables']['team_members']['Row'] & {
  users?: {
    id: string
    name: string
    email: string
    profile_image: string | null
  }
}
type TeamActivityLog = Database['public']['Tables']['team_activity_logs']['Row']

interface CreateTeamData {
  name: string
  description?: string
}

interface UpdateTeamData {
  name: string
  description?: string
}

interface InviteMemberData {
  email: string
  role: 'ADMIN' | 'MEMBER'
}

interface ChangeRoleData {
  userId: string
  newRole: 'OWNER' | 'ADMIN' | 'MEMBER'
}

/**
 * useTeams Hook
 * 사용자가 속한 팀 목록 조회
 */
export function useTeams() {
  return useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await fetch('/api/teams')
      if (!res.ok) throw new Error('팀 목록 조회 실패')
      const data = await res.json()
      return data.teams
    },
  })
}

/**
 * useCreateTeam Hook
 * 팀 생성 mutation
 */
export function useCreateTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTeamData) => {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '팀 생성 실패')
      }

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      toast.success('팀이 생성되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * useUpdateTeam Hook
 * 팀 정보 수정 mutation
 */
export function useUpdateTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ teamId, data }: { teamId: string; data: UpdateTeamData }) => {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '팀 정보 수정 실패')
      }

      return res.json()
    },
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['team', teamId] })
      toast.success('팀 정보가 수정되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * useDeleteTeam Hook
 * 팀 삭제 mutation
 */
export function useDeleteTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (teamId: string) => {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '팀 삭제 실패')
      }

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      toast.success('팀이 삭제되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * useInviteTeamMember Hook
 * 팀 멤버 초대 mutation
 */
export function useInviteTeamMember() {
  return useMutation({
    mutationFn: async ({ teamId, data }: { teamId: string; data: InviteMemberData }) => {
      const res = await fetch(`/api/teams/${teamId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '초대 실패')
      }

      return res.json()
    },
    onSuccess: () => {
      toast.success('초대 이메일이 발송되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * useKickTeamMember Hook
 * 팀 멤버 강제 퇴장 mutation
 */
export function useKickTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      const res = await fetch(`/api/teams/${teamId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '멤버 퇴장 실패')
      }

      return res.json()
    },
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId, 'members'] })
      toast.success('멤버가 퇴장되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * useLeaveTeam Hook
 * 팀 탈퇴 mutation
 */
export function useLeaveTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (teamId: string) => {
      const res = await fetch(`/api/teams/${teamId}/leave`, {
        method: 'POST',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '팀 탈퇴 실패')
      }

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      toast.success('팀에서 탈퇴했습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * useChangeTeamMemberRole Hook
 * 팀 멤버 역할 변경 mutation
 */
export function useChangeTeamMemberRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ teamId, data }: { teamId: string; data: ChangeRoleData }) => {
      const res = await fetch(`/api/teams/${teamId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '역할 변경 실패')
      }

      return res.json()
    },
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId, 'members'] })
      toast.success('역할이 변경되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * useTeamDetails Hook
 * 특정 팀의 상세 정보 조회
 */
export function useTeamDetails(teamId: string | null) {
  return useQuery<Team | null>({
    queryKey: ['team', teamId],
    queryFn: async () => {
      if (!teamId) return null

      const res = await fetch(`/api/teams/${teamId}`)
      if (!res.ok) throw new Error('팀 정보 조회 실패')

      const data = await res.json()
      return data.team
    },
    enabled: !!teamId,
  })
}

/**
 * useTeam Hook
 * useTeamDetails의 별칭 (더 짧고 직관적)
 */
export const useTeam = useTeamDetails

/**
 * useTeamMembers Hook
 * 팀 멤버 목록 조회
 */
export function useTeamMembers(teamId: string | null) {
  return useQuery<TeamMember[]>({
    queryKey: ['team', teamId, 'members'],
    queryFn: async () => {
      if (!teamId) return []

      const res = await fetch(`/api/teams/${teamId}/members`)
      if (!res.ok) throw new Error('멤버 목록 조회 실패')

      const data = await res.json()
      return data.members
    },
    enabled: !!teamId,
  })
}

/**
 * useTeamActivityLogs Hook
 * 팀 활동 로그 조회
 */
export function useTeamActivityLogs(teamId: string | null, limit = 50) {
  return useQuery<TeamActivityLog[]>({
    queryKey: ['team', teamId, 'activity-logs', limit],
    queryFn: async () => {
      if (!teamId) return []

      const res = await fetch(`/api/teams/${teamId}/activity-logs?limit=${limit}`)
      if (!res.ok) throw new Error('활동 로그 조회 실패')

      const data = await res.json()
      return data.logs
    },
    enabled: !!teamId,
  })
}

/**
 * useInvitationDetails Hook
 * 토큰으로 초대 정보 조회
 */
export function useInvitationDetails(token: string | null) {
  return useQuery({
    queryKey: ['invitation', token],
    queryFn: async () => {
      if (!token) return null

      const res = await fetch(`/api/invites/${token}`)
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '초대 정보 조회 실패')
      }

      return res.json()
    },
    enabled: !!token,
  })
}

/**
 * useAcceptInvitation Hook
 * 초대 수락 mutation
 */
export function useAcceptInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (token: string) => {
      const res = await fetch(`/api/invites/${token}`, {
        method: 'POST',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '초대 수락 실패')
      }

      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      toast.success(data.message || '팀에 가입되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * useMyInvitations Hook
 * 현재 사용자에게 온 초대 목록 조회
 */
export function useMyInvitations() {
  return useQuery({
    queryKey: ['invitations', 'my'],
    queryFn: async () => {
      const res = await fetch('/api/invites')
      if (!res.ok) throw new Error('초대 목록 조회 실패')

      const data = await res.json()
      return data.invitations
    },
  })
}
