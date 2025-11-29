import { NextRequest } from 'next/server'
import { issueService } from '@/app/lib/services/issue.service'
import { moveIssueSchema } from '@/app/lib/validators/issue.schema'
import { createErrorResponse } from '@/app/lib/errors'
import { createClient } from '@/app/lib/supabase/server'

/**
 * POST /api/projects/[projectId]/issues/[issueId]/move
 * FR-033: 이슈 상태 변경 및 이동 (Drag & Drop)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; issueId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = moveIssueSchema.parse(body)

    const issue = await issueService.moveIssue(
      params.issueId,
      user.id,
      validated
    )

    return Response.json(issue)
  } catch (error) {
    return createErrorResponse(error)
  }
}
