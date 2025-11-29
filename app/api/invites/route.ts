import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { createClient } from '@/app/lib/supabase/server'
import { createErrorResponse } from '@/app/lib/errors'

/**
 * GET /api/invites
 * 현재 사용자에게 온 초대 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const user = await authService.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // 사용자 이메일로 유효한 초대 조회
    const { data: invitations, error } = await supabase
      .from('team_invitations')
      .select(`
        *,
        teams:team_id (
          id,
          name
        ),
        inviter:inviter_id (
          id,
          name
        )
      `)
      .eq('email', user.email)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      invitations: invitations || [],
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
