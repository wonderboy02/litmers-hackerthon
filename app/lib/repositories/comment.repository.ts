import { createClient } from '@/app/lib/supabase/server'
import { Database } from '@/types/supabase'

type Comment = Database['public']['Tables']['comments']['Row']
type CommentInsert = Database['public']['Tables']['comments']['Insert']
type CommentUpdate = Database['public']['Tables']['comments']['Update']

/**
 * 댓글 Repository
 * FR-060 ~ FR-063
 */
export const commentRepository = {
  /**
   * ID로 댓글 조회
   */
  async findById(id: string): Promise<Comment | null> {
    const supabase = await createClient()
    const { data } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(id, name, email, profile_image)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    return data
  },

  /**
   * 이슈의 댓글 조회
   */
  async findByIssue(issueId: string, limit = 50, offset = 0): Promise<Comment[]> {
    const supabase = await createClient()
    const { data } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(id, name, email, profile_image)
      `)
      .eq('issue_id', issueId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    return data || []
  },

  /**
   * 댓글 생성
   */
  async create(comment: CommentInsert): Promise<Comment> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('comments')
      .insert(comment)
      .select(`
        *,
        user:users(id, name, email, profile_image)
      `)
      .single()

    if (error) throw error
    return data
  },

  /**
   * 댓글 수정
   */
  async update(id: string, content: string): Promise<Comment> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('comments')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        user:users(id, name, email, profile_image)
      `)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Soft Delete
   */
  async softDelete(id: string): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('comments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  },

  /**
   * 이슈의 댓글 개수 조회
   */
  async countByIssue(issueId: string): Promise<number> {
    const supabase = await createClient()
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('issue_id', issueId)
      .is('deleted_at', null)

    if (error) throw error
    return count || 0
  }
}
