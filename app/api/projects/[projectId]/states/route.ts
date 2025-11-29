import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { projectService } from '@/app/lib/services/project.service'
import { createCustomStateSchema } from '@/app/lib/validators/project.schema'
import { createErrorResponse } from '@/app/lib/errors'
import { z } from 'zod'

type RouteContext = {
  params: Promise<{ projectId: string }>
}

/**
 * GET /api/projects/[projectId]/states
 * 프로젝트 상태(칸반 컬럼) 목록 조회
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await authService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다' }, { status: 401 })
    }

    const { projectId } = await context.params

    const states = await projectService.getStates(projectId, user.id)

    return NextResponse.json({
      states,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

/**
 * POST /api/projects/[projectId]/states
 * FR-053: 커스텀 상태 생성
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await authService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다' }, { status: 401 })
    }

    const { projectId } = await context.params
    const body = await request.json()
    const validated = createCustomStateSchema.parse(body)

    const state = await projectService.createCustomState(projectId, user.id, {
      name: validated.name,
      color: validated.color,
      position: validated.position,
    })

    return NextResponse.json({
      success: true,
      state,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return createErrorResponse(error)
  }
}
