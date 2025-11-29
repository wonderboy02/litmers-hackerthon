import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { loginSchema } from '@/app/lib/validators/auth.schema'
import { createErrorResponse } from '@/app/lib/errors'

/**
 * POST /api/auth/login
 * FR-002: 로그인
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Zod 스키마 검증
    const validated = loginSchema.parse(body)

    // 로그인 처리
    const result = await authService.login(validated.email, validated.password)

    return NextResponse.json({
      success: true,
      user: result.user,
      session: result.session,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
