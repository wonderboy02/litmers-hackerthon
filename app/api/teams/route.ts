import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { teamService } from '@/app/lib/services/team.service'
import { createTeamSchema } from '@/app/lib/validators/team.schema'
import { createErrorResponse } from '@/app/lib/errors'
import { z } from 'zod'

/**
 * POST /api/teams
 * FR-010: 팀 생성
 */
export async function POST(request: NextRequest) {
  try {
    const user = await authService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createTeamSchema.parse(body)

    const team = await teamService.createTeam(user.id, validated.name, validated.description)

    return NextResponse.json({
      success: true,
      team,
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

/**
 * GET /api/teams
 * 사용자가 속한 팀 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const user = await authService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다' }, { status: 401 })
    }

    const teams = await teamService.getUserTeams(user.id)

    return NextResponse.json({
      teams,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
