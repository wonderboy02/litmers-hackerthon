import { createClient } from '@/app/lib/supabase/server'
import type { Database } from '@/types/supabase'

type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

/**
 * User Repository
 * public.users 테이블 데이터 접근 레이어
 *
 * 주의: auth.users는 Supabase Auth가 관리하므로,
 * 여기서는 public.users (프로필 정보)만 다룹니다.
 */
export const userRepository = {
  /**
   * ID로 사용자 조회
   * Soft Delete된 사용자는 제외
   */
  async findById(id: string): Promise<User | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // 레코드 없음
      throw error
    }

    return data
  },

  /**
   * 이메일로 사용자 조회
   * Soft Delete된 사용자는 제외
   */
  async findByEmail(email: string): Promise<User | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // 레코드 없음
      throw error
    }

    return data
  },

  /**
   * Google ID로 사용자 조회 (OAuth 로그인용)
   * Soft Delete된 사용자는 제외
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', googleId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // 레코드 없음
      throw error
    }

    return data
  },

  /**
   * 사용자 생성
   * 주의: Auth 회원가입 후에 호출해야 함 (auth.users.id와 동일한 ID 사용)
   */
  async create(user: UserInsert): Promise<User> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 사용자 정보 수정
   */
  async update(id: string, updates: UserUpdate): Promise<User> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 사용자 Soft Delete
   * 실제 레코드는 삭제하지 않고 deleted_at 타임스탬프만 설정
   */
  async softDelete(id: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('users')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  },
}

/**
 * Password Reset Token Repository
 * 비밀번호 재설정 토큰 관리
 */
export const passwordResetRepository = {
  /**
   * 비밀번호 재설정 토큰 생성
   * 만료 시간: 1시간
   */
  async create(userId: string, token: string) {
    const supabase = await createClient()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1시간 후

    const { data, error } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 유효한 토큰 조회
   * 만료되지 않은 토큰만 반환
   */
  async findValidToken(token: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // 레코드 없음
      throw error
    }

    return data
  },

  /**
   * 토큰 삭제 (사용 후)
   */
  async deleteToken(token: string) {
    const supabase = await createClient()

    const { error } = await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('token', token)

    if (error) throw error
  },
}
