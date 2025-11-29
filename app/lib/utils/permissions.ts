/**
 * 권한 검증 유틸리티
 */

export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER'

/**
 * 특정 역할이 허용된 역할 목록에 포함되는지 확인
 */
export function hasPermission(userRole: TeamRole, allowedRoles: TeamRole[]): boolean {
  return allowedRoles.includes(userRole)
}

/**
 * OWNER 권한 확인
 */
export function isOwner(role: TeamRole): boolean {
  return role === 'OWNER'
}

/**
 * ADMIN 이상 권한 확인 (OWNER 또는 ADMIN)
 */
export function isAdminOrAbove(role: TeamRole): boolean {
  return role === 'OWNER' || role === 'ADMIN'
}

/**
 * 강제 퇴장 권한 확인
 * - OWNER: 모든 멤버 강제 퇴장 가능
 * - ADMIN: MEMBER만 강제 퇴장 가능
 */
export function canKickMember(requesterRole: TeamRole, targetRole: TeamRole): boolean {
  if (requesterRole === 'OWNER') {
    return targetRole !== 'OWNER' // OWNER는 자신을 강제 퇴장할 수 없음
  }
  if (requesterRole === 'ADMIN') {
    return targetRole === 'MEMBER'
  }
  return false
}

/**
 * 역할 변경 권한 확인 (OWNER만 가능)
 */
export function canChangeRole(requesterRole: TeamRole): boolean {
  return requesterRole === 'OWNER'
}
