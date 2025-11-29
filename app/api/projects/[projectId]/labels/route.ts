import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { projectService } from '@/app/lib/services/project.service'
import { createLabelSchema } from '@/app/lib/validators/project.schema'
import { createErrorResponse } from '@/app/lib/errors'
import { z } from 'zod'

type RouteContext = {
  params: Promise<{ projectId: string }>
}

/**
 * GET /api/projects/[projectId]/labels
 * FR-038: 프로젝트 라벨 목록 조회
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await authService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다' }, { status: 401 })
    }

    const { projectId } = await context.params

    const labels = await projectService.getLabels(projectId, user.id)

    return NextResponse.json({
      labels,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

/**
 * POST /api/projects/[projectId]/labels
 * FR-038: 라벨 생성
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await authService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다' }, { status: 401 })
    }

    const { projectId } = await context.params
    const body = await request.json()
    const validated = createLabelSchema.parse(body)

    const label = await projectService.createLabel(projectId, user.id, {
      name: validated.name,
      color: validated.color,
    })

    return NextResponse.json({
      success: true,
      label,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return createErrorResponse(error)
  }
}
