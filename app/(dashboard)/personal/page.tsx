'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, LoadingSpinner } from '@/app/components/common'
import { IssueStatusChart, IssueTimelineChart, PriorityChart } from '@/app/components/dashboard/charts'
import Link from 'next/link'

export default function PersonalDashboardPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard', 'personal'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/personal')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  if (isLoading) return <LoadingSpinner fullScreen />

  const totalIssues = dashboard?.totalIssues || 0
  const dueSoonCount = dashboard?.dueSoonIssues?.length || 0
  const dueTodayCount = dashboard?.dueTodayIssues?.length || 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">개인 대시보드</h1>
        <p className="text-gray-600 mt-2">내가 참여 중인 프로젝트와 이슈를 확인하세요</p>
      </div>

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
              <p className="text-sm text-gray-500 mb-1">마감 임박</p>
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

      {/* 차트 */}
      {dashboard && (
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card>
            <h3 className="text-lg font-semibold mb-4">상태별 이슈</h3>
            <IssueStatusChart data={dashboard.issuesByState || {}} />
          </Card>
          <Card>
            <h3 className="text-lg font-semibold mb-4">우선순위별 이슈</h3>
            <PriorityChart data={dashboard.issuesByPriority || {}} />
          </Card>
          <Card>
            <h3 className="text-lg font-semibold mb-4">타임라인</h3>
            <IssueTimelineChart issues={dashboard.recentIssues || []} />
          </Card>
        </div>
      )}

      {/* 상태별 이슈 */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">내 이슈</h2>
        <div className="grid grid-cols-3 gap-6">
          {Object.entries(dashboard?.issuesByState || {}).map(([state, issues]: [string, any]) => (
            <Card key={state} padding="md" hover>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{state}</h3>
                <span className="text-2xl font-bold text-blue-600">{issues.length}</span>
              </div>
              <ul className="space-y-2">
                {issues.slice(0, 5).map((issue: any) => (
                  <li key={issue.id} className="text-sm text-gray-600 truncate hover:text-blue-600 cursor-pointer">
                    • {issue.title}
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
        <div className="grid grid-cols-3 gap-6">
          {dashboard?.teams?.map((team: any) => (
            <Link href={`/dashboard/teams/${team.id}`} key={team.id}>
              <Card padding="md" hover>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{team.name}</h3>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {team.role}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{team.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>프로젝트 {team.projects?.length || 0}개</span>
                  <span>멤버 {team.memberCount || 0}명</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
