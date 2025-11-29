import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { signupSchema } from '@/app/lib/validators/auth.schema'
import { createErrorResponse } from '@/app/lib/errors'

/**
 * POST /api/auth/signup
 * FR-001: 회원가입
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Zod 스키마 검증
    const validated = signupSchema.parse(body)

    // 회원가입 처리
    const result = await authService.signup(
      validated.email,
      validated.password,
      validated.name
    )

    return NextResponse.json({
      success: true,
      user: result.user,
      session: result.session,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
