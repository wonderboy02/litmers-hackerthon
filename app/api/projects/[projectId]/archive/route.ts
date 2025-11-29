import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { projectService } from '@/app/lib/services/project.service'
import { createErrorResponse } from '@/app/lib/errors'

type RouteContext = {
  params: Promise<{ projectId: string }>
}

/**
 * POST /api/projects/[projectId]/archive
 * FR-026: 프로젝트 아카이브
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await authService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다' }, { status: 401 })
    }

    const { projectId } = await context.params

    await projectService.archiveProject(projectId, user.id)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

/**
 * DELETE /api/projects/[projectId]/archive
 * 프로젝트 아카이브 해제
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await authService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다' }, { status: 401 })
    }

    const { projectId } = await context.params

    await projectService.unarchiveProject(projectId, user.id)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
