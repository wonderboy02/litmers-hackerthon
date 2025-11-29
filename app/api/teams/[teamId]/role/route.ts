import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { teamService } from '@/app/lib/services/team.service'
import { changeRoleSchema } from '@/app/lib/validators/team.schema'
import { createErrorResponse } from '@/app/lib/errors'
import { z } from 'zod'

/**
 * PATCH /api/teams/[teamId]/role
 * FR-018: 역할 변경
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const user = await authService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다' }, { status: 401 })
    }

    const { teamId } = await params
    const body = await request.json()
    const validated = changeRoleSchema.parse(body)

    await teamService.changeRole(
      teamId,
      user.id,
      validated.userId,
      validated.newRole
    )

    return NextResponse.json({
      success: true,
      message: '역할이 변경되었습니다',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    return createErrorResponse(error)
  }
}
