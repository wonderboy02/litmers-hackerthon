import { notificationRepository } from '@/app/lib/repositories/notification.repository'

/**
 * 알림 Service
 * FR-090 ~ FR-091
 */
export const notificationService = {
  /**
   * FR-090: 알림 조회
   */
  async getNotifications(userId: string, limit = 50, offset = 0) {
    return await notificationRepository.findByUser(userId, limit, offset)
  },

  /**
   * 미읽은 알림 조회
   */
  async getUnreadNotifications(userId: string) {
    return await notificationRepository.findUnreadByUser(userId)
  },

  /**
   * 미읽은 알림 개수 조회
   */
  async getUnreadCount(userId: string) {
    return await notificationRepository.countUnread(userId)
  },

  /**
   * FR-091: 알림 읽음 처리
   */
  async markAsRead(notificationId: string, userId: string) {
    // 권한 확인 (본인의 알림인지)
    const notifications = await notificationRepository.findByUser(userId)
    const notification = notifications.find(n => n.id === notificationId)

    if (!notification) {
      throw new Error('알림을 찾을 수 없습니다')
    }

    await notificationRepository.markAsRead(notificationId)

    return { success: true }
  },

  /**
   * FR-091: 전체 읽음 처리
   */
  async markAllAsRead(userId: string) {
    await notificationRepository.markAllAsRead(userId)

    return { success: true }
  },

  /**
   * 알림 생성 (내부 사용용)
   */
  async createNotification(data: {
    userId: string
    type: string
    title: string
    content: string
    relatedId?: string
    relatedType?: string
  }) {
    return await notificationRepository.create({
      user_id: data.userId,
      type: data.type,
      title: data.title,
      content: data.content,
      related_id: data.relatedId,
      related_type: data.relatedType
    })
  }
}
