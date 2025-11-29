import { NextRequest } from 'next/server'
import { aiService } from '@/app/lib/services/ai.service'
import { createErrorResponse } from '@/app/lib/errors'
import { supabase } from '@/app/lib/supabase'

/**
 * POST /api/projects/[projectId]/issues/[issueId]/ai/suggestion
 * FR-041: AI 해결 전략 제안
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

    const suggestion = await aiService.generateSuggestion(params.issueId, user.id)

    return Response.json({ suggestion })
  } catch (error) {
    return createErrorResponse(error)
  }
}
