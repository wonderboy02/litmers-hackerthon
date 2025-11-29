import { NextRequest } from 'next/server'
import { commentService } from '@/app/lib/services/comment.service'
import { createErrorResponse } from '@/app/lib/errors'
import { supabase } from '@/app/lib/supabase'
import { z } from 'zod'

const updateCommentSchema = z.object({
  content: z.string().min(1).max(1000)
})

/**
 * PATCH /api/projects/[projectId]/issues/[issueId]/comments/[commentId]
 * FR-062: 댓글 수정
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string; issueId: string; commentId: string } }
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = updateCommentSchema.parse(body)

    const comment = await commentService.updateComment(
      params.commentId,
      user.id,
      validated.content
    )

    return Response.json(comment)
  } catch (error) {
    return createErrorResponse(error)
  }
}

/**
 * DELETE /api/projects/[projectId]/issues/[issueId]/comments/[commentId]
 * FR-063: 댓글 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; issueId: string; commentId: string } }
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await commentService.deleteComment(params.commentId, user.id)

    return Response.json({ success: true })
  } catch (error) {
    return createErrorResponse(error)
  }
}
