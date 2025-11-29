'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/app/lib/toast'

/**
 * 알림 관련 React Query Hooks
 */

/**
 * 알림 목록 조회
 */
export function useNotifications(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['notifications', limit, offset],
    queryFn: async () => {
      const res = await fetch(`/api/notifications?limit=${limit}&offset=${offset}`)
      if (!res.ok) throw new Error('알림을 불러오는데 실패했습니다')
      return res.json()
    },
    refetchInterval: 30000 // 30초마다 자동 갱신
  })
}

/**
 * 미읽은 알림 조회
 */
export function useUnreadNotifications() {
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      const res = await fetch('/api/notifications/unread')
      if (!res.ok) throw new Error('미읽은 알림을 불러오는데 실패했습니다')
      return res.json()
    },
    refetchInterval: 10000 // 10초마다 자동 갱신
  })
}

/**
 * 알림 읽음 처리
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })
      if (!res.ok) throw new Error('알림 읽음 처리에 실패했습니다')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })
}

/**
 * 전체 읽음 처리
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      })
      if (!res.ok) throw new Error('전체 읽음 처리에 실패했습니다')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('모든 알림을 읽음 처리했습니다')
    },
    onError: () => {
      toast.error('전체 읽음 처리에 실패했습니다')
    }
  })
}
