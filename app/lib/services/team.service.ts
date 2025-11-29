import {
  teamRepository,
  teamMemberRepository,
  teamInvitationRepository,
  teamActivityLogRepository,
} from '@/app/lib/repositories/team.repository'
import { sendTeamInvitationEmail } from '@/app/lib/email'
import { ForbiddenError, ValidationError, NotFoundError } from '@/app/lib/errors'
import { nanoid } from 'nanoid'

/**
 * Team Service
 * 팀 관리 비즈니스 로직
 */
export const teamService = {
  /**
   * FR-010: 팀 생성
   * 1. 팀 생성
   * 2. 생성자를 OWNER로 추가
   * 3. 활동 로그 기록
   */
  async createTeam(userId: string, name: string) {
    const team = await teamRepository.create({
      name,
      owner_id: userId,
    })

    // 생성자를 OWNER로 추가
    await teamMemberRepository.create(team.id, userId, 'OWNER')

    // 활동 로그
    await teamActivityLogRepository.create({
      teamId: team.id,
      actorId: userId,
      targetType: 'TEAM',
      targetId: team.id,
      actionType: 'CREATED',
    })

    return team
  },

  /**
   * FR-011: 팀 정보 수정
   * 권한: OWNER, ADMIN
   */
  async updateTeam(teamId: string, userId: string, updates: { name: string }) {
    await this.verifyPermission(teamId, userId, ['OWNER', 'ADMIN'])

    return await teamRepository.update(teamId, updates)
  },

  /**
   * FR-012: 팀 삭제
   * 권한: OWNER만 가능
   */
  async deleteTeam(teamId: string, userId: string) {
    await this.verifyPermission(teamId, userId, ['OWNER'])

    // Soft Delete (하위 프로젝트, 이슈도 Cascade로 자동 삭제됨)
    await teamRepository.softDelete(teamId)

    return { success: true }
  },

  /**
   * FR-013: 팀 멤버 초대
   * 권한: OWNER, ADMIN
   * 1. 권한 검증
   * 2. 기존 초대 확인 (있으면 재발송)
   * 3. 이메일 발송
   */
  async inviteMember(
    teamId: string,
    inviterId: string,
    email: string,
    role: 'ADMIN' | 'MEMBER' = 'MEMBER'
  ) {
    await this.verifyPermission(teamId, inviterId, ['OWNER', 'ADMIN'])

    const team = await teamRepository.findById(teamId)
    if (!team) throw new NotFoundError('팀을 찾을 수 없습니다')

    // 기존 초대 확인
    const existing = await teamInvitationRepository.findPending(teamId, email)

    let token: string

    if (existing) {
      // 재발송 (만료일 갱신)
      await teamInvitationRepository.updateExpiry(existing.id)
      token = existing.token
    } else {
      // 신규 초대
      token = nanoid(32)
      await teamInvitationRepository.create(teamId, email, inviterId, token)
    }

    // 이메일 발송
    const inviter = await this.getInviterName(inviterId)
    await sendTeamInvitationEmail(email, team.name, inviter, token)

    return { success: true }
  },

  /**
   * FR-014: 팀 멤버 조회
   * 권한: 팀 멤버면 누구나
   */
  async getMembers(teamId: string, userId: string) {
    await this.verifyMembership(teamId, userId)

    return await teamMemberRepository.findMembers(teamId)
  },

  /**
   * FR-015: 팀 멤버 강제 퇴장
   * 권한:
   * - OWNER: 모든 멤버 강제 퇴장 가능
   * - ADMIN: MEMBER만 강제 퇴장 가능
   */
  async kickMember(teamId: string, requesterId: string, targetUserId: string) {
    const requesterMember = await teamMemberRepository.findMember(teamId, requesterId)
    const targetMember = await teamMemberRepository.findMember(teamId, targetUserId)

    if (!requesterMember || !targetMember) {
      throw new NotFoundError('멤버를 찾을 수 없습니다')
    }

    // 권한 검증
    if (requesterMember.role === 'OWNER') {
      // OWNER는 모든 멤버 강제 퇴장 가능
    } else if (requesterMember.role === 'ADMIN') {
      // ADMIN은 MEMBER만 강제 퇴장 가능
      if (targetMember.role !== 'MEMBER') {
        throw new ForbiddenError('MEMBER만 강제 퇴장할 수 있습니다')
      }
    } else {
      throw new ForbiddenError('권한이 없습니다')
    }

    // OWNER 본인은 강제 퇴장 불가
    if (targetMember.role === 'OWNER') {
      throw new ValidationError('OWNER는 강제 퇴장할 수 없습니다')
    }

    await teamMemberRepository.remove(teamId, targetUserId)

    // 활동 로그
    await teamActivityLogRepository.create({
      teamId,
      actorId: requesterId,
      targetType: 'MEMBER',
      targetId: targetUserId,
      actionType: 'KICKED',
    })

    return { success: true }
  },

  /**
   * FR-016: 팀 탈퇴
   * OWNER는 탈퇴 불가 (팀 삭제 또는 소유권 이전 필요)
   */
  async leaveTeam(teamId: string, userId: string) {
    const member = await teamMemberRepository.findMember(teamId, userId)
    if (!member) throw new NotFoundError('멤버를 찾을 수 없습니다')

    // OWNER는 탈퇴 불가
    if (member.role === 'OWNER') {
      throw new ValidationError(
        'OWNER는 탈퇴할 수 없습니다. 팀을 삭제하거나 소유권을 이전해주세요'
      )
    }

    await teamMemberRepository.remove(teamId, userId)

    // 활동 로그
    await teamActivityLogRepository.create({
      teamId,
      actorId: userId,
      targetType: 'MEMBER',
      targetId: userId,
      actionType: 'LEFT',
    })

    return { success: true }
  },

  /**
   * FR-018: 역할 변경
   * 권한: OWNER만 가능
   * OWNER 양도 시:
   * 1. 기존 OWNER를 ADMIN으로 강등
   * 2. 새 사용자를 OWNER로 승격
   * 3. 팀의 owner_id 변경
   */
  async changeRole(
    teamId: string,
    requesterId: string,
    targetUserId: string,
    newRole: 'OWNER' | 'ADMIN' | 'MEMBER'
  ) {
    await this.verifyPermission(teamId, requesterId, ['OWNER'])

    // OWNER 양도 시
    if (newRole === 'OWNER') {
      // 기존 OWNER를 ADMIN으로 강등
      await teamMemberRepository.updateRole(teamId, requesterId, 'ADMIN')

      // 팀 소유자 변경
      await teamRepository.update(teamId, { owner_id: targetUserId })
    }

    await teamMemberRepository.updateRole(teamId, targetUserId, newRole)

    // 활동 로그
    await teamActivityLogRepository.create({
      teamId,
      actorId: requesterId,
      targetType: 'MEMBER',
      targetId: targetUserId,
      actionType: 'ROLE_CHANGED',
      details: { newRole },
    })

    return { success: true }
  },

  /**
   * FR-019: 팀 활동 로그
   * 권한: 팀 멤버면 누구나
   */
  async getActivityLogs(teamId: string, userId: string, limit = 50) {
    await this.verifyMembership(teamId, userId)

    return await teamActivityLogRepository.findByTeam(teamId, limit)
  },

  /**
   * 사용자가 속한 팀 목록 조회
   */
  async getUserTeams(userId: string) {
    return await teamRepository.findByUserId(userId)
  },

  /**
   * 팀 상세 정보 조회
   */
  async getTeamDetails(teamId: string, userId: string) {
    await this.verifyMembership(teamId, userId)

    const team = await teamRepository.findById(teamId)
    if (!team) throw new NotFoundError('팀을 찾을 수 없습니다')

    return team
  },

  /**
   * 권한 검증 유틸
   * 지정된 역할 중 하나라도 있으면 통과
   */
  async verifyPermission(
    teamId: string,
    userId: string,
    allowedRoles: ('OWNER' | 'ADMIN' | 'MEMBER')[]
  ) {
    const member = await teamMemberRepository.findMember(teamId, userId)

    if (!member || !allowedRoles.includes(member.role)) {
      throw new ForbiddenError('권한이 없습니다')
    }

    return member
  },

  /**
   * 멤버십 검증
   * 팀 멤버인지 확인
   */
  async verifyMembership(teamId: string, userId: string) {
    const member = await teamMemberRepository.findMember(teamId, userId)

    if (!member) {
      throw new ForbiddenError('팀 멤버가 아닙니다')
    }

    return member
  },

  /**
   * 초대자 이름 조회 (이메일 발송용)
   */
  async getInviterName(inviterId: string): Promise<string> {
    // userRepository를 import할 수도 있지만, 간단하게 처리
    const supabase = await (await import('@/app/lib/supabase/server')).createClient()
    const { data } = await supabase
      .from('users')
      .select('name')
      .eq('id', inviterId)
      .single()

    return data?.name || 'Admin'
  },

  /**
   * 초대 정보 조회 (토큰 기반)
   * 초대 페이지에서 팀 정보를 표시하기 위해 사용
   */
  async getInvitationByToken(token: string) {
    const invitation = await teamInvitationRepository.findValidToken(token)
    
    if (!invitation) {
      throw new NotFoundError('초대를 찾을 수 없거나 만료되었습니다')
    }

    // 팀 정보 조회
    const team = await teamRepository.findById(invitation.team_id)
    if (!team) {
      throw new NotFoundError('팀을 찾을 수 없습니다')
    }

    // 초대자 정보 조회
    const inviterName = await this.getInviterName(invitation.inviter_id)

    return {
      invitation,
      team,
      inviterName,
    }
  },

  /**
   * FR-013: 초대 수락
   * 1. 초대 유효성 검증 (만료, 존재 여부)
   * 2. 이미 팀 멤버인지 확인
   * 3. 사용자 이메일과 초대 이메일 일치 확인
   * 4. team_members에 추가
   * 5. 초대 레코드 삭제
   * 6. 활동 로그 기록
   * 7. 알림 생성
   */
  async acceptInvitation(token: string, userId: string) {
    // 1. 초대 조회 및 검증
    const invitation = await teamInvitationRepository.findValidToken(token)
    
    if (!invitation) {
      throw new NotFoundError('초대를 찾을 수 없거나 만료되었습니다')
    }

    const { team_id: teamId, email: invitedEmail } = invitation

    // 2. 팀 존재 확인
    const team = await teamRepository.findById(teamId)
    if (!team) {
      throw new NotFoundError('팀을 찾을 수 없습니다')
    }

    // 3. 사용자 정보 조회 (이메일 확인용)
    const supabase = await (await import('@/app/lib/supabase/server')).createClient()
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (!user) {
      throw new NotFoundError('사용자를 찾을 수 없습니다')
    }

    // 4. 초대된 이메일과 현재 사용자 이메일 일치 확인
    if (user.email !== invitedEmail) {
      throw new ValidationError('초대된 이메일 주소와 일치하지 않습니다')
    }

    // 5. 이미 팀 멤버인지 확인
    const existingMember = await teamMemberRepository.findMember(teamId, userId)
    if (existingMember) {
      // 이미 멤버이면 초대만 삭제하고 성공 반환
      await teamInvitationRepository.delete(token)
      return { success: true, alreadyMember: true }
    }

    // 6. 팀 멤버로 추가 (기본 역할: MEMBER)
    await teamMemberRepository.create(teamId, userId, 'MEMBER')

    // 7. 초대 레코드 삭제
    await teamInvitationRepository.delete(token)

    // 8. 활동 로그 기록
    await teamActivityLogRepository.create({
      teamId,
      actorId: userId,
      targetType: 'MEMBER',
      targetId: userId,
      actionType: 'JOINED',
    })

    // 9. 팀 오너에게 알림 (선택사항)
    // TODO: 알림 서비스 구현 시 추가

    return { success: true, alreadyMember: false, team }
  },
}
