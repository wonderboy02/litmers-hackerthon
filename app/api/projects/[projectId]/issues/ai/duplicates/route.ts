import { NextRequest } from 'next/server'
import { aiService } from '@/app/lib/services/ai.service'
import { createErrorResponse } from '@/app/lib/errors'
import { createClient } from '@/app/lib/supabase/server'
import { z } from 'zod'

const detectDuplicatesSchema = z.object({
  title: z.string(),
  description: z.string().optional()
})

/**
 * POST /api/projects/[projectId]/issues/ai/duplicates
 * FR-044: AI 중복 이슈 탐지
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

    const body = await request.json()
    const validated = detectDuplicatesSchema.parse(body)

    const duplicates = await aiService.detectDuplicates(
      params.projectId,
      user.id,
      validated.title,
      validated.description
    )

    return Response.json({ duplicates })
  } catch (error) {
    return createErrorResponse(error)
  }
}
