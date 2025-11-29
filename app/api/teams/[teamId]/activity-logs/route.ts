import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { teamService } from '@/app/lib/services/team.service'
import { createErrorResponse } from '@/app/lib/errors'

/**
 * GET /api/teams/[teamId]/activity-logs
 * FR-019: 팀 활동 로그
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

    // Query params에서 limit 가져오기 (기본값: 50)
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const logs = await teamService.getActivityLogs(teamId, user.id, limit)

    return NextResponse.json({
      logs,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
