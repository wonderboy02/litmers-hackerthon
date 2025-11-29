import { NextRequest } from 'next/server'
import { issueService } from '@/app/lib/services/issue.service'
import { createErrorResponse } from '@/app/lib/errors'
import { supabase } from '@/app/lib/supabase'

/**
 * GET /api/projects/[projectId]/issues/[issueId]/history
 * FR-039: 이슈 변경 히스토리 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; issueId: string } }
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const history = await issueService.getIssueHistory(params.issueId, user.id)

    return Response.json(history)
  } catch (error) {
    return createErrorResponse(error)
  }
}
