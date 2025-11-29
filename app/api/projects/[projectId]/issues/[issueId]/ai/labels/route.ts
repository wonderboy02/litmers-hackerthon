import { NextRequest } from 'next/server'
import { aiService } from '@/app/lib/services/ai.service'
import { createErrorResponse } from '@/app/lib/errors'
import { supabase } from '@/app/lib/supabase'

/**
 * POST /api/projects/[projectId]/issues/[issueId]/ai/labels
 * FR-043: AI 이슈 자동 분류 (라벨 추천)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; issueId: string } }
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 프로젝트의 라벨 조회
    const { data: labels } = await supabase
      .from('project_labels')
      .select('id, name')
      .eq('project_id', params.projectId)

    if (!labels || labels.length === 0) {
      return Response.json({ error: '프로젝트에 라벨이 없습니다' }, { status: 400 })
    }

    const recommendedLabels = await aiService.recommendLabels(
      params.issueId,
      user.id,
      labels
    )

    return Response.json({ labels: recommendedLabels })
  } catch (error) {
    return createErrorResponse(error)
  }
}
