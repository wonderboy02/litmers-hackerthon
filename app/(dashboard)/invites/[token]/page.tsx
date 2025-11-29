'use client'

import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/app/lib/hooks/useAuth'
import { useInvitationDetails, useAcceptInvitation } from '@/app/lib/hooks/useTeams'
import { Card, Button, LoadingSpinner } from '@/app/components/common'
import { useEffect } from 'react'

export default function InviteAcceptPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const { user, isLoading: authLoading } = useAuth()
  const { data: invitation, isLoading: inviteLoading, error } = useInvitationDetails(token)
  const acceptMutation = useAcceptInvitation()

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트 (token 유지)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/invites/${token}`)
    }
  }, [user, authLoading, router, token])

  const handleAccept = async () => {
    try {
      await acceptMutation.mutateAsync(token)
      // 성공 시 팀 페이지로 이동
      if (invitation?.team?.id) {
        router.push(`/teams/${invitation.team.id}`)
      } else {
        router.push('/teams')
      }
    } catch (error) {
      // 에러는 mutation의 onError에서 처리됨
    }
  }

  const handleDecline = () => {
    router.push('/personal')
  }

  if (authLoading || inviteLoading) {
    return <LoadingSpinner fullScreen />
  }

  // 초대를 찾을 수 없거나 만료된 경우
  if (error || !invitation) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">초대를 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-6">
            초대가 만료되었거나 잘못된 링크입니다.
          </p>

          <Button onClick={() => router.push('/teams')} variant="secondary">
            팀 목록으로 이동
          </Button>
        </Card>
      </div>
    )
  }

  // 이메일 불일치 확인 (현재 로그인한 사용자와 초대된 이메일 비교)
  const emailMismatch = user && user.email !== invitation.email

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md w-full">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">팀 초대</h1>
          <p className="text-gray-600">
            <strong>{invitation.inviterName}</strong>님이 초대했습니다
          </p>
        </div>

        {/* 팀 정보 */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              {invitation.team.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{invitation.team.name}</h2>
              <p className="text-sm text-gray-600">{invitation.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              만료: {new Date(invitation.expiresAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* 이메일 불일치 경고 */}
        {emailMismatch && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-orange-900 mb-1">이메일 주소가 일치하지 않습니다</p>
                <p className="text-sm text-orange-700">
                  초대된 이메일: <strong>{invitation.email}</strong><br />
                  현재 로그인: <strong>{user?.email}</strong>
                </p>
                <p className="text-xs text-orange-600 mt-2">
                  올바른 계정으로 로그인하거나, 초대를 거절하고 다시 요청해주세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <Button
            onClick={handleDecline}
            variant="secondary"
            className="flex-1"
          >
            거절
          </Button>
          <Button
            onClick={handleAccept}
            className="flex-1"
            isLoading={acceptMutation.isPending}
            disabled={emailMismatch}
          >
            수락하기
          </Button>
        </div>

        {/* 안내 문구 */}
        <p className="text-xs text-gray-500 text-center mt-6">
          수락하면 <strong>{invitation.team.name}</strong> 팀의 멤버로 추가됩니다.
        </p>
      </Card>
    </div>
  )
}
