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
}

interface UpdateTeamData {
  name: string
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
 * 팀 관리 관련 모든 기능을 제공하는 React Query Hook
 */
export function useTeams() {
  const queryClient = useQueryClient()

  // 사용자가 속한 팀 목록 조회
  const { data: teams = [], isLoading } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await fetch('/api/teams')
      if (!res.ok) throw new Error('팀 목록 조회 실패')
      const data = await res.json()
      return data.teams
    },
  })

  // 팀 생성
  const createTeamMutation = useMutation({
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

  // 팀 정보 수정
  const updateTeamMutation = useMutation({
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      toast.success('팀 정보가 수정되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // 팀 삭제
  const deleteTeamMutation = useMutation({
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

  // 멤버 초대
  const inviteMemberMutation = useMutation({
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

  // 멤버 강제 퇴장
  const kickMemberMutation = useMutation({
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

  // 팀 탈퇴
  const leaveTeamMutation = useMutation({
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

  // 역할 변경
  const changeRoleMutation = useMutation({
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

  return {
    // 상태
    teams,
    isLoading,

    // Mutations
    createTeam: createTeamMutation.mutate,
    createTeamAsync: createTeamMutation.mutateAsync,
    isCreatingTeam: createTeamMutation.isPending,

    updateTeam: updateTeamMutation.mutate,
    updateTeamAsync: updateTeamMutation.mutateAsync,
    isUpdatingTeam: updateTeamMutation.isPending,

    deleteTeam: deleteTeamMutation.mutate,
    deleteTeamAsync: deleteTeamMutation.mutateAsync,
    isDeletingTeam: deleteTeamMutation.isPending,

    inviteMember: inviteMemberMutation.mutate,
    inviteMemberAsync: inviteMemberMutation.mutateAsync,
    isInvitingMember: inviteMemberMutation.isPending,

    kickMember: kickMemberMutation.mutate,
    kickMemberAsync: kickMemberMutation.mutateAsync,
    isKickingMember: kickMemberMutation.isPending,

    leaveTeam: leaveTeamMutation.mutate,
    leaveTeamAsync: leaveTeamMutation.mutateAsync,
    isLeavingTeam: leaveTeamMutation.isPending,

    changeRole: changeRoleMutation.mutate,
    changeRoleAsync: changeRoleMutation.mutateAsync,
    isChangingRole: changeRoleMutation.isPending,
  }
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
