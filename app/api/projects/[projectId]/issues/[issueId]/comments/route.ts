import { NextRequest } from 'next/server'
import { commentService } from '@/app/lib/services/comment.service'
import { createErrorResponse } from '@/app/lib/errors'
import { createClient } from '@/app/lib/supabase/server'
import { z } from 'zod'

const createCommentSchema = z.object({
  content: z.string().min(1, '댓글 내용을 입력해주세요').max(1000)
})

/**
 * POST /api/projects/[projectId]/issues/[issueId]/comments
 * FR-060: 댓글 작성
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
    const validated = createCommentSchema.parse(body)

    const comment = await commentService.createComment(
      params.issueId,
      user.id,
      validated.content
    )

    return Response.json(comment, { status: 201 })
  } catch (error) {
    return createErrorResponse(error)
  }
}

/**
 * GET /api/projects/[projectId]/issues/[issueId]/comments
 * FR-061: 댓글 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; issueId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const comments = await commentService.getComments(
      params.issueId,
      user.id,
      limit,
      offset
    )

    return Response.json(comments)
  } catch (error) {
    return createErrorResponse(error)
  }
}
