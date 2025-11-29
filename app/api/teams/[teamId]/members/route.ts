import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { teamService } from '@/app/lib/services/team.service'
import { createErrorResponse } from '@/app/lib/errors'

/**
 * GET /api/teams/[teamId]/members
 * FR-014: 팀 멤버 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const user = await authService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다' }, { status: 401 })
    }

    const { teamId } = await params
    const members = await teamService.getMembers(teamId, user.id)

    return NextResponse.json({
      members,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

/**
 * DELETE /api/teams/[teamId]/members
 * FR-015: 팀 멤버 강제 퇴장
 * Body: { userId: string }
 */
export async function DELETE(
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
    const { userId: targetUserId } = body

    if (!targetUserId) {
      return NextResponse.json(
        { error: '퇴장시킬 사용자 ID가 필요합니다' },
        { status: 400 }
      )
    }

    await teamService.kickMember(teamId, user.id, targetUserId)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
