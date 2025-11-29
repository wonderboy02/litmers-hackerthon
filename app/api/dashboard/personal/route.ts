import { NextRequest } from 'next/server'
import { dashboardService } from '@/app/lib/services/dashboard.service'
import { createErrorResponse } from '@/app/lib/errors'
import { supabase } from '@/app/lib/supabase'

/**
 * GET /api/dashboard/personal
 * FR-081: 개인 대시보드
 */
export async function GET(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dashboard = await dashboardService.getPersonalDashboard(user.id)

    return Response.json(dashboard)
  } catch (error) {
    return createErrorResponse(error)
  }
}
