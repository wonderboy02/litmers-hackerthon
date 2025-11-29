import { createClient } from '@/app/lib/supabase/server'
import type { Database } from '@/types/supabase'

type Team = Database['public']['Tables']['teams']['Row']
type TeamInsert = Database['public']['Tables']['teams']['Insert']
type TeamUpdate = Database['public']['Tables']['teams']['Update']
type TeamMember = Database['public']['Tables']['team_members']['Row']
type TeamInvitation = Database['public']['Tables']['team_invitations']['Row']

/**
 * Team Repository
 * teams 테이블 데이터 접근 레이어
 */
export const teamRepository = {
  /**
   * ID로 팀 조회
   * Soft Delete된 팀은 제외
   */
  async findById(id: string): Promise<Team | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // 레코드 없음
      throw error
    }

    return data
  },

  /**
   * 사용자가 속한 팀 목록 조회
   */
  async findByUserId(userId: string): Promise<Team[]> {
    const supabase = await createClient()

    const { data, error} = await supabase
      .from('teams')
      .select(`
        *,
        team_members!inner(user_id)
      `)
      .eq('team_members.user_id', userId)
      .is('deleted_at', null)

    if (error) throw error
    return data || []
  },

  /**
   * 팀 생성
   */
  async create(team: TeamInsert): Promise<Team> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('teams')
      .insert(team)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 팀 정보 수정
   */
  async update(id: string, updates: TeamUpdate): Promise<Team> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('teams')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 팀 Soft Delete
   */
  async softDelete(id: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('teams')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  },
}

/**
 * Team Member Repository
 * team_members 테이블 데이터 접근 레이어
 */
export const teamMemberRepository = {
  /**
   * 특정 팀의 특정 멤버 조회
   */
  async findMember(teamId: string, userId: string): Promise<TeamMember | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  },

  /**
   * 팀의 모든 멤버 조회 (사용자 정보 포함)
   */
  async findMembers(teamId: string): Promise<any[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        users(id, name, email, profile_image)
      `)
      .eq('team_id', teamId)

    if (error) throw error
    return data || []
  },

  /**
   * 팀 멤버 추가
   */
  async create(teamId: string, userId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER') {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('team_members')
      .insert({ team_id: teamId, user_id: userId, role })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 멤버 역할 변경
   */
  async updateRole(teamId: string, userId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER') {
    const supabase = await createClient()

    const { error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('team_id', teamId)
      .eq('user_id', userId)

    if (error) throw error
  },

  /**
   * 팀 멤버 제거
   */
  async remove(teamId: string, userId: string) {
    const supabase = await createClient()

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId)

    if (error) throw error
  },
}

/**
 * Team Invitation Repository
 * team_invitations 테이블 데이터 접근 레이어
 */
export const teamInvitationRepository = {
  /**
   * 초대 생성
   */
  async create(teamId: string, email: string, inviterId: string, token: string) {
    const supabase = await createClient()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일 후

    const { data, error } = await supabase
      .from('team_invitations')
      .insert({
        team_id: teamId,
        email,
        inviter_id: inviterId,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 유효한 토큰 조회
   */
  async findValidToken(token: string): Promise<TeamInvitation | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('token', token)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  },

  /**
   * 대기 중인 초대 조회 (팀 + 이메일)
   */
  async findPending(teamId: string, email: string): Promise<TeamInvitation | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('team_id', teamId)
      .eq('email', email)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  },

  /**
   * 초대 만료일 갱신
   */
  async updateExpiry(id: string) {
    const supabase = await createClient()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일 후

    const { error } = await supabase
      .from('team_invitations')
      .update({ expires_at: expiresAt.toISOString() })
      .eq('id', id)

    if (error) throw error
  },

  /**
   * 토큰 삭제 (사용 후)
   */
  async delete(token: string) {
    const supabase = await createClient()

    const { error } = await supabase
      .from('team_invitations')
      .delete()
      .eq('token', token)

    if (error) throw error
  },
}

/**
 * Team Activity Log Repository
 * team_activity_logs 테이블 데이터 접근 레이어
 */
export const teamActivityLogRepository = {
  /**
   * 활동 로그 생성
   */
  async create(log: {
    teamId: string
    actorId: string | null
    targetType: string
    targetId: string | null
    actionType: string
    details?: any
  }) {
    const supabase = await createClient()

    const { error } = await supabase.from('team_activity_logs').insert({
      team_id: log.teamId,
      actor_id: log.actorId,
      target_type: log.targetType,
      target_id: log.targetId,
      action_type: log.actionType,
      details: log.details,
    })

    if (error) throw error
  },

  /**
   * 팀의 활동 로그 조회
   */
  async findByTeam(teamId: string, limit = 50) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('team_activity_logs')
      .select(`
        *,
        actor:users(name, profile_image)
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },
}
