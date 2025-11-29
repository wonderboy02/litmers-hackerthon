import { createClient } from '@/app/lib/supabase/server'
import {
  issueRepository,
  issueHistoryRepository,
  subtaskRepository,
  issueLabelRepository
} from '@/app/lib/repositories/issue.repository'
import { calculatePosition } from '@/app/lib/utils/position'
import { ValidationError, NotFoundError, ForbiddenError } from '@/app/lib/errors'
import { createNotification } from '@/app/lib/notifications'

/**
 * 이슈 Service
 * FR-030 ~ FR-039-2
 */
export const issueService = {
  /**
   * FR-030: 이슈 생성
   */
  async createIssue(
    projectId: string,
    userId: string,
    data: {
      title: string
      description?: string
      assigneeUserId?: string
      dueDate?: string
      priority?: 'HIGH' | 'MEDIUM' | 'LOW'
      labelIds?: string[]
    }
  ) {
    const supabase = await createClient()

    // 프로젝트당 최대 200개 제한
    const count = await issueRepository.countByProject(projectId)
    if (count >= 200) {
      throw new ValidationError('프로젝트당 최대 200개 이슈만 생성 가능합니다')
    }

    // 프로젝트 정보 조회 (팀 멤버십 확인용)
    const { data: project } = await supabase
      .from('projects')
      .select('id, team_id')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single()

    if (!project) {
      throw new NotFoundError('프로젝트를 찾을 수 없습니다')
    }

    // 담당자가 팀 멤버인지 확인
    if (data.assigneeUserId) {
      const { count: memberCount } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', project.team_id)
        .eq('user_id', data.assigneeUserId)

      if (!memberCount || memberCount === 0) {
        throw new ValidationError('담당자는 팀 멤버여야 합니다')
      }
    }

    // 기본 상태 조회 (Backlog)
    const { data: states } = await supabase
      .from('project_states')
      .select('id')
      .eq('project_id', projectId)
      .order('position', { ascending: true })
      .limit(1)

    if (!states || states.length === 0) {
      throw new Error('프로젝트에 상태가 없습니다')
    }

    const defaultStateId = states[0].id

    // 컬럼 최하단 position 계산
    const existingIssues = await issueRepository.findByState(defaultStateId)
    const maxPosition = existingIssues.length > 0
      ? Math.max(...existingIssues.map(i => i.board_position))
      : 0
    const newPosition = maxPosition + 1.0

    // 이슈 생성
    const issue = await issueRepository.create({
      project_id: projectId,
      author_id: userId,
      state_id: defaultStateId,
      title: data.title,
      description: data.description,
      assignee_id: data.assigneeUserId,
      due_date: data.dueDate,
      priority: data.priority || 'MEDIUM',
      board_position: newPosition
    })

    // 라벨 추가 (최대 5개 제한)
    if (data.labelIds && data.labelIds.length > 0) {
      if (data.labelIds.length > 5) {
        throw new ValidationError('이슈당 최대 5개 라벨만 추가 가능합니다')
      }

      for (const labelId of data.labelIds) {
        await issueLabelRepository.addLabel(issue.id, labelId)
      }
    }

    // 담당자에게 알림
    if (data.assigneeUserId && data.assigneeUserId !== userId) {
      console.log('🔔 [알림] 이슈 생성 - 담당자에게 알림 전송 시작')
      console.log('   담당자 ID:', data.assigneeUserId)
      console.log('   생성자 ID:', userId)
      console.log('   이슈 ID:', issue.id)
      console.log('   이슈 제목:', data.title)

      try {
        await createNotification({
          userId: data.assigneeUserId,
          type: 'ISSUE_ASSIGNED',
          title: '새로운 이슈가 할당되었습니다',
          content: `"${data.title}" 이슈의 담당자로 지정되었습니다`,
          relatedId: issue.id,
          relatedType: 'ISSUE'
        })
        console.log('✅ [알림] 알림 생성 성공')
      } catch (error) {
        console.error('❌ [알림] 알림 생성 실패:', error)
        // 알림 실패해도 이슈 생성은 성공으로 처리
      }
    } else {
      console.log('⏭️ [알림] 알림 생성 스킵')
      console.log('   담당자 ID:', data.assigneeUserId)
      console.log('   생성자 ID:', userId)
      console.log('   조건:', data.assigneeUserId && data.assigneeUserId !== userId ? '만족' : '불만족')
    }

    return issue
  },

  /**
   * FR-031: 이슈 상세 조회
   */
  async getIssue(issueId: string, userId: string) {
    const issue = await issueRepository.findById(issueId)
    if (!issue) {
      throw new NotFoundError('이슈를 찾을 수 없습니다')
    }

    // 팀 멤버십 확인
    await this.verifyTeamMembership(issue.project_id, userId)

    // 서브태스크 조회
    const subtasks = await subtaskRepository.findByIssue(issueId)

    return {
      ...issue,
      subtasks
    }
  },

  /**
   * FR-032: 이슈 수정
   */
  async updateIssue(
    issueId: string,
    userId: string,
    updates: {
      title?: string
      description?: string
      assigneeUserId?: string | null
      dueDate?: string | null
      priority?: 'HIGH' | 'MEDIUM' | 'LOW'
      labelIds?: string[]
    }
  ) {
    const supabase = await createClient()

    const issue = await issueRepository.findById(issueId)
    if (!issue) {
      throw new NotFoundError('이슈를 찾을 수 없습니다')
    }

    // 팀 멤버십 확인
    await this.verifyTeamMembership(issue.project_id, userId)

    // 담당자 변경 시 팀 멤버 확인
    if (updates.assigneeUserId) {
      const { data: project } = await supabase
        .from('projects')
        .select('team_id')
        .eq('id', issue.project_id)
        .single()

      const { count } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', project!.team_id)
        .eq('user_id', updates.assigneeUserId)

      if (!count || count === 0) {
        throw new ValidationError('담당자는 팀 멤버여야 합니다')
      }
    }

    // 변경 히스토리 기록
    const changes: Array<{ field: string; oldValue: string | null; newValue: string | null }> = []

    if (updates.title && updates.title !== issue.title) {
      changes.push({ field: 'TITLE', oldValue: issue.title, newValue: updates.title })
    }

    if (updates.assigneeUserId !== undefined && updates.assigneeUserId !== issue.assignee_id) {
      changes.push({
        field: 'ASSIGNEE',
        oldValue: issue.assignee_id,
        newValue: updates.assigneeUserId
      })
    }

    if (updates.priority && updates.priority !== issue.priority) {
      changes.push({ field: 'PRIORITY', oldValue: issue.priority, newValue: updates.priority })
    }

    if (updates.dueDate !== undefined && updates.dueDate !== issue.due_date) {
      changes.push({ field: 'DUE_DATE', oldValue: issue.due_date, newValue: updates.dueDate })
    }

    // 히스토리 저장
    for (const change of changes) {
      await issueHistoryRepository.create({
        issueId,
        actorId: userId,
        fieldName: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue
      })
    }

    // 이슈 업데이트
    const updated = await issueRepository.update(issueId, {
      title: updates.title,
      description: updates.description,
      assignee_id: updates.assigneeUserId,
      due_date: updates.dueDate,
      priority: updates.priority
    })

    // 라벨 업데이트
    if (updates.labelIds) {
      if (updates.labelIds.length > 5) {
        throw new ValidationError('이슈당 최대 5개 라벨만 추가 가능합니다')
      }

      // 기존 라벨 제거
      await issueLabelRepository.removeAllLabels(issueId)

      // 새 라벨 추가
      for (const labelId of updates.labelIds) {
        await issueLabelRepository.addLabel(issueId, labelId)
      }
    }

    // 담당자 변경 알림
    if (updates.assigneeUserId && updates.assigneeUserId !== issue.assignee_id) {
      await createNotification({
        userId: updates.assigneeUserId,
        type: 'ISSUE_ASSIGNED',
        title: '이슈가 할당되었습니다',
        content: `"${updated.title}" 이슈의 담당자로 지정되었습니다`,
        relatedId: issueId,
        relatedType: 'ISSUE'
      })
    }

    return updated
  },

  /**
   * FR-033: 이슈 상태 변경 (Drag & Drop)
   */
  async moveIssue(
    issueId: string,
    userId: string,
    data: {
      newStateId: string
      prevItemPosition: number | null
      nextItemPosition: number | null
    }
  ) {
    const supabase = await createClient()

    const issue = await issueRepository.findById(issueId)
    if (!issue) {
      throw new NotFoundError('이슈를 찾을 수 없습니다')
    }

    // 팀 멤버십 확인
    await this.verifyTeamMembership(issue.project_id, userId)

    // 새 position 계산
    const newPosition = calculatePosition(data.prevItemPosition, data.nextItemPosition)

    // 상태 변경 히스토리 (상태가 바뀐 경우만)
    if (issue.state_id !== data.newStateId) {
      const { data: oldState } = await supabase
        .from('project_states')
        .select('name')
        .eq('id', issue.state_id)
        .single()

      const { data: newState } = await supabase
        .from('project_states')
        .select('name')
        .eq('id', data.newStateId)
        .single()

      await issueHistoryRepository.create({
        issueId,
        actorId: userId,
        fieldName: 'STATUS',
        oldValue: oldState?.name || null,
        newValue: newState?.name || null
      })
    }

    // 이슈 이동
    const updated = await issueRepository.move(issueId, data.newStateId, newPosition)

    return updated
  },

  /**
   * FR-035: 이슈 삭제
   */
  async deleteIssue(issueId: string, userId: string) {
    const issue = await issueRepository.findById(issueId)
    if (!issue) {
      throw new NotFoundError('이슈를 찾을 수 없습니다')
    }

    // 권한 확인: 이슈 소유자, 프로젝트 소유자, 팀 OWNER/ADMIN
    const canDelete = await this.canDeleteIssue(issue, userId)
    if (!canDelete) {
      throw new ForbiddenError('이슈를 삭제할 권한이 없습니다')
    }

    await issueRepository.softDelete(issueId)

    return { success: true }
  },

  /**
   * FR-036: 이슈 검색/필터링
   */
  async searchIssues(
    projectId: string,
    userId: string,
    filters: {
      search?: string
      stateIds?: string[]
      assigneeIds?: string[]
      priorities?: ('HIGH' | 'MEDIUM' | 'LOW')[]
      labelIds?: string[]
      hasDueDate?: boolean
      dueDateFrom?: string
      dueDateTo?: string
    }
  ) {
    // 팀 멤버십 확인
    await this.verifyTeamMembership(projectId, userId)

    return await issueRepository.search({
      projectId,
      ...filters
    })
  },

  /**
   * FR-039: 이슈 변경 히스토리 조회
   */
  async getIssueHistory(issueId: string, userId: string) {
    const issue = await issueRepository.findById(issueId)
    if (!issue) {
      throw new NotFoundError('이슈를 찾을 수 없습니다')
    }

    await this.verifyTeamMembership(issue.project_id, userId)

    return await issueHistoryRepository.findByIssue(issueId)
  },

  /**
   * FR-039-2: 서브태스크 생성
   */
  async createSubtask(issueId: string, userId: string, title: string) {
    const issue = await issueRepository.findById(issueId)
    if (!issue) {
      throw new NotFoundError('이슈를 찾을 수 없습니다')
    }

    await this.verifyTeamMembership(issue.project_id, userId)

    // 최대 20개 제한
    const count = await subtaskRepository.countByIssue(issueId)
    if (count >= 20) {
      throw new ValidationError('이슈당 최대 20개 서브태스크만 생성 가능합니다')
    }

    // 최하단 position 계산
    const subtasks = await subtaskRepository.findByIssue(issueId)
    const maxPosition = subtasks.length > 0
      ? Math.max(...subtasks.map(s => s.position))
      : 0

    return await subtaskRepository.create({
      issueId,
      title,
      position: maxPosition + 1.0
    })
  },

  /**
   * 서브태스크 수정
   */
  async updateSubtask(
    subtaskId: string,
    userId: string,
    updates: { title?: string; isCompleted?: boolean }
  ) {
    const supabase = await createClient()

    const { data: subtask } = await supabase
      .from('subtasks')
      .select('issue_id')
      .eq('id', subtaskId)
      .single()

    if (!subtask) {
      throw new NotFoundError('서브태스크를 찾을 수 없습니다')
    }

    const issue = await issueRepository.findById(subtask.issue_id)
    if (!issue) {
      throw new NotFoundError('이슈를 찾을 수 없습니다')
    }

    await this.verifyTeamMembership(issue.project_id, userId)

    return await subtaskRepository.update(subtaskId, updates)
  },

  /**
   * 서브태스크 삭제
   */
  async deleteSubtask(subtaskId: string, userId: string) {
    const supabase = await createClient()

    const { data: subtask } = await supabase
      .from('subtasks')
      .select('issue_id')
      .eq('id', subtaskId)
      .single()

    if (!subtask) {
      throw new NotFoundError('서브태스크를 찾을 수 없습니다')
    }

    const issue = await issueRepository.findById(subtask.issue_id)
    if (!issue) {
      throw new NotFoundError('이슈를 찾을 수 없습니다')
    }

    await this.verifyTeamMembership(issue.project_id, userId)

    await subtaskRepository.delete(subtaskId)

    return { success: true }
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
  },

  /**
   * 이슈 삭제 권한 확인
   */
  async canDeleteIssue(issue: any, userId: string): Promise<boolean> {
    const supabase = await createClient()

    // 이슈 작성자
    if (issue.author_id === userId) {
      return true
    }

    // 프로젝트 소유자
    const { data: project } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', issue.project_id)
      .single()

    if (project?.owner_id === userId) {
      return true
    }

    // 팀 OWNER/ADMIN
    const { data: member } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', issue.project.team_id)
      .eq('user_id', userId)
      .single()

    if (member?.role === 'OWNER' || member?.role === 'ADMIN') {
      return true
    }

    return false
  }
}
