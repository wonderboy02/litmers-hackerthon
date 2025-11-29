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
    console.log('📬 [NotificationService] 알림 생성 시작')
    console.log('   받는 사람 ID:', data.userId)
    console.log('   알림 타입:', data.type)
    console.log('   제목:', data.title)
    console.log('   내용:', data.content)
    console.log('   관련 ID:', data.relatedId)
    console.log('   관련 타입:', data.relatedType)

    // title과 content를 합쳐서 message로 저장
    const message = data.title ? `${data.title}: ${data.content}` : data.content

    try {
      const result = await notificationRepository.create({
        user_id: data.userId,
        type: data.type,
        message: message,
        reference_id: data.relatedId,
        reference_type: data.relatedType
      })
      console.log('✅ [NotificationService] 알림 DB 저장 성공:', result.id)
      return result
    } catch (error) {
      console.error('❌ [NotificationService] 알림 DB 저장 실패:', error)
      throw error
    }
  }
}
