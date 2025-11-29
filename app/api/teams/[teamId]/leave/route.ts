import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { teamService } from '@/app/lib/services/team.service'
import { createErrorResponse } from '@/app/lib/errors'

/**
 * POST /api/teams/[teamId]/leave
 * FR-016: 팀 탈퇴
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
    await teamService.leaveTeam(teamId, user.id)

    return NextResponse.json({
      success: true,
      message: '팀에서 탈퇴했습니다',
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
