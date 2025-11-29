import { NextRequest } from 'next/server'
import { recommendLabels } from '@/app/lib/ai'
import { checkAIRateLimit } from '@/app/lib/rate-limit'
import { createErrorResponse, RateLimitError, ValidationError } from '@/app/lib/errors'
import { createClient } from '@/app/lib/supabase/server'

/**
 * POST /api/projects/[projectId]/ai/recommend-labels
 * FR-043: AI 라벨 추천 (이슈 생성 전용 - title/description 직접 전달)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate Limiting
    const rateLimitResult = checkAIRateLimit(user.id)
    if (!rateLimitResult.allowed) {
      throw new RateLimitError(rateLimitResult.error || 'Rate limit exceeded')
    }

    // Body에서 title, description 받기
    const body = await request.json()
    const { title, description } = body

    if (!title?.trim()) {
      throw new ValidationError('제목이 필요합니다')
    }

    // 프로젝트의 라벨 조회
    const { data: labels } = await supabase
      .from('project_labels')
      .select('id, name, color')
      .eq('project_id', params.projectId)

    if (!labels || labels.length === 0) {
      throw new ValidationError('프로젝트에 라벨이 없습니다')
    }

    // AI 호출 (lib/ai.ts의 recommendLabels 함수 직접 호출)
    const labelsWithColor = labels.map(l => ({ name: l.name, color: l.color || '' }))
    const recommendedLabelNames = await recommendLabels(
      title,
      description || '',
      labelsWithColor
    )

    // 라벨 이름을 ID로 변환
    const recommendedLabelIds = labels
      .filter(l => recommendedLabelNames.includes(l.name))
      .map(l => l.id)

    return Response.json({ labels: recommendedLabelIds })
  } catch (error) {
    return createErrorResponse(error)
  }
}
