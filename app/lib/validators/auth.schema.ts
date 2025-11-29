import { z } from 'zod'

/**
 * 회원가입 스키마
 * FR-001: 회원가입
 */
export const signupSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다').max(255),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다').max(100),
  name: z.string().min(1, '이름을 입력해주세요').max(50),
})

export type SignupInput = z.infer<typeof signupSchema>

/**
 * 로그인 스키마
 * FR-002: 로그인
 */
export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

export type LoginInput = z.infer<typeof loginSchema>

/**
 * 비밀번호 재설정 요청 스키마
 * FR-003: 비밀번호 재설정 (요청)
 */
export const resetPasswordRequestSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
})

export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>

/**
 * 비밀번호 재설정 스키마
 * FR-003: 비밀번호 재설정 (실행)
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, '토큰이 필요합니다'),
  newPassword: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다').max(100),
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

/**
 * 프로필 수정 스키마
 * FR-005: 프로필 관리
 */
export const updateProfileSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(50).optional(),
  profileImage: z.string().url('올바른 URL 형식이 아닙니다').optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

/**
 * 비밀번호 변경 스키마
 * FR-006: 비밀번호 변경
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요'),
    newPassword: z.string().min(6, '새 비밀번호는 최소 6자 이상이어야 합니다').max(100),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '새 비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
