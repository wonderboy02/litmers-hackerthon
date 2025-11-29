import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { authService } from '@/app/lib/services/auth.service'

/**
 * GET /api/auth/callback
 * OAuth 인증 후 리다이렉트 엔드포인트
 *
 * Google OAuth 흐름:
 * 1. 사용자가 Google 로그인 클릭
 * 2. Google 인증 완료 후 이 엔드포인트로 리다이렉트 (code 파라미터 포함)
 * 3. code를 session으로 교환
 * 4. public.users 프로필 생성 (없는 경우)
 * 5. 메인 페이지로 리다이렉트
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()

    // OAuth code를 session으로 교환
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('❌ OAuth callback error:', error)
      // 에러 발생 시 메인 페이지로 리다이렉트 (에러 쿼리 포함)
      return NextResponse.redirect(`${requestUrl.origin}/?error=${encodeURIComponent(error.message)}`)
    }

    if (data.user) {
      // public.users 프로필 생성 (없는 경우)
      try {
        const { user } = data
        const email = user.email!
        const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0]
        const googleId = user.user_metadata?.provider_id || user.id

        console.log('✅ Creating profile for OAuth user:', { userId: user.id, email, name })

        await authService.handleGoogleOAuthCallback(user.id, email, name, googleId)

        console.log('✅ Profile created successfully')
      } catch (profileError) {
        // 프로필 생성 실패 시 로그만 남기고 계속 진행
        // (이미 프로필이 있는 경우 등)
        console.error('⚠️ Profile creation error (might already exist):', profileError)
      }
    }
  }

  // 메인 페이지로 리다이렉트
  return NextResponse.redirect(`${requestUrl.origin}/`)
}
