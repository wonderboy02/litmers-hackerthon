import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { projectService } from '@/app/lib/services/project.service'
import { createProjectSchema } from '@/app/lib/validators/project.schema'
import { createErrorResponse } from '@/app/lib/errors'
import { z } from 'zod'

/**
 * POST /api/projects
 * FR-020: 프로젝트 생성
 * ⭐ 기본 상태 3개 자동 생성됨 (Backlog, In Progress, Done)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await authService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createProjectSchema.parse(body)

    // teamId는 body에서 받음
    const { teamId, ...projectData } = body as { teamId: string; name: string; description?: string }

    if (!teamId) {
      return NextResponse.json({ error: 'teamId가 필요합니다' }, { status: 400 })
    }

    const project = await projectService.createProject(teamId, user.id, {
      name: validated.name,
      description: validated.description,
    })

    return NextResponse.json({
      success: true,
      project,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return createErrorResponse(error)
  }
}

/**
 * GET /api/projects?teamId=xxx&includeArchived=true
 * FR-021: 팀의 프로젝트 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const user = await authService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')
    const includeArchived = searchParams.get('includeArchived') === 'true'

    if (!teamId) {
      return NextResponse.json({ error: 'teamId가 필요합니다' }, { status: 400 })
    }

    const projects = await projectService.getProjects(teamId, user.id, includeArchived)

    return NextResponse.json({
      projects,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
