import { NextRequest } from 'next/server'
import { issueService } from '@/app/lib/services/issue.service'
import { createSubtaskSchema } from '@/app/lib/validators/issue.schema'
import { createErrorResponse } from '@/app/lib/errors'
import { createClient } from '@/app/lib/supabase/server'

/**
 * POST /api/projects/[projectId]/issues/[issueId]/subtasks
 * FR-039-2: 서브태스크 생성
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
    const validated = createSubtaskSchema.parse(body)

    const subtask = await issueService.createSubtask(
      params.issueId,
      user.id,
      validated.title
    )

    return Response.json(subtask, { status: 201 })
  } catch (error) {
    return createErrorResponse(error)
  }
}
