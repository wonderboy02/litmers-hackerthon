import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import {
  resetPasswordRequestSchema,
  resetPasswordSchema,
} from '@/app/lib/validators/auth.schema'
import { createErrorResponse } from '@/app/lib/errors'

/**
 * POST /api/auth/reset-password
 * FR-003: 비밀번호 재설정 요청
 *
 * Body: { email: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Zod 스키마 검증
    const validated = resetPasswordRequestSchema.parse(body)

    // 비밀번호 재설정 이메일 발송
    await authService.requestPasswordReset(validated.email)

    return NextResponse.json({
      success: true,
      message: '비밀번호 재설정 이메일이 발송되었습니다',
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

/**
 * PUT /api/auth/reset-password
 * FR-003: 비밀번호 재설정 실행
 *
 * Body: { token: string, newPassword: string }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Zod 스키마 검증
    const validated = resetPasswordSchema.parse(body)

    // 비밀번호 재설정 실행
    await authService.resetPassword(validated.token, validated.newPassword)

    return NextResponse.json({
      success: true,
      message: '비밀번호가 재설정되었습니다',
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
