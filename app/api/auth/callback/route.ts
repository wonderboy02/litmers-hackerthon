import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { authService } from '@/app/lib/services/auth.service'

/**
 * GET /api/auth/callback
 * 인증 후 리다이렉트 엔드포인트
 *
 * 처리하는 인증 유형:
 * 1. Google OAuth 로그인
 * 2. 이메일 인증 (회원가입 시)
 *
 * 흐름:
 * 1. Supabase로부터 code 파라미터 수신
 * 2. code를 session으로 교환
 * 3. public.users 프로필 생성 (없는 경우)
 * 4. 개인 대시보드로 리다이렉트
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()

    // code를 session으로 교환 (OAuth 또는 이메일 인증)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('❌ Auth callback error:', error)
      // 에러 발생 시 로그인 페이지로 리다이렉트 (에러 메시지 포함)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    if (data.user) {
      // public.users 프로필 생성 (없는 경우)
      try {
        const { user } = data
        const email = user.email!

        // OAuth 사용자인 경우 (Google 등)
        if (user.app_metadata.provider === 'google') {
          const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0]
          const googleId = user.user_metadata?.provider_id || user.id

          console.log('✅ Processing Google OAuth user:', { userId: user.id, email, name })
          await authService.handleGoogleOAuthCallback(user.id, email, name, googleId)
        }
        // 이메일 인증 사용자인 경우
        else if (user.app_metadata.provider === 'email') {
          console.log('✅ Email confirmation successful for user:', { userId: user.id, email })
          // 이메일 사용자의 경우 회원가입 시 이미 프로필이 생성되었으므로 추가 작업 불필요
        }

        console.log('✅ Auth callback processed successfully')
      } catch (profileError) {
        // 프로필 생성 실패 시 로그만 남기고 계속 진행
        // (이미 프로필이 있는 경우 등)
        console.error('⚠️ Profile creation error (might already exist):', profileError)
      }
    }
  }

  // 인증 성공 시 개인 대시보드로 리다이렉트
  return NextResponse.redirect(`${requestUrl.origin}/personal`)
}
