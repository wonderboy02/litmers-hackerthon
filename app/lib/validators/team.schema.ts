import { z } from 'zod'

// FR-010: 팀 생성
export const createTeamSchema = z.object({
  name: z.string().min(1, '팀 이름을 입력해주세요').max(50),
  description: z.string().max(500).optional()
})

// FR-011: 팀 정보 수정
export const updateTeamSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(500).optional()
})

// FR-013: 팀 멤버 초대
export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER')
})

// FR-018: 역할 변경
export const changeRoleSchema = z.object({
  userId: z.string().uuid(),
  newRole: z.enum(['OWNER', 'ADMIN', 'MEMBER'])
})

// Type exports
export type CreateTeamInput = z.infer<typeof createTeamSchema>
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>
