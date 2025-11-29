import { NextRequest } from 'next/server'
import { notificationService } from '@/app/lib/services/notification.service'
import { createErrorResponse } from '@/app/lib/errors'
import { createClient } from '@/app/lib/supabase/server'

/**
 * GET /api/notifications/unread
 * 미읽은 알림 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notifications = await notificationService.getUnreadNotifications(user.id)

    return Response.json(notifications)
  } catch (error) {
    return createErrorResponse(error)
  }
}
