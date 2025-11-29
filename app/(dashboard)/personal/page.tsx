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
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">개인 대시보드</h1>
        <p className="text-gray-600 mt-2 text-lg">내가 참여 중인 프로젝트와 이슈를 확인하세요</p>
      </div>

      {/* 팀 초대 알림 */}
      {invitations.length > 0 && (
        <div className="mb-10">
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 shadow-lg">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4">
                  🎉 팀 초대 {invitations.length}개
                </h3>
                <div className="space-y-3">
                  {invitations.map((invitation: any) => (
                    <div key={invitation.id} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">
                            <strong>{invitation.inviter?.name || '관리자'}</strong>님이{' '}
                            <strong className="bg-white bg-opacity-20 px-2 py-1 rounded">{invitation.teams?.name}</strong> 팀에 초대했습니다
                          </p>
                          <p className="text-xs text-white text-opacity-70 mt-2">
                            {new Date(invitation.created_at).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <Link href={`/invites/${invitation.token}`}>
                          <Button size="sm" className="ml-4 bg-white text-blue-600 hover:bg-gray-100 font-bold">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card hover className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">전체 이슈</p>
              <p className="text-4xl font-bold text-blue-600">{totalIssues}</p>
            </div>
            <div className="w-14 h-14 bg-blue-200 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">마감 임박 (7일)</p>
              <p className="text-4xl font-bold text-orange-600">{dueSoonCount}</p>
            </div>
            <div className="w-14 h-14 bg-orange-200 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">오늘 마감</p>
              <p className="text-4xl font-bold text-red-600">{dueTodayCount}</p>
            </div>
            <div className="w-14 h-14 bg-red-200 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* 마감 관련 이슈 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 마감 임박 (7일 이내) */}
        {dashboard?.dueSoonIssues && dashboard.dueSoonIssues.length > 0 && (
          <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-amber-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-orange-700">마감 임박 (7일 이내)</h3>
            </div>
            <ul className="space-y-3">
              {dashboard.dueSoonIssues.map((issue: any) => (
                <li key={issue.id} className="bg-white rounded-lg p-3 border border-orange-100 hover:shadow-md transition-all">
                  <Link
                    href={`/teams/${issue.project?.team_id}/projects/${issue.project?.id}/issues/${issue.id}`}
                    className="block"
                  >
                    <p className="text-sm font-semibold text-gray-900 truncate">{issue.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">{issue.project?.name}</span>
                      <span className="text-xs font-bold px-2 py-1 bg-orange-100 text-orange-700 rounded">
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
          <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-rose-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-200 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-red-700">오늘 마감</h3>
            </div>
            <ul className="space-y-3">
              {dashboard.dueTodayIssues.map((issue: any) => (
                <li key={issue.id} className="bg-white rounded-lg p-3 border border-red-100 hover:shadow-md transition-all">
                  <Link
                    href={`/teams/${issue.project?.team_id}/projects/${issue.project?.id}/issues/${issue.id}`}
                    className="block"
                  >
                    <p className="text-sm font-semibold text-gray-900 truncate">{issue.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">{issue.project?.name}</span>
                      <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded">
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
          <h2 className="text-2xl font-bold mb-6 text-gray-900">최근 작성한 댓글 (최대 5개)</h2>
          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-l-4 border-l-indigo-500">
            <ul className="space-y-4">
              {dashboard.recentComments.map((comment: any) => (
                <li key={comment.id} className="bg-white rounded-lg p-4 border border-indigo-100 hover:shadow-md transition-all">
                  <Link href={`/teams/${comment.issue?.project_id}/projects/${comment.issue?.project_id}/issues/${comment.issue?.id}`}>
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">{comment.issue?.title}</p>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{comment.content}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-indigo-100">
                        <p className="text-xs text-gray-500 font-medium">
                          {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                        </p>
                        <span className="text-xs text-indigo-600 font-semibold">→</span>
                      </div>
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
        <h2 className="text-2xl font-bold mb-6 text-gray-900">내가 담당한 이슈 (상태별)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(dashboard?.issuesByState || {}).map(([state, issues]: [string, any]) => {
            const stateColors: Record<string, { bg: string; border: string; text: string; icon: string; textColor: string }> = {
              'To Do': { bg: 'from-gray-50 to-gray-100', border: 'border-l-gray-400', text: 'text-gray-700', textColor: 'text-gray-600', icon: '📋' },
              'In Progress': { bg: 'from-blue-50 to-blue-100', border: 'border-l-blue-500', text: 'text-blue-700', textColor: 'text-blue-600', icon: '⚙️' },
              'In Review': { bg: 'from-purple-50 to-purple-100', border: 'border-l-purple-500', text: 'text-purple-700', textColor: 'text-purple-600', icon: '👁️' },
              'Done': { bg: 'from-green-50 to-green-100', border: 'border-l-green-500', text: 'text-green-700', textColor: 'text-green-600', icon: '✅' },
            }
            const colors = stateColors[state] || { bg: 'from-gray-50 to-gray-100', border: 'border-l-gray-400', text: 'text-gray-700', textColor: 'text-gray-600', icon: '📌' }

            return (
              <Card key={state} className={`bg-gradient-to-br ${colors.bg} ${colors.border} border-l-4`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{colors.icon}</span>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${colors.text}`}>{state}</h3>
                    <p className={`text-sm ${colors.textColor}`}>{issues.length}개의 이슈</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {issues.slice(0, 5).map((issue: any) => (
                    <li key={issue.id} className="bg-white rounded-lg p-3 border border-gray-100 hover:shadow-md transition-all">
                      <Link
                        href={`/teams/${issue.project?.team_id}/projects/${issue.project?.id}/issues/${issue.id}`}
                        className="block"
                      >
                        <p className="text-sm font-semibold text-gray-900 truncate">{issue.title}</p>
                        <p className={`text-xs ${colors.textColor} mt-1`}>{issue.project?.name}</p>
                      </Link>
                    </li>
                  ))}
                  {issues.length > 5 && (
                    <li className="text-sm text-gray-500 font-medium pt-2 border-t border-gray-200 text-center">
                      +{issues.length - 5}개 더보기
                    </li>
                  )}
                </ul>
              </Card>
            )
          })}
        </div>
      </div>

      {/* 소속 팀 */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">소속 팀</h2>
        {(!dashboard?.teams || dashboard.teams.length === 0) ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">소속된 팀이 없습니다.</p>
              <p className="text-sm text-gray-400 mt-2">팀 초대를 받거나 새 팀을 생성해보세요.</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboard.teams.map((team: any) => {
              const projectCount = team.projects?.length || 0
              const memberCount = team.memberCount || 0

              return (
                <Link href={`/teams/${team.id}`} key={team.id}>
                  <Card padding="lg" hover className="h-full border-t-4 border-t-purple-500 transition-all duration-300 hover:shadow-lg flex flex-col">
                    {/* Header with Team Name and Role */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-2xl text-gray-900">{team.name}</h3>
                        <span className="text-sm font-medium px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                          {team.role}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-6 pt-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-purple-600">{projectCount}</div>
                        <div className="text-sm text-gray-500 mt-2">프로젝트</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-purple-600">{memberCount}</div>
                        <div className="text-sm text-gray-500 mt-2">멤버</div>
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
