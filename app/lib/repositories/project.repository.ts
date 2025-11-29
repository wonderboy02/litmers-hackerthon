import { createClient } from '@/app/lib/supabase/server'
import type { Database } from '@/types/supabase'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']
type ProjectState = Database['public']['Tables']['project_states']['Row']
type ProjectStateInsert = Database['public']['Tables']['project_states']['Insert']
type ProjectLabel = Database['public']['Tables']['project_labels']['Row']
type ProjectLabelInsert = Database['public']['Tables']['project_labels']['Insert']

/**
 * Project Repository
 * FR-020 ~ FR-026: 프로젝트 CRUD
 * projects 테이블 데이터 접근 레이어
 */
export const projectRepository = {
  /**
   * ID로 프로젝트 조회
   * Soft Delete된 프로젝트는 제외
   */
  async findById(id: string): Promise<Project | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // 레코드 없음
      throw error
    }

    return data
  },

  /**
   * 팀의 모든 프로젝트 조회 (아카이브 포함/제외 옵션)
   * 각 프로젝트의 이슈 개수도 함께 반환
   */
  async findByTeamId(teamId: string, includeArchived: boolean = false): Promise<(Project & { issueCount?: number })[]> {
    const supabase = await createClient()

    let query = supabase
      .from('projects')
      .select(`
        *,
        issues:issues(count)
      `)
      .eq('team_id', teamId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (!includeArchived) {
      query = query.eq('is_archived', false)
    }

    const { data, error } = await query

    if (error) throw error

    // 이슈 개수를 issueCount 필드로 변환
    return (data || []).map((project: any) => ({
      ...project,
      issueCount: project.issues?.[0]?.count || 0,
      issues: undefined, // 원본 issues 배열 제거
    }))
  },

  /**
   * 사용자가 소유한 프로젝트 조회
   */
  async findByOwnerId(ownerId: string): Promise<Project[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', ownerId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * 팀의 프로젝트 개수 조회 (제한 체크용)
   */
  async countByTeamId(teamId: string): Promise<number> {
    const supabase = await createClient()

    const { count, error } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .is('deleted_at', null)

    if (error) throw error
    return count || 0
  },

  /**
   * 프로젝트 생성
   */
  async create(project: ProjectInsert): Promise<Project> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 프로젝트 수정
   */
  async update(id: string, updates: ProjectUpdate): Promise<Project> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 프로젝트 아카이브
   * FR-026: 아카이브 기능
   */
  async archive(id: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('projects')
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  },

  /**
   * 프로젝트 아카이브 해제
   */
  async unarchive(id: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('projects')
      .update({ is_archived: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  },

  /**
   * 프로젝트 Soft Delete
   */
  async softDelete(id: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  },
}

/**
 * Project State Repository
 * FR-053, FR-054: 커스텀 상태(칸반 컬럼) 관리
 * project_states 테이블 데이터 접근 레이어
 */
export const projectStateRepository = {
  /**
   * ID로 상태 조회
   */
  async findById(id: string): Promise<ProjectState | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('project_states')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  },

  /**
   * 프로젝트의 모든 상태 조회 (position 순서대로)
   */
  async findByProjectId(projectId: string): Promise<ProjectState[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('project_states')
      .select('*')
      .eq('project_id', projectId)
      .order('position', { ascending: true })

    if (error) throw error
    return data || []
  },

  /**
   * 상태 생성
   */
  async create(state: ProjectStateInsert): Promise<ProjectState> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('project_states')
      .insert(state)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 여러 상태 일괄 생성 (프로젝트 생성 시 기본 상태용)
   */
  async createMany(states: ProjectStateInsert[]): Promise<ProjectState[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('project_states')
      .insert(states)
      .select()

    if (error) throw error
    return data || []
  },

  /**
   * 상태 수정 (이름, 색상, WIP Limit 등)
   */
  async update(id: string, updates: Partial<ProjectStateInsert>): Promise<ProjectState> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('project_states')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 상태 삭제
   * ⚠️ 주의: 이 상태를 사용하는 이슈가 없어야 함 (FK 제약)
   */
  async delete(id: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('project_states')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

/**
 * Project Label Repository
 * FR-038: 라벨 관리
 * project_labels 테이블 데이터 접근 레이어
 */
export const projectLabelRepository = {
  /**
   * ID로 라벨 조회
   */
  async findById(id: string): Promise<ProjectLabel | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('project_labels')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  },

  /**
   * 프로젝트의 모든 라벨 조회
   */
  async findByProjectId(projectId: string): Promise<ProjectLabel[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('project_labels')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  /**
   * 라벨 생성
   */
  async create(label: ProjectLabelInsert): Promise<ProjectLabel> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('project_labels')
      .insert(label)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 라벨 수정
   */
  async update(id: string, updates: Partial<ProjectLabelInsert>): Promise<ProjectLabel> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('project_labels')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 라벨 삭제
   */
  async delete(id: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('project_labels')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

/**
 * Favorite Project Repository
 * FR-027: 즐겨찾기 관리
 * favorite_projects 테이블 데이터 접근 레이어
 */
export const favoriteProjectRepository = {
  /**
   * 사용자의 즐겨찾기 프로젝트 목록 조회
   */
  async findByUserId(userId: string): Promise<Project[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('favorite_projects')
      .select(`
        project:projects(*)
      `)
      .eq('user_id', userId)

    if (error) throw error

    // @ts-ignore - Supabase 타입 이슈
    return data?.map(item => item.project).filter(Boolean) || []
  },

  /**
   * 즐겨찾기 추가
   */
  async add(userId: string, projectId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('favorite_projects')
      .insert({ user_id: userId, project_id: projectId })

    if (error) throw error
  },

  /**
   * 즐겨찾기 제거
   */
  async remove(userId: string, projectId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('favorite_projects')
      .delete()
      .eq('user_id', userId)
      .eq('project_id', projectId)

    if (error) throw error
  },

  /**
   * 즐겨찾기 여부 확인
   */
  async isFavorite(userId: string, projectId: string): Promise<boolean> {
    const supabase = await createClient()

    const { count, error } = await supabase
      .from('favorite_projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('project_id', projectId)

    if (error) throw error
    return (count || 0) > 0
  },
}
