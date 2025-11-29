import { NextRequest } from 'next/server'
import { dashboardService } from '@/app/lib/services/dashboard.service'
import { createErrorResponse } from '@/app/lib/errors'
import { supabase } from '@/app/lib/supabase'

/**
 * GET /api/dashboard/teams/[teamId]?days=30
 * FR-082: 팀 통계
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const statistics = await dashboardService.getTeamStatistics(
      params.teamId,
      user.id,
      days
    )

    return Response.json(statistics)
  } catch (error) {
    return createErrorResponse(error)
  }
}
