import { createClient } from '@/app/lib/supabase/server'
import { NotFoundError, ForbiddenError } from '@/app/lib/errors'
import { isWithinDays } from '@/app/lib/utils/date'

/**
 * 대시보드/통계 Service
 * FR-080 ~ FR-082
 */
export const dashboardService = {
  /**
   * FR-081: 개인 대시보드
   */
  async getPersonalDashboard(userId: string) {
    const supabase = await createClient()

    // 1. 내가 담당한 이슈 (상태별 분류)
    const { data: myIssues } = await supabase
      .from('issues')
      .select(`
        id,
        title,
        priority,
        due_date,
        state_id,
        project:projects(id, name, team_id),
        state:project_states(id, name, color)
      `)
      .eq('assignee_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50)

    const issues = myIssues || []

    // 상태별 그룹화
    const issuesByState = issues.reduce((acc: any, issue: any) => {
      const stateName = issue.state?.name || 'Unknown'
      if (!acc[stateName]) acc[stateName] = []
      acc[stateName].push(issue)
      return acc
    }, {})

    // 2. 마감 임박 이슈 (7일 이내)
    const dueSoonIssues = issues.filter((issue: any) =>
      issue.due_date && isWithinDays(issue.due_date, 7)
    )

    // 3. 오늘 마감 이슈
    const today = new Date().toISOString().split('T')[0]
    const dueTodayIssues = issues.filter((issue: any) =>
      issue.due_date && issue.due_date.startsWith(today)
    )

    // 4. 최근 내가 작성한 댓글
    const { data: recentComments } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        issue:issues(id, title, project_id)
      `)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5)

    // 5. 소속 팀/프로젝트 목록
    const { data: teamMembers } = await supabase
      .from('team_members')
      .select(`
        role,
        team_id,
        teams!inner(
          id,
          name,
          description
        )
      `)
      .eq('user_id', userId)

    // 각 팀의 프로젝트와 멤버 수 조회
    const teamsWithMemberCount = await Promise.all(
      (teamMembers || []).map(async (tm: any) => {
        const teamId = tm.teams.id

        // 프로젝트 수 조회
        const { data: projects } = await supabase
          .from('projects')
          .select('id, name')
          .eq('team_id', teamId)
          .is('deleted_at', null)

        // 멤버 수 조회
        const { count } = await supabase
          .from('team_members')
          .select('*', { count: 'exact', head: true })
          .eq('team_id', teamId)

        return {
          id: tm.teams.id,
          name: tm.teams.name,
          description: tm.teams.description,
          role: tm.role,
          projects: projects || [],
          memberCount: count || 0
        }
      })
    )

    return {
      totalIssues: issues.length,
      issuesByState,
      dueSoonIssues,
      dueTodayIssues,
      recentComments: recentComments || [],
      teams: teamsWithMemberCount
    }
  },

  /**
   * FR-080: 프로젝트 대시보드
   */
  async getProjectDashboard(projectId: string, userId: string) {
    const supabase = await createClient()

    // 팀 멤버십 확인
    await this.verifyTeamMembership(projectId, userId)

    // 1. 프로젝트 정보
    const { data: project } = await supabase
      .from('projects')
      .select('id, name, description, created_at')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single()

    if (!project) {
      throw new NotFoundError('프로젝트를 찾을 수 없습니다')
    }

    // 2. 상태별 이슈 개수
    const { data: issues } = await supabase
      .from('issues')
      .select(`
        id,
        priority,
        due_date,
        state:project_states(id, name, color)
      `)
      .eq('project_id', projectId)
      .is('deleted_at', null)

    const totalIssues = issues?.length || 0

    // 상태별 개수
    const issuesByState = (issues || []).reduce((acc: any, issue: any) => {
      const stateName = issue.state?.name || 'Unknown'
      if (!acc[stateName]) {
        acc[stateName] = {
          count: 0,
          color: issue.state?.color || '#gray'
        }
      }
      acc[stateName].count++
      return acc
    }, {})

    // 3. 완료율 계산
    const doneIssues = (issues || []).filter((i: any) => i.state?.name === 'Done')
    const completionRate = totalIssues > 0
      ? Math.round((doneIssues.length / totalIssues) * 100)
      : 0

    // 4. 우선순위별 이슈 개수
    const issuesByPriority = (issues || []).reduce((acc: any, issue: any) => {
      const priority = issue.priority || 'MEDIUM'
      acc[priority] = (acc[priority] || 0) + 1
      return acc
    }, {})

    // 5. 최근 생성된 이슈 (최대 5개)
    const { data: recentIssues } = await supabase
      .from('issues')
      .select(`
        id,
        title,
        priority,
        created_at,
        assignee:users(id, name, profile_image)
      `)
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5)

    // 6. 마감 임박 이슈 (7일 이내, 최대 5개)
    const dueSoonIssues = (issues || [])
      .filter((issue: any) => issue.due_date && isWithinDays(issue.due_date, 7))
      .slice(0, 5)

    return {
      project,
      totalIssues,
      issuesByState,
      completionRate,
      issuesByPriority,
      recentIssues: recentIssues || [],
      dueSoonIssues
    }
  },

  /**
   * FR-082: 팀 통계
   */
  async getTeamStatistics(teamId: string, userId: string, days: number = 30) {
    const supabase = await createClient()

    // 팀 멤버십 확인
    const { count } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .eq('user_id', userId)

    if (!count || count === 0) {
      throw new ForbiddenError('팀 멤버가 아닙니다')
    }

    // 기간 계산
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString()

    // 1. 팀의 모든 프로젝트 조회
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name')
      .eq('team_id', teamId)
      .is('deleted_at', null)

    if (!projects || projects.length === 0) {
      return {
        issueCreationTrend: [],
        issueCompletionTrend: [],
        issuesByMember: [],
        completedByMember: [],
        projectStats: []
      }
    }

    const projectIds = projects.map(p => p.id)

    // 2. 기간별 이슈 생성 추이
    const { data: createdIssues } = await supabase
      .from('issues')
      .select('created_at, project_id')
      .in('project_id', projectIds)
      .gte('created_at', startDateStr)
      .is('deleted_at', null)

    // 일별 그룹화
    const issueCreationTrend = this.groupByDate(createdIssues || [], days)

    // 3. 기간별 이슈 완료 추이 (Done 상태로 변경된 시점)
    const { data: completedIssuesData } = await supabase
      .from('issue_histories')
      .select('created_at, issue_id')
      .eq('field_name', 'STATUS')
      .eq('new_value', 'Done')
      .gte('created_at', startDateStr)

    const issueCompletionTrend = this.groupByDate(completedIssuesData || [], days)

    // 4. 멤버별 담당 이슈 수
    const { data: issuesByMemberData } = await supabase
      .from('issues')
      .select(`
        assignee_id,
        assignee:users(name)
      `)
      .in('project_id', projectIds)
      .is('deleted_at', null)
      .not('assignee_id', 'is', null)

    const issuesByMember = this.groupByMember(issuesByMemberData || [])

    // 5. 멤버별 완료 이슈 수
    const { data: completedIssues } = await supabase
      .from('issues')
      .select(`
        assignee_id,
        assignee:users(name),
        state:project_states(name)
      `)
      .in('project_id', projectIds)
      .is('deleted_at', null)
      .not('assignee_id', 'is', null)

    const completedByMember = this.groupByMember(
      (completedIssues || []).filter((i: any) => i.state?.name === 'Done')
    )

    // 6. 프로젝트별 이슈 현황
    const projectStats = await Promise.all(
      projects.map(async (project) => {
        const { count: totalCount } = await supabase
          .from('issues')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id)
          .is('deleted_at', null)

        const { count: doneCount } = await supabase
          .from('issues')
          .select('issues.*, project_states!inner(name)', { count: 'exact', head: true })
          .eq('project_id', project.id)
          .eq('project_states.name', 'Done')
          .is('deleted_at', null)

        return {
          projectId: project.id,
          projectName: project.name,
          totalIssues: totalCount || 0,
          completedIssues: doneCount || 0,
          completionRate: totalCount && totalCount > 0
            ? Math.round((doneCount || 0) / totalCount * 100)
            : 0
        }
      })
    )

    return {
      issueCreationTrend,
      issueCompletionTrend,
      issuesByMember,
      completedByMember,
      projectStats
    }
  },

  /**
   * 날짜별 그룹화 헬퍼
   */
  groupByDate(data: any[], days: number) {
    const result: { date: string; count: number }[] = []
    const dateMap = new Map<string, number>()

    // 데이터 카운트
    data.forEach((item) => {
      const date = item.created_at.split('T')[0]
      dateMap.set(date, (dateMap.get(date) || 0) + 1)
    })

    // 모든 날짜 포함 (0 포함)
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      result.push({
        date: dateStr,
        count: dateMap.get(dateStr) || 0
      })
    }

    return result
  },

  /**
   * 멤버별 그룹화 헬퍼
   */
  groupByMember(data: any[]) {
    const memberMap = new Map<string, { name: string; count: number }>()

    data.forEach((item) => {
      const id = item.assignee_id
      const name = item.assignee?.name || 'Unknown'

      if (!memberMap.has(id)) {
        memberMap.set(id, { name, count: 0 })
      }

      memberMap.get(id)!.count++
    })

    return Array.from(memberMap.entries()).map(([id, data]) => ({
      userId: id,
      userName: data.name,
      count: data.count
    }))
  },

  /**
   * 팀 멤버십 확인
   */
  async verifyTeamMembership(projectId: string, userId: string) {
    const supabase = await createClient()

    const { data: project } = await supabase
      .from('projects')
      .select('team_id')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single()

    if (!project) {
      throw new NotFoundError('프로젝트를 찾을 수 없습니다')
    }

    const { count } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', project.team_id)
      .eq('user_id', userId)

    if (!count || count === 0) {
      throw new ForbiddenError('팀 멤버가 아닙니다')
    }
  }
}
