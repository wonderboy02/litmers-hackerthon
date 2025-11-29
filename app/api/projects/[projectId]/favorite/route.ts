import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { projectService } from '@/app/lib/services/project.service'
import { createErrorResponse } from '@/app/lib/errors'

type RouteContext = {
  params: Promise<{ projectId: string }>
}

/**
 * POST /api/projects/[projectId]/favorite
 * FR-027: 즐겨찾기 추가
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await authService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다' }, { status: 401 })
    }

    const { projectId } = await context.params

    await projectService.addFavorite(projectId, user.id)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

/**
 * DELETE /api/projects/[projectId]/favorite
 * 즐겨찾기 제거
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await authService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다' }, { status: 401 })
    }

    const { projectId } = await context.params

    await projectService.removeFavorite(projectId, user.id)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
