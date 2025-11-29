'use client'

import { useQuery } from '@tanstack/react-query'

/**
 * 칸반 보드 데이터 조회 Hook
 * 프로젝트의 상태(컬럼)과 각 상태별 이슈를 가져옵니다
 */
export function useKanbanData(projectId: string) {
  return useQuery({
    queryKey: ['kanban', projectId],
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0, // 즉시 stale로 설정하여 invalidate 시 바로 refetch
    queryFn: async () => {
      console.log('🔵 칸반 데이터 페칭 시작:', projectId)

      // 1. 프로젝트 상태(컬럼) 조회
      const statesRes = await fetch(`/api/projects/${projectId}/states`)
      if (!statesRes.ok) throw new Error('상태 목록을 불러오는데 실패했습니다')
      const statesData = await statesRes.json()

      // 2. 프로젝트의 모든 이슈 조회
      const issuesRes = await fetch(`/api/projects/${projectId}/issues`)
      if (!issuesRes.ok) throw new Error('이슈 목록을 불러오는데 실패했습니다')
      const issuesData = await issuesRes.json()

      // API 응답 구조: { states: [...] }, { issues: [...] } 또는 배열
      const states = Array.isArray(statesData) ? statesData : statesData.states || []
      const issues = Array.isArray(issuesData) ? issuesData : issuesData.issues || []

      console.log('📊 조회된 상태 수:', states.length)
      console.log('📋 조회된 이슈 수:', issues.length)

      // 3. 상태별로 이슈 그룹화
      const kanbanData = states.map((state: any) => ({
        ...state,
        issues: issues
          .filter((issue: any) => issue.state_id === state.id)
          .sort((a: any, b: any) => a.board_position - b.board_position)
      }))

      console.log('✅ 칸반 데이터 페칭 완료:', kanbanData)

      return {
        states: kanbanData,
        totalIssues: issues.length
      }
    },
    enabled: !!projectId
  })
}
