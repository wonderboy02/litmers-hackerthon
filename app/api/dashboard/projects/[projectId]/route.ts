import { NextRequest } from 'next/server'
import { dashboardService } from '@/app/lib/services/dashboard.service'
import { createErrorResponse } from '@/app/lib/errors'
import { createClient } from '@/app/lib/supabase/server'

/**
 * GET /api/dashboard/projects/[projectId]
 * FR-080: 프로젝트 대시보드
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dashboard = await dashboardService.getProjectDashboard(
      params.projectId,
      user.id
    )

    return Response.json(dashboard)
  } catch (error) {
    return createErrorResponse(error)
  }
}
