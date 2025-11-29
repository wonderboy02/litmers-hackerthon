import { commentRepository } from '@/app/lib/repositories/comment.repository'
import { issueRepository } from '@/app/lib/repositories/issue.repository'
import { NotFoundError, ForbiddenError, ValidationError } from '@/app/lib/errors'
import { createNotification } from '@/app/lib/notifications'
import { createClient } from '@/app/lib/supabase/server'

/**
 * 댓글 Service
 * FR-060 ~ FR-063
 */
export const commentService = {
  /**
   * FR-060: 댓글 작성
   */
  async createComment(issueId: string, userId: string, content: string) {
    // 이슈 존재 확인
    const issue = await issueRepository.findById(issueId)
    if (!issue) {
      throw new NotFoundError('이슈를 찾을 수 없습니다')
    }

    // 팀 멤버십 확인
    await this.verifyTeamMembership(issue.project_id, userId)

    // 댓글 생성
    const comment = await commentRepository.create({
      issue_id: issueId,
      author_id: userId,
      content
    })

    // 알림 생성 (이슈 작성자와 담당자에게)
    const notifyUserIds = new Set<string>()

    if (issue.author_id !== userId) {
      notifyUserIds.add(issue.author_id)
    }

    if (issue.assignee_id && issue.assignee_id !== userId) {
      notifyUserIds.add(issue.assignee_id)
    }

    for (const targetUserId of notifyUserIds) {
      await createNotification({
        userId: targetUserId,
        type: 'COMMENT_CREATED',
        title: '새로운 댓글이 작성되었습니다',
        content: `"${issue.title}" 이슈에 댓글이 작성되었습니다`,
        relatedId: issueId,
        relatedType: 'ISSUE'
      })
    }

    return comment
  },

  /**
   * FR-061: 댓글 조회
   */
  async getComments(issueId: string, userId: string, limit = 50, offset = 0) {
    // 이슈 존재 확인
    const issue = await issueRepository.findById(issueId)
    if (!issue) {
      throw new NotFoundError('이슈를 찾을 수 없습니다')
    }

    // 팀 멤버십 확인
    await this.verifyTeamMembership(issue.project_id, userId)

    return await commentRepository.findByIssue(issueId, limit, offset)
  },

  /**
   * FR-062: 댓글 수정
   */
  async updateComment(commentId: string, userId: string, content: string) {
    const comment = await commentRepository.findById(commentId)
    if (!comment) {
      throw new NotFoundError('댓글을 찾을 수 없습니다')
    }

    // 작성자만 수정 가능
    if (comment.author_id !== userId) {
      throw new ForbiddenError('댓글 작성자만 수정할 수 있습니다')
    }

    return await commentRepository.update(commentId, content)
  },

  /**
   * FR-063: 댓글 삭제
   */
  async deleteComment(commentId: string, userId: string) {
    const comment = await commentRepository.findById(commentId)
    if (!comment) {
      throw new NotFoundError('댓글을 찾을 수 없습니다')
    }

    // 권한 확인: 작성자, 이슈 소유자, 프로젝트 소유자, 팀 OWNER/ADMIN
    const canDelete = await this.canDeleteComment(comment, userId)
    if (!canDelete) {
      throw new ForbiddenError('댓글을 삭제할 권한이 없습니다')
    }

    await commentRepository.softDelete(commentId)

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
   * 댓글 삭제 권한 확인
   */
  async canDeleteComment(comment: any, userId: string): Promise<boolean> {
    const supabase = await createClient()

    // 작성자
    if (comment.author_id === userId) {
      return true
    }

    // 이슈 작성자
    const { data: issue } = await supabase
      .from('issues')
      .select('author_id, project_id')
      .eq('id', comment.issue_id)
      .single()

    if (issue?.author_id === userId) {
      return true
    }

    // 프로젝트 소유자
    const { data: project } = await supabase
      .from('projects')
      .select('owner_id, team_id')
      .eq('id', issue!.project_id)
      .single()

    if (project?.owner_id === userId) {
      return true
    }

    // 팀 OWNER/ADMIN
    const { data: member } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', project!.team_id)
      .eq('user_id', userId)
      .single()

    if (member?.role === 'OWNER' || member?.role === 'ADMIN') {
      return true
    }

    return false
  }
}
