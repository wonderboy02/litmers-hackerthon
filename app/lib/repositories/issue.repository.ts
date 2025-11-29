import { createClient } from '@/app/lib/supabase/server'
import { Database } from '@/types/supabase'

type Issue = Database['public']['Tables']['issues']['Row']
type IssueInsert = Database['public']['Tables']['issues']['Insert']
type IssueUpdate = Database['public']['Tables']['issues']['Update']
type IssueHistory = Database['public']['Tables']['issue_histories']['Row']
type Subtask = Database['public']['Tables']['subtasks']['Row']

/**
 * 이슈 Repository
 * FR-030 ~ FR-035: 이슈 CRUD
 */
export const issueRepository = {
  /**
   * ID로 이슈 조회
   */
  async findById(id: string): Promise<any | null> {
    const supabase = await createClient()

    const { data } = await supabase
      .from('issues')
      .select(`
        *,
        assignee:users!issues_assignee_id_fkey(id, name, email, profile_image),
        project:projects(
          id,
          name,
          team_id,
          team:teams(id, name)
        ),
        state:project_states(id, name, color, position)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    return data
  },

  /**
   * 프로젝트의 모든 이슈 조회 (칸반 보드용)
   */
  async findByProject(projectId: string): Promise<Issue[]> {
    const supabase = await createClient()

    const { data } = await supabase
      .from('issues')
      .select(`
        *,
        assignee:users!issues_assignee_id_fkey(id, name, email, profile_image),
        state:project_states(id, name, color, position),
        labels:issue_labels(
          label:project_labels(id, name, color)
        ),
        subtasks(id, title, is_completed)
      `)
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .order('board_position', { ascending: true })

    return data || []
  },

  /**
   * 특정 상태의 이슈들 조회
   */
  async findByState(stateId: string): Promise<Issue[]> {
    const supabase = await createClient()

    const { data } = await supabase
      .from('issues')
      .select(`
        *,
        assignee:users!issues_assignee_id_fkey(id, name, email, profile_image)
      `)
      .eq('state_id', stateId)
      .is('deleted_at', null)
      .order('board_position', { ascending: true })

    return data || []
  },

  /**
   * 담당자의 이슈 조회
   */
  async findByAssignee(assigneeId: string): Promise<Issue[]> {
    const supabase = await createClient()

    const { data } = await supabase
      .from('issues')
      .select(`
        *,
        project:projects(id, name, team_id),
        state:project_states(id, name, color)
      `)
      .eq('assignee_id', assigneeId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    return data || []
  },

  /**
   * 이슈 생성
   */
  async create(issue: IssueInsert): Promise<Issue> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('issues')
      .insert(issue)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 이슈 수정
   */
  async update(id: string, updates: IssueUpdate): Promise<Issue> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('issues')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 이슈 이동 (상태 변경 + position 변경)
   */
  async move(id: string, newStateId: string, newPosition: number): Promise<Issue> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('issues')
      .update({
        state_id: newStateId,
        board_position: newPosition,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Soft Delete
   */
  async softDelete(id: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('issues')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  },

  /**
   * 프로젝트의 이슈 개수 조회 (제한 체크용)
   */
  async countByProject(projectId: string): Promise<number> {
    const supabase = await createClient()

    const { count, error } = await supabase
      .from('issues')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .is('deleted_at', null)

    if (error) throw error
    return count || 0
  },

  /**
   * 이슈 검색/필터링
   */
  async search(params: {
    projectId: string
    search?: string
    stateIds?: string[]
    assigneeIds?: string[]
    priorities?: ('HIGH' | 'MEDIUM' | 'LOW' | null)[]
    labelIds?: string[]
    hasDueDate?: boolean
    dueDateFrom?: string
    dueDateTo?: string
  }): Promise<Issue[]> {
    const supabase = await createClient()

    console.log('🔍 이슈 검색 시작:', params)

    let query = supabase
      .from('issues')
      .select(`
        *,
        assignee:users!issues_assignee_id_fkey(id, name, email, profile_image),
        state:project_states(id, name, color),
        labels:issue_labels(
          label:project_labels(id, name, color)
        )
      `)
      .eq('project_id', params.projectId)
      .is('deleted_at', null)

    console.log('📝 기본 쿼리 조건:', {
      project_id: params.projectId,
      deleted_at: null
    })

    // 제목 검색
    if (params.search) {
      query = query.ilike('title', `%${params.search}%`)
    }

    // 상태 필터
    if (params.stateIds && params.stateIds.length > 0) {
      query = query.in('state_id', params.stateIds)
    }

    // 담당자 필터
    if (params.assigneeIds && params.assigneeIds.length > 0) {
      query = query.in('assignee_id', params.assigneeIds)
    }

    // 우선순위 필터
    if (params.priorities && params.priorities.length > 0) {
      query = query.in('priority', params.priorities)
    }

    // 마감일 필터
    if (params.hasDueDate !== undefined) {
      if (params.hasDueDate) {
        query = query.not('due_date', 'is', null)
      } else {
        query = query.is('due_date', null)
      }
    }

    if (params.dueDateFrom) {
      query = query.gte('due_date', params.dueDateFrom)
    }

    if (params.dueDateTo) {
      query = query.lte('due_date', params.dueDateTo)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    console.log('📊 검색 결과:', {
      이슈수: data?.length || 0,
      에러: error,
      데이터: data
    })

    if (error) {
      console.error('❌ 이슈 검색 에러:', error)
      throw error
    }

    return data || []
  }
}

/**
 * 이슈 히스토리 Repository
 * FR-039: 이슈 변경 히스토리
 */
export const issueHistoryRepository = {
  /**
   * 히스토리 생성
   */
  async create(history: {
    issueId: string
    actorId: string
    fieldName: string
    oldValue: string | null
    newValue: string | null
  }): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('issue_histories')
      .insert({
        issue_id: history.issueId,
        actor_id: history.actorId,
        field_name: history.fieldName,
        old_value: history.oldValue,
        new_value: history.newValue
      })

    if (error) throw error
  },

  /**
   * 이슈의 히스토리 조회
   */
  async findByIssue(issueId: string, limit = 50): Promise<IssueHistory[]> {
    const supabase = await createClient()

    const { data } = await supabase
      .from('issue_histories')
      .select(`
        *,
        actor:users(id, name, profile_image)
      `)
      .eq('issue_id', issueId)
      .order('created_at', { ascending: false })
      .limit(limit)

    return data || []
  }
}

/**
 * 서브태스크 Repository
 * FR-039-2: 서브태스크
 */
export const subtaskRepository = {
  /**
   * 서브태스크 생성
   */
  async create(subtask: {
    issueId: string
    title: string
    position: number
  }): Promise<Subtask> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('subtasks')
      .insert({
        issue_id: subtask.issueId,
        title: subtask.title,
        position: subtask.position
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 이슈의 서브태스크 조회
   */
  async findByIssue(issueId: string): Promise<Subtask[]> {
    const supabase = await createClient()

    const { data } = await supabase
      .from('subtasks')
      .select('*')
      .eq('issue_id', issueId)
      .order('position', { ascending: true })

    return data || []
  },

  /**
   * 서브태스크 수정 (제목 또는 완료 상태)
   */
  async update(id: string, updates: {
    title?: string
    isCompleted?: boolean
  }): Promise<Subtask> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('subtasks')
      .update({
        title: updates.title,
        is_completed: updates.isCompleted,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 서브태스크 삭제
   */
  async delete(id: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  /**
   * 이슈의 서브태스크 개수 조회 (제한 체크용)
   */
  async countByIssue(issueId: string): Promise<number> {
    const supabase = await createClient()

    const { count, error } = await supabase
      .from('subtasks')
      .select('*', { count: 'exact', head: true })
      .eq('issue_id', issueId)

    if (error) throw error
    return count || 0
  },

  /**
   * 서브태스크 순서 변경
   */
  async updatePosition(id: string, newPosition: number): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('subtasks')
      .update({ position: newPosition })
      .eq('id', id)

    if (error) throw error
  }
}

/**
 * 이슈-라벨 연결 Repository
 * FR-038: 이슈 라벨/태그
 */
export const issueLabelRepository = {
  /**
   * 이슈에 라벨 추가
   */
  async addLabel(issueId: string, labelId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('issue_labels')
      .insert({ issue_id: issueId, label_id: labelId })

    if (error) throw error
  },

  /**
   * 이슈에서 라벨 제거
   */
  async removeLabel(issueId: string, labelId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('issue_labels')
      .delete()
      .eq('issue_id', issueId)
      .eq('label_id', labelId)

    if (error) throw error
  },

  /**
   * 이슈의 모든 라벨 제거
   */
  async removeAllLabels(issueId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('issue_labels')
      .delete()
      .eq('issue_id', issueId)

    if (error) throw error
  },

  /**
   * 이슈의 라벨 개수 조회 (제한 체크용)
   */
  async countByIssue(issueId: string): Promise<number> {
    const supabase = await createClient()

    const { count, error } = await supabase
      .from('issue_labels')
      .select('*', { count: 'exact', head: true })
      .eq('issue_id', issueId)

    if (error) throw error
    return count || 0
  }
}
