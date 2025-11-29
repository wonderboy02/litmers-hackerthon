import { NextRequest } from 'next/server'
import { notificationService } from '@/app/lib/services/notification.service'
import { createErrorResponse } from '@/app/lib/errors'
import { createClient } from '@/app/lib/supabase/server'
import { z } from 'zod'

const markReadSchema = z.object({
  notificationId: z.string().uuid().optional(),
  markAll: z.boolean().optional()
})

/**
 * POST /api/notifications/mark-read
 * FR-091: 알림 읽음 처리
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = markReadSchema.parse(body)

    if (validated.markAll) {
      // 전체 읽음 처리
      await notificationService.markAllAsRead(user.id)
    } else if (validated.notificationId) {
      // 개별 읽음 처리
      await notificationService.markAsRead(validated.notificationId, user.id)
    } else {
      return Response.json(
        { error: 'notificationId 또는 markAll이 필요합니다' },
        { status: 400 }
      )
    }

    return Response.json({ success: true })
  } catch (error) {
    return createErrorResponse(error)
  }
}
