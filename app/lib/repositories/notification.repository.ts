import { createClient } from '@/app/lib/supabase/server'
import { Database } from '@/types/supabase'

type Notification = Database['public']['Tables']['notifications']['Row']
type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

/**
 * 알림 Repository
 * FR-090 ~ FR-091
 */
export const notificationRepository = {
  /**
   * 알림 생성
   */
  async create(notification: NotificationInsert): Promise<Notification> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 사용자의 알림 조회
   */
  async findByUser(userId: string, limit = 50, offset = 0): Promise<Notification[]> {
    const supabase = await createClient()

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    return data || []
  },

  /**
   * 사용자의 미읽은 알림 조회
   */
  async findUnreadByUser(userId: string): Promise<Notification[]> {
    const supabase = await createClient()

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })

    return data || []
  },

  /**
   * 미읽은 알림 개수 조회
   */
  async countUnread(userId: string): Promise<number> {
    const supabase = await createClient()

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw error
    return count || 0
  },

  /**
   * 알림 읽음 처리
   */
  async markAsRead(id: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true
      })
      .eq('id', id)

    if (error) throw error
  },

  /**
   * 전체 읽음 처리
   */
  async markAllAsRead(userId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true
      })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw error
  },

  /**
   * 알림 삭제 (실제로는 사용하지 않음, Soft Delete 없음)
   */
  async delete(id: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
