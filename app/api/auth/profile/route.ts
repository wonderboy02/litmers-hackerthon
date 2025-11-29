import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { updateProfileSchema } from '@/app/lib/validators/auth.schema'
import { createErrorResponse, AuthError } from '@/app/lib/errors'

/**
 * PATCH /api/auth/profile
 * FR-005: 프로필 수정
 *
 * Body: { name?: string, profileImage?: string }
 */
export async function PATCH(request: NextRequest) {
  try {
    // 현재 사용자 확인
    const currentUser = await authService.getCurrentUser()
    if (!currentUser) {
      throw new AuthError('인증이 필요합니다')
    }

    const body = await request.json()

    // Zod 스키마 검증
    const validated = updateProfileSchema.parse(body)

    // 프로필 수정
    const updatedUser = await authService.updateProfile(currentUser.id, {
      name: validated.name,
      profileImage: validated.profileImage,
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
