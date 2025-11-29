import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { teamService } from '@/app/lib/services/team.service'
import { createErrorResponse } from '@/app/lib/errors'

/**
 * GET /api/invites/[token]
 * 초대 정보 조회
 * - 초대 페이지에서 팀 정보를 표시하기 위해 사용
 * - 인증 불필요 (토큰만으로 조회 가능)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const invitationData = await teamService.getInvitationByToken(token)

    return NextResponse.json({
      team: {
        id: invitationData.team.id,
        name: invitationData.team.name,
      },
      inviterName: invitationData.inviterName,
      email: invitationData.invitation.email,
      expiresAt: invitationData.invitation.expires_at,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

/**
 * POST /api/invites/[token]
 * FR-013: 초대 수락
 * - 인증된 사용자만 수락 가능
 * - 초대된 이메일과 현재 사용자 이메일 일치 확인
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const user = await authService.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    const { token } = await params

    const result = await teamService.acceptInvitation(token, user.id)

    if (result.alreadyMember) {
      return NextResponse.json({
        success: true,
        message: '이미 팀 멤버입니다',
        team: result.team,
      })
    }

    return NextResponse.json({
      success: true,
      message: '팀에 성공적으로 가입되었습니다',
      team: result.team,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
