import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { changePasswordSchema } from '@/app/lib/validators/auth.schema'
import { createErrorResponse, AuthError } from '@/app/lib/errors'

/**
 * POST /api/auth/change-password
 * FR-006: 비밀번호 변경
 *
 * Body: { currentPassword: string, newPassword: string, confirmPassword: string }
 */
export async function POST(request: NextRequest) {
  try {
    // 현재 사용자 확인
    const currentUser = await authService.getCurrentUser()
    if (!currentUser) {
      throw new AuthError('인증이 필요합니다')
    }

    const body = await request.json()

    // Zod 스키마 검증
    const validated = changePasswordSchema.parse(body)

    // 비밀번호 변경
    await authService.changePassword(
      currentUser.id,
      validated.currentPassword,
      validated.newPassword
    )

    return NextResponse.json({
      success: true,
      message: '비밀번호가 변경되었습니다',
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
