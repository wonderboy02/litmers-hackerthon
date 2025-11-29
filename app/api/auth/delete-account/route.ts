import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { createErrorResponse, AuthError } from '@/app/lib/errors'

/**
 * DELETE /api/auth/delete-account
 * FR-007: 계정 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    // 현재 사용자 확인
    const currentUser = await authService.getCurrentUser()
    if (!currentUser) {
      throw new AuthError('인증이 필요합니다')
    }

    // 계정 삭제
    await authService.deleteAccount(currentUser.id)

    return NextResponse.json({
      success: true,
      message: '계정이 삭제되었습니다',
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
