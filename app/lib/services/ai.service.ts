import { supabase } from '@/app/lib/supabase/client'
import { generateAIResponse } from '@/app/lib/ai'
import { sha256 } from '@/app/lib/utils/hash'
import { checkRateLimit } from '@/app/lib/rate-limit'
import { ValidationError } from '@/app/lib/errors'

/**
 * AI Service
 * FR-040 ~ FR-045
 */
export const aiService = {
  /**
   * FR-040: 설명 요약 생성
   */
  async generateSummary(issueId: string, userId: string): Promise<string> {
    // Rate Limiting
    await checkRateLimit(userId, 'ai')

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
    const prompt = `다음 이슈 설명을 2~4문장으로 요약해주세요:\n\n${issue.description}`
    const summary = await generateAIResponse(prompt)

    // 캐시 저장
    await this.saveCachedResult(issueId, userId, 'SUMMARY', inputHash, summary)

    return summary
  },

  /**
   * FR-041: 해결 전략 제안
   */
  async generateSuggestion(issueId: string, userId: string): Promise<string> {
    await checkRateLimit(userId, 'ai')

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
    const prompt = `다음 이슈를 해결하기 위한 접근 방식을 제안해주세요:

제목: ${issue.title}
설명: ${issue.description}

구체적인 해결 전략과 단계를 제시해주세요.`

    const suggestion = await generateAIResponse(prompt)

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
    await checkRateLimit(userId, 'ai')

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
    const labelNames = projectLabels.map(l => l.name).join(', ')
    const prompt = `다음 이슈에 적합한 라벨을 최대 3개 추천해주세요.

제목: ${issue.title}
설명: ${issue.description || '(설명 없음)'}

사용 가능한 라벨: ${labelNames}

응답 형식: 라벨1, 라벨2, 라벨3 (쉼표로 구분, 추천할 라벨이 없으면 "없음")`

    const response = await generateAIResponse(prompt)

    // 응답 파싱
    if (response.trim() === '없음') {
      return []
    }

    const recommendedLabels = response
      .split(',')
      .map(l => l.trim())
      .filter(l => projectLabels.some(pl => pl.name === l))
      .slice(0, 3)

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
    await checkRateLimit(userId, 'ai')

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
    const issueList = existingIssues
      .map((issue, idx) => `${idx + 1}. [ID: ${issue.id}] ${issue.title}`)
      .join('\n')

    const prompt = `다음 새 이슈와 유사한 기존 이슈를 최대 3개 찾아주세요:

새 이슈:
제목: ${newIssueTitle}
설명: ${newIssueDescription || '(설명 없음)'}

기존 이슈 목록:
${issueList}

응답 형식 (유사한 이슈가 있을 경우):
ID: [이슈ID], 유사도: [HIGH/MEDIUM/LOW]
ID: [이슈ID], 유사도: [HIGH/MEDIUM/LOW]

유사한 이슈가 없으면 "없음"만 응답해주세요.`

    const response = await generateAIResponse(prompt)

    if (response.trim() === '없음') {
      return []
    }

    // 응답 파싱
    const duplicates: Array<{ id: string; title: string; similarity: string }> = []
    const lines = response.split('\n').filter(l => l.trim())

    for (const line of lines) {
      const match = line.match(/ID:\s*([^,]+),\s*유사도:\s*(\w+)/)
      if (match) {
        const [_, id, similarity] = match
        const issue = existingIssues.find(i => i.id === id.trim())
        if (issue) {
          duplicates.push({
            id: issue.id,
            title: issue.title,
            similarity: similarity.trim()
          })
        }
      }
    }

    return duplicates.slice(0, 3)
  },

  /**
   * FR-045: AI 댓글 요약
   */
  async summarizeComments(issueId: string, userId: string): Promise<string> {
    await checkRateLimit(userId, 'ai')

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
    const commentTexts = comments
      .map((c: any, idx) => `${idx + 1}. [${c.user.name}] ${c.content}`)
      .join('\n')

    const prompt = `다음 이슈의 댓글들을 3~5문장으로 요약해주세요:

${commentTexts}

논의의 핵심과 주요 결정 사항을 중심으로 요약해주세요.`

    const summary = await generateAIResponse(prompt)

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
