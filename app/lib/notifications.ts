/**
 * FR-090, FR-091: 인앱 알림 시스템
 * 알림 타입 정의 및 유틸리티
 */

/**
 * 알림 타입 (PRD FR-090 기반)
 */
export enum NotificationType {
  ISSUE_ASSIGNED = 'issue_assigned', // 이슈 담당자 지정
  ISSUE_COMMENTED = 'issue_commented', // 이슈에 댓글 작성
  DUE_DATE_APPROACHING = 'due_date_approaching', // 마감일 임박 (1일 전)
  DUE_DATE_TODAY = 'due_date_today', // 마감일 당일
  TEAM_INVITED = 'team_invited', // 팀 초대
  ROLE_CHANGED = 'role_changed', // 멤버 역할 변경
}

/**
 * 알림 인터페이스
 */
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
  metadata?: {
    issueId?: string
    teamId?: string
    projectId?: string
    actorName?: string
    [key: string]: unknown
  }
}

/**
 * 알림 생성 데이터
 */
export interface CreateNotificationData {
  userId: string
  type: NotificationType
  title: string
  message: string
  metadata?: Notification['metadata']
}

/**
 * 알림 타입별 메시지 템플릿
 */
export function getNotificationMessage(
  type: NotificationType,
  data: {
    actorName?: string
    issueName?: string
    teamName?: string
    roleName?: string
  },
): { title: string; message: string } {
  switch (type) {
    case NotificationType.ISSUE_ASSIGNED:
      return {
        title: '새 이슈가 할당되었습니다',
        message: `${data.actorName}님이 "${data.issueName}" 이슈를 할당했습니다.`,
      }

    case NotificationType.ISSUE_COMMENTED:
      return {
        title: '새 댓글이 작성되었습니다',
        message: `${data.actorName}님이 "${data.issueName}" 이슈에 댓글을 남겼습니다.`,
      }

    case NotificationType.DUE_DATE_APPROACHING:
      return {
        title: '마감일이 임박했습니다',
        message: `"${data.issueName}" 이슈의 마감일이 내일입니다.`,
      }

    case NotificationType.DUE_DATE_TODAY:
      return {
        title: '오늘이 마감일입니다',
        message: `"${data.issueName}" 이슈의 마감일이 오늘입니다.`,
      }

    case NotificationType.TEAM_INVITED:
      return {
        title: '팀 초대',
        message: `${data.actorName}님이 "${data.teamName}" 팀에 초대했습니다.`,
      }

    case NotificationType.ROLE_CHANGED:
      return {
        title: '역할이 변경되었습니다',
        message: `"${data.teamName}" 팀에서 역할이 ${data.roleName}(으)로 변경되었습니다.`,
      }

    default:
      return {
        title: '새 알림',
        message: '새로운 알림이 있습니다.',
      }
  }
}

/**
 * 알림 아이콘 가져오기
 */
export function getNotificationIcon(
  type: NotificationType,
): {
  icon: string
  color: string
} {
  switch (type) {
    case NotificationType.ISSUE_ASSIGNED:
      return { icon: '📋', color: 'text-blue-600' }

    case NotificationType.ISSUE_COMMENTED:
      return { icon: '💬', color: 'text-green-600' }

    case NotificationType.DUE_DATE_APPROACHING:
      return { icon: '⏰', color: 'text-orange-600' }

    case NotificationType.DUE_DATE_TODAY:
      return { icon: '🔔', color: 'text-red-600' }

    case NotificationType.TEAM_INVITED:
      return { icon: '👥', color: 'text-purple-600' }

    case NotificationType.ROLE_CHANGED:
      return { icon: '🔑', color: 'text-indigo-600' }

    default:
      return { icon: '🔔', color: 'text-gray-600' }
  }
}

/**
 * 알림 생성 헬퍼 함수
 * Service 레이어에서 알림을 간편하게 생성할 수 있도록 돕는 함수
 */
export async function createNotification(data: {
  userId: string
  type: string
  title: string
  content: string
  relatedId?: string
  relatedType?: string
}) {
  const { notificationService } = await import('@/app/lib/services/notification.service')
  return await notificationService.createNotification(data)
}
