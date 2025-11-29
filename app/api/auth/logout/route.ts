import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { createErrorResponse } from '@/app/lib/errors'

/**
 * POST /api/auth/logout
 * FR-002: 로그아웃
 */
export async function POST(request: NextRequest) {
  try {
    await authService.logout()

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
