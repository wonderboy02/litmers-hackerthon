import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { teamService } from '@/app/lib/services/team.service'
import { updateTeamSchema } from '@/app/lib/validators/team.schema'
import { createErrorResponse } from '@/app/lib/errors'
import { z } from 'zod'

/**
 * GET /api/teams/[teamId]
 * 팀 상세 정보 조회
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
    const team = await teamService.getTeamDetails(teamId, user.id)

    return NextResponse.json({
      team,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

/**
 * PATCH /api/teams/[teamId]
 * FR-011: 팀 정보 수정
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
    const validated = updateTeamSchema.parse(body)

    const team = await teamService.updateTeam(teamId, user.id, validated)

    return NextResponse.json({
      success: true,
      team,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return createErrorResponse(error)
  }
}

/**
 * DELETE /api/teams/[teamId]
 * FR-012: 팀 삭제
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
    await teamService.deleteTeam(teamId, user.id)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
