import { NextRequest } from 'next/server'
import { issueService } from '@/app/lib/services/issue.service'
import { updateIssueSchema } from '@/app/lib/validators/issue.schema'
import { createErrorResponse } from '@/app/lib/errors'
import { supabase } from '@/app/lib/supabase'

/**
 * GET /api/projects/[projectId]/issues/[issueId]
 * FR-031: 이슈 상세 조회
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

    const issue = await issueService.getIssue(params.issueId, user.id)

    return Response.json(issue)
  } catch (error) {
    return createErrorResponse(error)
  }
}

/**
 * PATCH /api/projects/[projectId]/issues/[issueId]
 * FR-032: 이슈 수정
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string; issueId: string } }
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = updateIssueSchema.parse(body)

    const issue = await issueService.updateIssue(
      params.issueId,
      user.id,
      validated
    )

    return Response.json(issue)
  } catch (error) {
    return createErrorResponse(error)
  }
}

/**
 * DELETE /api/projects/[projectId]/issues/[issueId]
 * FR-035: 이슈 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; issueId: string } }
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await issueService.deleteIssue(params.issueId, user.id)

    return Response.json({ success: true })
  } catch (error) {
    return createErrorResponse(error)
  }
}
