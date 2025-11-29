import { NextRequest } from 'next/server'
import { issueService } from '@/app/lib/services/issue.service'
import { createErrorResponse } from '@/app/lib/errors'
import { supabase } from '@/app/lib/supabase'
import { z } from 'zod'

const updateSubtaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  isCompleted: z.boolean().optional()
})

/**
 * PATCH /api/projects/[projectId]/issues/[issueId]/subtasks/[subtaskId]
 * 서브태스크 수정
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string; issueId: string; subtaskId: string } }
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = updateSubtaskSchema.parse(body)

    const subtask = await issueService.updateSubtask(
      params.subtaskId,
      user.id,
      validated
    )

    return Response.json(subtask)
  } catch (error) {
    return createErrorResponse(error)
  }
}

/**
 * DELETE /api/projects/[projectId]/issues/[issueId]/subtasks/[subtaskId]
 * 서브태스크 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; issueId: string; subtaskId: string } }
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await issueService.deleteSubtask(params.subtaskId, user.id)

    return Response.json({ success: true })
  } catch (error) {
    return createErrorResponse(error)
  }
}
