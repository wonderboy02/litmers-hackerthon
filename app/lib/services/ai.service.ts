import { createClient } from '@/app/lib/supabase/server'
import {
  generateIssueSummary,
  generateIssueSuggestion,
  recommendLabels,
  detectDuplicateIssues,
  summarizeComments,
} from '@/app/lib/ai'
import { sha256 } from '@/app/lib/utils/hash'
import { checkAIRateLimit } from '@/app/lib/rate-limit'
import { ValidationError, RateLimitError } from '@/app/lib/errors'

/**
 * AI Service
 * FR-040 ~ FR-045
 */
export const aiService = {
  /**
   * FR-040: 설명 요약 생성
   */
  async generateSummary(issueId: string, userId: string): Promise<string> {
    const supabase = await createClient()

    // Rate Limiting
    const rateLimitResult = checkAIRateLimit(userId)
    if (!rateLimitResult.allowed) {
      throw new RateLimitError(rateLimitResult.error || 'Rate limit exceeded')
    }

    // 이슈 조회
    const { data: issue } = await supabase
      .from('issues')
      .select('description')
      .eq('id', issueId)
      .single()

    if (!issue || !issue.description) {
      throw new ValidationError('이슈 설명이 없습니다')
    }

    // 최소 길이 확인 (10자 초과)
    if (issue.description.length <= 10) {
      throw new ValidationError('설명이 너무 짧습니다 (최소 10자 초과)')
    }

    // 캐시 확인
    const inputHash = sha256(issue.description)
    const cached = await this.getCachedResult(issueId, 'SUMMARY', inputHash)

    if (cached) {
      return cached.output_text
    }

    // AI 호출
    const summary = await generateIssueSummary(issue.description)

    // 캐시 저장
    await this.saveCachedResult(issueId, userId, 'SUMMARY', inputHash, summary)

    return summary
  },

  /**
   * FR-041: 해결 전략 제안
   */
  async generateSuggestion(issueId: string, userId: string): Promise<string> {
    const supabase = await createClient()

    const rateLimitResult = checkAIRateLimit(userId)
    if (!rateLimitResult.allowed) {
      throw new RateLimitError(rateLimitResult.error || 'Rate limit exceeded')
    }

    const { data: issue } = await supabase
      .from('issues')
      .select('title, description')
      .eq('id', issueId)
      .single()

    if (!issue || !issue.description) {
      throw new ValidationError('이슈 설명이 없습니다')
    }

    if (issue.description.length <= 10) {
      throw new ValidationError('설명이 너무 짧습니다 (최소 10자 초과)')
    }

    // 캐시 확인
    const inputHash = sha256(`${issue.title}|${issue.description}`)
    const cached = await this.getCachedResult(issueId, 'SUGGESTION', inputHash)

    if (cached) {
      return cached.output_text
    }

    // AI 호출
    const suggestion = await generateIssueSuggestion(issue.title, issue.description)

    // 캐시 저장
    await this.saveCachedResult(issueId, userId, 'SUGGESTION', inputHash, suggestion)

    return suggestion
  },

  /**
   * FR-043: AI 이슈 자동 분류 (라벨 추천)
   */
  async recommendLabels(
    issueId: string,
    userId: string,
    projectLabels: Array<{ id: string; name: string }>
  ): Promise<string[]> {
    const supabase = await createClient()

    const rateLimitResult = checkAIRateLimit(userId)
    if (!rateLimitResult.allowed) {
      throw new RateLimitError(rateLimitResult.error || 'Rate limit exceeded')
    }

    const { data: issue } = await supabase
      .from('issues')
      .select('title, description')
      .eq('id', issueId)
      .single()

    if (!issue) {
      throw new ValidationError('이슈를 찾을 수 없습니다')
    }

    if (projectLabels.length === 0) {
      throw new ValidationError('프로젝트에 라벨이 없습니다')
    }

    // AI 호출 (라벨 추천은 캐싱하지 않음 - 라벨이 변경될 수 있으므로)
    const labelsWithColor = projectLabels.map(l => ({ name: l.name, color: '' }))
    const recommendedLabels = await recommendLabels(
      issue.title,
      issue.description || '',
      labelsWithColor
    )

    return recommendedLabels
  },

  /**
   * FR-044: AI 중복 이슈 탐지
   */
  async detectDuplicates(
    projectId: string,
    userId: string,
    newIssueTitle: string,
    newIssueDescription?: string
  ): Promise<Array<{ id: string; title: string; similarity: string }>> {
    const supabase = await createClient()

    const rateLimitResult = checkAIRateLimit(userId)
    if (!rateLimitResult.allowed) {
      throw new RateLimitError(rateLimitResult.error || 'Rate limit exceeded')
    }

    // 프로젝트의 기존 이슈 조회
    const { data: existingIssues } = await supabase
      .from('issues')
      .select('id, title, description')
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .limit(50) // 최근 50개만

    if (!existingIssues || existingIssues.length === 0) {
      return []
    }

    // AI 호출
    const duplicates = await detectDuplicateIssues(
      newIssueTitle,
      newIssueDescription || '',
      existingIssues.map(i => ({
        id: i.id,
        title: i.title,
        description: i.description
      }))
    )

    // 응답 형식 변환
    return duplicates.map(d => ({
      id: d.id,
      title: d.title,
      similarity: d.similarityReason
    }))
  },

  /**
   * FR-045: AI 댓글 요약
   */
  async summarizeComments(issueId: string, userId: string): Promise<string> {
    const supabase = await createClient()

    const rateLimitResult = checkAIRateLimit(userId)
    if (!rateLimitResult.allowed) {
      throw new RateLimitError(rateLimitResult.error || 'Rate limit exceeded')
    }

    // 댓글 조회
    const { data: comments } = await supabase
      .from('comments')
      .select(`
        content,
        created_at,
        user:users(name)
      `)
      .eq('issue_id', issueId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (!comments || comments.length < 5) {
      throw new ValidationError('댓글이 5개 미만입니다')
    }

    // 캐시 확인 (댓글 개수와 최신 댓글 시간으로 해시)
    const lastCommentTime = comments[comments.length - 1].created_at
    const inputHash = sha256(`${comments.length}|${lastCommentTime}`)
    const cached = await this.getCachedResult(issueId, 'COMMENT_SUMMARY', inputHash)

    if (cached) {
      return cached.output_text
    }

    // AI 호출
    const formattedComments = comments.map((c: any) => ({
      content: c.content,
      authorName: c.user.name,
      createdAt: c.created_at
    }))

    const result = await summarizeComments(formattedComments)
    const summary = result.keyDecisions.length > 0
      ? `${result.summary}\n\n주요 결정 사항:\n${result.keyDecisions.map(d => `- ${d}`).join('\n')}`
      : result.summary

    // 캐시 저장
    await this.saveCachedResult(issueId, userId, 'COMMENT_SUMMARY', inputHash, summary)

    return summary
  },

  /**
   * 캐시된 AI 결과 조회
   */
  async getCachedResult(
    issueId: string,
    featureType: 'SUMMARY' | 'SUGGESTION' | 'COMMENT_SUMMARY',
    inputHash: string
  ) {
    const supabase = await createClient()

    const { data } = await supabase
      .from('ai_caches')
      .select('*')
      .eq('issue_id', issueId)
      .eq('feature_type', featureType)
      .eq('input_hash', inputHash)
      .single()

    return data
  },

  /**
   * AI 결과 캐시 저장
   */
  async saveCachedResult(
    issueId: string,
    userId: string,
    featureType: 'SUMMARY' | 'SUGGESTION' | 'COMMENT_SUMMARY',
    inputHash: string,
    outputText: string
  ) {
    const supabase = await createClient()

    const { error } = await supabase
      .from('ai_caches')
      .upsert({
        issue_id: issueId,
        user_id: userId,
        feature_type: featureType,
        input_hash: inputHash,
        output_text: outputText,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'issue_id,feature_type,input_hash'
      })

    if (error) {
      console.error('AI 캐시 저장 실패:', error)
    }
  }
}
