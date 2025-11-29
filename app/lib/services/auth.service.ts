import { createClient } from '@/app/lib/supabase/client'
import { userRepository, passwordResetRepository } from '@/app/lib/repositories/user.repository'
import { sendPasswordResetEmail } from '@/app/lib/email'
import { AuthError, ValidationError, NotFoundError } from '@/app/lib/errors'
import { nanoid } from 'nanoid'

/**
 * Auth Service
 * Supabase Auth + public.users 통합 인증 서비스
 *
 * 중요: Supabase Auth는 auth.users를 관리하고,
 * 우리는 public.users (프로필)를 관리합니다.
 */
export const authService = {
  /**
   * FR-001: 회원가입
   * 1. Supabase Auth 회원가입
   * 2. public.users 프로필 생성
   */
  async signup(email: string, password: string, name: string) {
    // 1. 이메일 중복 체크
    const existing = await userRepository.findByEmail(email)
    if (existing) {
      throw new ValidationError('이미 사용 중인 이메일입니다')
    }

    const supabase = await createClient()

    // 2. Supabase Auth 회원가입
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // 메타데이터에 이름 저장
      },
    })

    if (authError) throw new AuthError(authError.message)
    if (!authData.user) throw new AuthError('회원가입에 실패했습니다')

    // 3. public.users 테이블에 프로필 생성
    await userRepository.create({
      id: authData.user.id, // auth.users.id와 동일하게
      email,
      name,
      password_hash: null, // Supabase Auth가 관리
      google_id: null,
    })

    return {
      user: authData.user,
      session: authData.session,
    }
  },

  /**
   * FR-002: 로그인
   * Supabase Auth를 통한 이메일/비밀번호 로그인
   */
  async login(email: string, password: string) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new AuthError('이메일 또는 비밀번호가 올바르지 않습니다')
    }

    return {
      user: data.user,
      session: data.session,
    }
  },

  /**
   * FR-002: 로그아웃
   */
  async logout() {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()
    if (error) throw new AuthError(error.message)

    return { success: true }
  },

  /**
   * FR-003: 비밀번호 재설정 요청
   * 1. 사용자 확인
   * 2. 토큰 생성 및 DB 저장
   * 3. 이메일 발송
   */
  async requestPasswordReset(email: string) {
    const user = await userRepository.findByEmail(email)

    if (!user) {
      // 보안: 사용자 존재 여부 노출 방지
      // 실제로는 사용자가 없어도 성공 응답 반환
      return { success: true }
    }

    // Google 로그인 사용자는 비밀번호 재설정 불가
    if (user.google_id) {
      throw new ValidationError('Google 계정으로 가입한 사용자는 비밀번호를 재설정할 수 없습니다')
    }

    // 토큰 생성 (32자 랜덤 문자열)
    const token = nanoid(32)

    // DB에 토큰 저장 (1시간 유효)
    await passwordResetRepository.create(user.id, token)

    // 이메일 발송
    await sendPasswordResetEmail(email, token, user.name)

    return { success: true }
  },

  /**
   * FR-003: 비밀번호 재설정 실행
   * 1. 토큰 검증
   * 2. Supabase Auth 비밀번호 변경
   * 3. 토큰 삭제
   */
  async resetPassword(token: string, newPassword: string) {
    // 1. 유효한 토큰 확인
    const resetToken = await passwordResetRepository.findValidToken(token)
    if (!resetToken) {
      throw new ValidationError('유효하지 않거나 만료된 토큰입니다')
    }

    // 2. 사용자 조회
    const user = await userRepository.findById(resetToken.user_id)
    if (!user) throw new NotFoundError('사용자를 찾을 수 없습니다')

    const supabase = await createClient()

    // 3. Supabase Auth 비밀번호 변경
    // 주의: admin.updateUserById는 서버 사이드에서만 동작
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    })

    if (error) throw new AuthError(error.message)

    // 4. 사용된 토큰 삭제
    await passwordResetRepository.deleteToken(token)

    return { success: true }
  },

  /**
   * FR-004: Google OAuth 로그인
   * (클라이언트에서 supabase.auth.signInWithOAuth 사용)
   *
   * 이 함수는 OAuth 콜백 후 프로필 생성용
   */
  async handleGoogleOAuthCallback(userId: string, email: string, name: string, googleId: string) {
    // public.users에 프로필이 없으면 생성
    const existing = await userRepository.findById(userId)

    if (!existing) {
      await userRepository.create({
        id: userId,
        email,
        name,
        google_id: googleId,
        password_hash: null, // OAuth 사용자는 비밀번호 없음
      })
    }

    return { success: true }
  },

  /**
   * FR-005: 프로필 수정
   */
  async updateProfile(userId: string, updates: { name?: string; profileImage?: string }) {
    return await userRepository.update(userId, {
      name: updates.name,
      profile_image: updates.profileImage,
    })
  },

  /**
   * FR-006: 비밀번호 변경
   * 1. 현재 비밀번호 검증
   * 2. 새 비밀번호로 변경
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId)
    if (!user) throw new NotFoundError('사용자를 찾을 수 없습니다')

    // Google OAuth 사용자는 비밀번호 변경 불가
    if (user.google_id) {
      throw new ValidationError('Google 계정으로 가입한 사용자는 비밀번호를 변경할 수 없습니다')
    }

    const supabase = await createClient()

    // 1. 현재 비밀번호 검증 (재로그인)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (signInError) {
      throw new ValidationError('현재 비밀번호가 올바르지 않습니다')
    }

    // 2. 새 비밀번호로 변경
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw new AuthError(error.message)

    return { success: true }
  },

  /**
   * FR-007: 계정 삭제
   * 1. 소유한 팀 확인
   * 2. Soft Delete (public.users)
   * 3. (선택) Supabase Auth 계정 삭제
   */
  async deleteAccount(userId: string) {
    const supabase = await createClient()

    // 1. 소유한 팀이 있는지 확인
    const { count } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .is('deleted_at', null)

    if (count && count > 0) {
      throw new ValidationError('소유한 팀을 먼저 삭제하거나 소유권을 이전해주세요')
    }

    // 2. public.users Soft Delete
    await userRepository.softDelete(userId)

    // 3. (선택) Supabase Auth 계정 물리 삭제
    // 주의: 이 작업은 되돌릴 수 없습니다
    // await supabase.auth.admin.deleteUser(userId)

    return { success: true }
  },

  /**
   * 현재 로그인한 사용자 조회
   */
  async getCurrentUser() {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) throw new AuthError(error.message)
    if (!user) return null

    // public.users에서 프로필 정보 가져오기
    const profile = await userRepository.findById(user.id)
    return profile
  },

  /**
   * 세션 갱신
   */
  async refreshSession() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.refreshSession()

    if (error) throw new AuthError(error.message)

    return {
      session: data.session,
      user: data.user,
    }
  },
}
