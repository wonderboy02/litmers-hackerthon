import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { createErrorResponse } from '@/app/lib/errors'

/**
 * GET /api/auth/me
 * 현재 로그인한 사용자 정보 조회
 */
export async function GET(request: NextRequest) {
  try {
    const user = await authService.getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
