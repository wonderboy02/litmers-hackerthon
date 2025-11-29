import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { teamService } from '@/app/lib/services/team.service'
import { inviteMemberSchema } from '@/app/lib/validators/team.schema'
import { createErrorResponse } from '@/app/lib/errors'
import { z } from 'zod'

/**
 * POST /api/teams/[teamId]/invite
 * FR-013: 팀 멤버 초대
 */
export async function POST(
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
    const validated = inviteMemberSchema.parse(body)

    await teamService.inviteMember(
      teamId,
      user.id,
      validated.email,
      validated.role
    )

    return NextResponse.json({
      success: true,
      message: '초대 이메일이 발송되었습니다',
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
