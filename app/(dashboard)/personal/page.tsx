'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, LoadingSpinner, Button } from '@/app/components/common'
import { useMyInvitations } from '@/app/lib/hooks/useTeams'
import Link from 'next/link'

export default function PersonalDashboardPage() {
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'personal'],
    queryFn: async () => {
      console.log('Fetching personal dashboard...')
      const res = await fetch('/api/dashboard/personal')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      console.log('Dashboard data:', data)
      return data
    },
  })

  const { data: invitations = [] } = useMyInvitations()

  if (isLoading) return <LoadingSpinner fullScreen />

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">데이터를 불러오는 중 오류가 발생했습니다.</p>
        <p className="text-sm text-gray-500 mt-2">{(error as Error).message}</p>
      </div>
    )
  }

  const totalIssues = dashboard?.totalIssues || 0
  const dueSoonCount = dashboard?.dueSoonIssues?.length || 0
  const dueTodayCount = dashboard?.dueTodayIssues?.length || 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">개인 대시보드</h1>
        <p className="text-gray-600 mt-2">내가 참여 중인 프로젝트와 이슈를 확인하세요</p>
      </div>

      {/* 팀 초대 알림 */}
      {invitations.length > 0 && (
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  팀 초대 {invitations.length}개
                </h3>
                <div className="space-y-3">
                  {invitations.map((invitation: any) => (
                    <div key={invitation.id} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            <strong>{invitation.inviter?.name || '관리자'}</strong>님이{' '}
                            <strong className="text-purple-700">{invitation.teams?.name}</strong> 팀에 초대했습니다
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(invitation.created_at).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <Link href={`/invites/${invitation.token}`}>
                          <Button size="sm" className="ml-4">
                            확인
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">전체 이슈</p>
              <p className="text-3xl font-bold text-gray-900">{totalIssues}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">마감 임박 (7일 이내)</p>
              <p className="text-3xl font-bold text-orange-600">{dueSoonCount}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">오늘 마감</p>
              <p className="text-3xl font-bold text-red-600">{dueTodayCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* 마감 관련 이슈 */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* 마감 임박 (7일 이내) */}
        {dashboard?.dueSoonIssues && dashboard.dueSoonIssues.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold mb-4 text-orange-600">마감 임박 (7일 이내)</h3>
            <ul className="space-y-3">
              {dashboard.dueSoonIssues.map((issue: any) => (
                <li key={issue.id} className="border-l-4 border-orange-400 pl-3">
                  <Link
                    href={`/teams/${issue.project?.team_id}/projects/${issue.project?.id}/issues/${issue.id}`}
                    className="block hover:bg-gray-50 -ml-3 pl-3 py-2 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 truncate">{issue.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{issue.project?.name}</span>
                      <span className="text-xs text-orange-600">
                        {issue.due_date && new Date(issue.due_date).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* 오늘 마감 */}
        {dashboard?.dueTodayIssues && dashboard.dueTodayIssues.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold mb-4 text-red-600">오늘 마감</h3>
            <ul className="space-y-3">
              {dashboard.dueTodayIssues.map((issue: any) => (
                <li key={issue.id} className="border-l-4 border-red-500 pl-3">
                  <Link
                    href={`/teams/${issue.project?.team_id}/projects/${issue.project?.id}/issues/${issue.id}`}
                    className="block hover:bg-gray-50 -ml-3 pl-3 py-2 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 truncate">{issue.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{issue.project?.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                        {issue.priority}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* 최근 댓글 */}
      {dashboard?.recentComments && dashboard.recentComments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">최근 작성한 댓글 (최대 5개)</h2>
          <Card>
            <ul className="divide-y divide-gray-200">
              {dashboard.recentComments.map((comment: any) => (
                <li key={comment.id} className="py-3 hover:bg-gray-50 transition-colors">
                  <Link href={`/teams/${comment.issue?.project_id}/projects/${comment.issue?.project_id}/issues/${comment.issue?.id}`}>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-gray-900">{comment.issue?.title}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{comment.content}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* 상태별 이슈 */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">내가 담당한 이슈 (상태별)</h2>
        <div className="grid grid-cols-3 gap-6">
          {Object.entries(dashboard?.issuesByState || {}).map(([state, issues]: [string, any]) => (
            <Card key={state} padding="md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{state}</h3>
                <span className="text-2xl font-bold text-blue-600">{issues.length}</span>
              </div>
              <ul className="space-y-2">
                {issues.slice(0, 5).map((issue: any) => (
                  <li key={issue.id}>
                    <Link
                      href={`/teams/${issue.project?.team_id}/projects/${issue.project?.id}/issues/${issue.id}`}
                      className="text-sm text-gray-600 hover:text-blue-600 block truncate"
                    >
                      • {issue.title}
                    </Link>
                  </li>
                ))}
                {issues.length > 5 && (
                  <li className="text-sm text-gray-400 italic">+{issues.length - 5}개 더보기</li>
                )}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      {/* 소속 팀 */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">소속 팀</h2>
        {(!dashboard?.teams || dashboard.teams.length === 0) ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">소속된 팀이 없습니다.</p>
              <p className="text-sm text-gray-400 mt-2">팀 초대를 받거나 새 팀을 생성해보세요.</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {dashboard.teams.map((team: any) => (
              <Link href={`/teams/${team.id}`} key={team.id}>
                <Card padding="md" hover>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg">{team.name}</h3>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {team.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>프로젝트 {team.projects?.length || 0}개</span>
                    <span>멤버 {team.memberCount || 0}명</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
