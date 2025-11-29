import {
  projectRepository,
  projectStateRepository,
  projectLabelRepository,
  favoriteProjectRepository,
} from '@/app/lib/repositories/project.repository'
import { teamMemberRepository, teamActivityLogRepository } from '@/app/lib/repositories/team.repository'
import { ValidationError, NotFoundError, ForbiddenError } from '@/app/lib/errors'

/**
 * Project Service
 * FR-020 ~ FR-027, FR-053, FR-054
 * 프로젝트 관리 비즈니스 로직
 */
export const projectService = {
  /**
   * FR-020: 프로젝트 생성
   * ⭐ 핵심: 기본 상태 3개 자동 생성 (Backlog, In Progress, Done)
   *
   * 1. 팀당 최대 15개 제한 체크
   * 2. 팀 멤버십 확인
   * 3. 프로젝트 생성
   * 4. 기본 상태 3개 생성 (이것이 없으면 칸반 보드 작동 안 함!)
   * 5. 활동 로그 기록
   */
  async createProject(
    teamId: string,
    userId: string,
    data: {
      name: string
      description?: string
    }
  ) {
    // 1. 팀 멤버십 확인
    const member = await teamMemberRepository.findMember(teamId, userId)
    if (!member) {
      throw new ForbiddenError('팀 멤버만 프로젝트를 생성할 수 있습니다')
    }

    // 2. 팀당 최대 15개 프로젝트 제한
    const projectCount = await projectRepository.countByTeamId(teamId)
    if (projectCount >= 15) {
      throw new ValidationError('팀당 최대 15개 프로젝트만 생성 가능합니다')
    }

    // 3. 프로젝트 생성
    const project = await projectRepository.create({
      team_id: teamId,
      owner_id: userId,
      name: data.name,
      description: data.description,
    })

    // 4. ⭐ 기본 상태 3개 자동 생성 (핵심!)
    const defaultStates = [
      { name: 'Backlog', position: 1.0, color: '#6B7280' }, // gray
      { name: 'In Progress', position: 2.0, color: '#3B82F6' }, // blue
      { name: 'Done', position: 3.0, color: '#10B981' }, // green
    ]

    await projectStateRepository.createMany(
      defaultStates.map((state) => ({
        project_id: project.id,
        name: state.name,
        position: state.position,
        color: state.color,
      }))
    )

    // 5. 활동 로그 기록
    await teamActivityLogRepository.create({
      teamId,
      actorId: userId,
      targetType: 'PROJECT',
      targetId: project.id,
      actionType: 'CREATED',
      details: { projectName: project.name },
    })

    return project
  },

  /**
   * FR-021: 프로젝트 목록 조회
   * 팀 멤버면 조회 가능
   */
  async getProjects(teamId: string, userId: string, includeArchived: boolean = false) {
    // 팀 멤버십 확인
    const member = await teamMemberRepository.findMember(teamId, userId)
    if (!member) {
      throw new ForbiddenError('팀 멤버만 프로젝트를 조회할 수 있습니다')
    }

    return await projectRepository.findByTeamId(teamId, includeArchived)
  },

  /**
   * FR-022: 프로젝트 상세 조회
   */
  async getProjectById(projectId: string, userId: string) {
    const project = await projectRepository.findById(projectId)
    if (!project) {
      throw new NotFoundError('프로젝트를 찾을 수 없습니다')
    }

    // 팀 멤버십 확인
    const member = await teamMemberRepository.findMember(project.team_id, userId)
    if (!member) {
      throw new ForbiddenError('접근 권한이 없습니다')
    }

    return project
  },

  /**
   * FR-023: 프로젝트 수정
   * 권한: 프로젝트 소유자 또는 팀 OWNER, ADMIN
   */
  async updateProject(
    projectId: string,
    userId: string,
    data: {
      name?: string
      description?: string
    }
  ) {
    const project = await projectRepository.findById(projectId)
    if (!project) {
      throw new NotFoundError('프로젝트를 찾을 수 없습니다')
    }

    // 권한 검증
    await this.verifyProjectPermission(projectId, userId)

    return await projectRepository.update(projectId, data)
  },

  /**
   * FR-025: 프로젝트 삭제
   * 권한: 프로젝트 소유자 또는 팀 OWNER
   */
  async deleteProject(projectId: string, userId: string) {
    const project = await projectRepository.findById(projectId)
    if (!project) {
      throw new NotFoundError('프로젝트를 찾을 수 없습니다')
    }

    // 권한 검증 (소유자 또는 팀 OWNER)
    const member = await teamMemberRepository.findMember(project.team_id, userId)
    if (project.owner_id !== userId && member?.role !== 'OWNER') {
      throw new ForbiddenError('프로젝트 소유자 또는 팀 OWNER만 삭제할 수 있습니다')
    }

    // Soft Delete
    await projectRepository.softDelete(projectId)

    // 활동 로그
    await teamActivityLogRepository.create({
      teamId: project.team_id,
      actorId: userId,
      targetType: 'PROJECT',
      targetId: projectId,
      actionType: 'DELETED',
      details: { projectName: project.name },
    })

    return { success: true }
  },

  /**
   * FR-026: 프로젝트 아카이브
   * 권한: 프로젝트 소유자 또는 팀 OWNER, ADMIN
   */
  async archiveProject(projectId: string, userId: string) {
    await this.verifyProjectPermission(projectId, userId)
    await projectRepository.archive(projectId)
    return { success: true }
  },

  /**
   * 프로젝트 아카이브 해제
   */
  async unarchiveProject(projectId: string, userId: string) {
    await this.verifyProjectPermission(projectId, userId)
    await projectRepository.unarchive(projectId)
    return { success: true }
  },

  /**
   * FR-027: 즐겨찾기 추가
   */
  async addFavorite(projectId: string, userId: string) {
    const project = await projectRepository.findById(projectId)
    if (!project) {
      throw new NotFoundError('프로젝트를 찾을 수 없습니다')
    }

    // 팀 멤버십 확인
    const member = await teamMemberRepository.findMember(project.team_id, userId)
    if (!member) {
      throw new ForbiddenError('접근 권한이 없습니다')
    }

    await favoriteProjectRepository.add(userId, projectId)
    return { success: true }
  },

  /**
   * 즐겨찾기 제거
   */
  async removeFavorite(projectId: string, userId: string) {
    await favoriteProjectRepository.remove(userId, projectId)
    return { success: true }
  },

  /**
   * 즐겨찾기 목록 조회
   */
  async getFavorites(userId: string) {
    return await favoriteProjectRepository.findByUserId(userId)
  },

  /**
   * FR-053: 커스텀 상태 생성
   * 권한: 프로젝트 소유자 또는 팀 OWNER, ADMIN
   */
  async createCustomState(
    projectId: string,
    userId: string,
    data: {
      name: string
      color?: string
      position: number
      wipLimit?: number
    }
  ) {
    await this.verifyProjectPermission(projectId, userId)

    return await projectStateRepository.create({
      project_id: projectId,
      name: data.name,
      position: data.position,
      color: data.color || '#6B7280',
      wip_limit: data.wipLimit,
    })
  },

  /**
   * 프로젝트 상태 목록 조회
   */
  async getStates(projectId: string, userId: string) {
    const project = await projectRepository.findById(projectId)
    if (!project) {
      throw new NotFoundError('프로젝트를 찾을 수 없습니다')
    }

    // 팀 멤버십 확인
    const member = await teamMemberRepository.findMember(project.team_id, userId)
    if (!member) {
      throw new ForbiddenError('접근 권한이 없습니다')
    }

    return await projectStateRepository.findByProjectId(projectId)
  },

  /**
   * 커스텀 상태 수정
   */
  async updateState(
    stateId: string,
    projectId: string,
    userId: string,
    data: {
      name?: string
      color?: string
      wipLimit?: number | null
    }
  ) {
    await this.verifyProjectPermission(projectId, userId)

    return await projectStateRepository.update(stateId, {
      name: data.name,
      color: data.color,
      wip_limit: data.wipLimit === null ? null : data.wipLimit,
    })
  },

  /**
   * 커스텀 상태 삭제
   * ⚠️ 주의: 이 상태를 사용하는 이슈가 없어야 함
   */
  async deleteState(stateId: string, projectId: string, userId: string) {
    await this.verifyProjectPermission(projectId, userId)

    try {
      await projectStateRepository.delete(stateId)
      return { success: true }
    } catch (error: any) {
      if (error.code === '23503') {
        // Foreign key violation
        throw new ValidationError('이 상태를 사용하는 이슈가 있어 삭제할 수 없습니다')
      }
      throw error
    }
  },

  /**
   * FR-038: 라벨 생성
   * 권한: 프로젝트 소유자 또는 팀 OWNER, ADMIN
   */
  async createLabel(
    projectId: string,
    userId: string,
    data: {
      name: string
      color: string
    }
  ) {
    await this.verifyProjectPermission(projectId, userId)

    return await projectLabelRepository.create({
      project_id: projectId,
      name: data.name,
      color: data.color,
    })
  },

  /**
   * 라벨 목록 조회
   */
  async getLabels(projectId: string, userId: string) {
    const project = await projectRepository.findById(projectId)
    if (!project) {
      throw new NotFoundError('프로젝트를 찾을 수 없습니다')
    }

    // 팀 멤버십 확인
    const member = await teamMemberRepository.findMember(project.team_id, userId)
    if (!member) {
      throw new ForbiddenError('접근 권한이 없습니다')
    }

    return await projectLabelRepository.findByProjectId(projectId)
  },

  /**
   * 라벨 수정
   */
  async updateLabel(
    labelId: string,
    projectId: string,
    userId: string,
    data: {
      name?: string
      color?: string
    }
  ) {
    await this.verifyProjectPermission(projectId, userId)

    return await projectLabelRepository.update(labelId, data)
  },

  /**
   * 라벨 삭제
   */
  async deleteLabel(labelId: string, projectId: string, userId: string) {
    await this.verifyProjectPermission(projectId, userId)

    await projectLabelRepository.delete(labelId)
    return { success: true }
  },

  /**
   * 프로젝트 권한 검증 헬퍼
   * 권한: 프로젝트 소유자 또는 팀 OWNER, ADMIN
   */
  async verifyProjectPermission(projectId: string, userId: string) {
    const project = await projectRepository.findById(projectId)
    if (!project) {
      throw new NotFoundError('프로젝트를 찾을 수 없습니다')
    }

    // 프로젝트 소유자는 통과
    if (project.owner_id === userId) {
      return
    }

    // 팀 OWNER, ADMIN도 통과
    const member = await teamMemberRepository.findMember(project.team_id, userId)
    if (member && (member.role === 'OWNER' || member.role === 'ADMIN')) {
      return
    }

    throw new ForbiddenError('권한이 없습니다')
  },
}
