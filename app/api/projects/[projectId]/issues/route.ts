import { NextRequest } from 'next/server'
import { issueService } from '@/app/lib/services/issue.service'
import { createIssueSchema, issueFilterSchema } from '@/app/lib/validators/issue.schema'
import { createErrorResponse } from '@/app/lib/errors'
import { supabase } from '@/app/lib/supabase'

/**
 * POST /api/projects/[projectId]/issues
 * FR-030: 이슈 생성
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    // 현재 사용자 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createIssueSchema.parse(body)

    const issue = await issueService.createIssue(
      params.projectId,
      user.id,
      validated
    )

    return Response.json(issue, { status: 201 })
  } catch (error) {
    return createErrorResponse(error)
  }
}

/**
 * GET /api/projects/[projectId]/issues
 * FR-036: 이슈 검색/필터링
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    // 쿼리 파라미터 파싱
    const filters: any = {}

    if (searchParams.get('search')) {
      filters.search = searchParams.get('search')
    }

    if (searchParams.get('stateIds')) {
      filters.stateIds = searchParams.get('stateIds')!.split(',')
    }

    if (searchParams.get('assigneeIds')) {
      filters.assigneeIds = searchParams.get('assigneeIds')!.split(',')
    }

    if (searchParams.get('priorities')) {
      filters.priorities = searchParams.get('priorities')!.split(',')
    }

    if (searchParams.get('labelIds')) {
      filters.labelIds = searchParams.get('labelIds')!.split(',')
    }

    if (searchParams.get('hasDueDate')) {
      filters.hasDueDate = searchParams.get('hasDueDate') === 'true'
    }

    if (searchParams.get('dueDateFrom')) {
      filters.dueDateFrom = searchParams.get('dueDateFrom')
    }

    if (searchParams.get('dueDateTo')) {
      filters.dueDateTo = searchParams.get('dueDateTo')
    }

    const issues = await issueService.searchIssues(
      params.projectId,
      user.id,
      filters
    )

    return Response.json(issues)
  } catch (error) {
    return createErrorResponse(error)
  }
}
