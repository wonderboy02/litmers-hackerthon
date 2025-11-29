import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { projectService } from '@/app/lib/services/project.service'
import { updateProjectSchema } from '@/app/lib/validators/project.schema'
import { createErrorResponse } from '@/app/lib/errors'
import { z } from 'zod'

type RouteContext = {
  params: Promise<{ projectId: string }>
}

/**
 * GET /api/projects/[projectId]
 * FR-022: 프로젝트 상세 조회
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await authService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다' }, { status: 401 })
    }

    const { projectId } = await context.params

    const project = await projectService.getProjectById(projectId, user.id)

    return NextResponse.json({
      project,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

/**
 * PATCH /api/projects/[projectId]
 * FR-023: 프로젝트 수정
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await authService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다' }, { status: 401 })
    }

    const { projectId } = await context.params
    const body = await request.json()
    const validated = updateProjectSchema.parse(body)

    const project = await projectService.updateProject(projectId, user.id, validated)

    return NextResponse.json({
      success: true,
      project,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return createErrorResponse(error)
  }
}

/**
 * DELETE /api/projects/[projectId]
 * FR-025: 프로젝트 삭제 (Soft Delete)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await authService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다' }, { status: 401 })
    }

    const { projectId } = await context.params

    await projectService.deleteProject(projectId, user.id)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
