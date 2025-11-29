import Anthropic from '@anthropic-ai/sdk'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set')
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const AI_MODEL = 'claude-3-5-sonnet-20241022'
const MAX_TOKENS = 1024

/**
 * FR-040: 이슈 설명 요약 생성
 */
export async function generateIssueSummary(
  description: string,
): Promise<string> {
  if (description.length <= 10) {
    throw new Error('설명이 너무 짧습니다. 최소 10자 이상이어야 합니다.')
  }

  try {
    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: 'user',
          content: `다음 이슈 설명을 2-4문장으로 요약해주세요. 핵심 내용만 간결하게 정리해주세요.

이슈 설명:
${description}`,
        },
      ],
    })

    const textContent = message.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('AI 응답을 처리할 수 없습니다.')
    }

    return textContent.text.trim()
  } catch (error) {
    console.error('AI summary generation error:', error)
    throw new Error('AI 요약 생성에 실패했습니다.')
  }
}

/**
 * FR-041: 해결 전략 제안
 */
export async function generateIssueSuggestion(
  title: string,
  description: string,
): Promise<string> {
  if (description.length <= 10) {
    throw new Error('설명이 너무 짧습니다. 최소 10자 이상이어야 합니다.')
  }

  try {
    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: 'user',
          content: `다음 이슈를 해결하기 위한 접근 방식을 제안해주세요. 구체적이고 실용적인 단계를 포함해주세요.

제목: ${title}

설명:
${description}`,
        },
      ],
    })

    const textContent = message.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('AI 응답을 처리할 수 없습니다.')
    }

    return textContent.text.trim()
  } catch (error) {
    console.error('AI suggestion generation error:', error)
    throw new Error('AI 제안 생성에 실패했습니다.')
  }
}

/**
 * FR-043: AI 이슈 자동 분류 (라벨 추천)
 */
export async function recommendLabels(
  title: string,
  description: string,
  availableLabels: { name: string; color: string }[],
): Promise<string[]> {
  if (availableLabels.length === 0) {
    return []
  }

  try {
    const labelNames = availableLabels.map((l) => l.name).join(', ')

    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: 'user',
          content: `다음 이슈에 적합한 라벨을 최대 3개까지 추천해주세요.
사용 가능한 라벨 목록에서만 선택하고, 라벨 이름만 쉼표로 구분하여 답변해주세요.

이슈 제목: ${title}
이슈 설명: ${description}

사용 가능한 라벨: ${labelNames}

추천 라벨 (쉼표로 구분, 예: bug, urgent, backend):`,
        },
      ],
    })

    const textContent = message.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return []
    }

    // AI 응답 파싱
    const recommendedLabels = textContent.text
      .trim()
      .split(',')
      .map((label) => label.trim())
      .filter((label) => availableLabels.some((l) => l.name === label))
      .slice(0, 3) // 최대 3개

    return recommendedLabels
  } catch (error) {
    console.error('AI label recommendation error:', error)
    return []
  }
}

/**
 * FR-044: AI 중복 이슈 탐지
 */
export async function detectDuplicateIssues(
  newIssueTitle: string,
  newIssueDescription: string,
  existingIssues: { id: string; title: string; description: string | null }[],
): Promise<{ id: string; title: string; similarityReason: string }[]> {
  if (existingIssues.length === 0) {
    return []
  }

  try {
    const existingIssuesText = existingIssues
      .map((issue, idx) => `${idx + 1}. [ID: ${issue.id}] ${issue.title}`)
      .join('\n')

    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: 'user',
          content: `다음 새 이슈와 유사한 기존 이슈를 찾아주세요. 유사한 이슈가 있다면 최대 3개까지 ID와 유사한 이유를 알려주세요.

새 이슈:
제목: ${newIssueTitle}
설명: ${newIssueDescription}

기존 이슈 목록:
${existingIssuesText}

유사한 이슈가 있다면 다음 형식으로 답변해주세요 (없으면 "없음"이라고만 답변):
ID: [이슈ID] - 유사한 이유`,
        },
      ],
    })

    const textContent = message.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return []
    }

    const responseText = textContent.text.trim()
    if (responseText === '없음' || responseText.toLowerCase() === 'none') {
      return []
    }

    // AI 응답 파싱
    const lines = responseText.split('\n').filter((line) => line.trim())
    const duplicates: { id: string; title: string; similarityReason: string }[] =
      []

    for (const line of lines.slice(0, 3)) {
      const match = line.match(/ID:\s*([^\s-]+)\s*-\s*(.+)/)
      if (match) {
        const [, id, reason] = match
        const issue = existingIssues.find((i) => i.id === id.trim())
        if (issue) {
          duplicates.push({
            id: issue.id,
            title: issue.title,
            similarityReason: reason.trim(),
          })
        }
      }
    }

    return duplicates
  } catch (error) {
    console.error('AI duplicate detection error:', error)
    return []
  }
}

/**
 * FR-045: AI 댓글 요약
 */
export async function summarizeComments(
  comments: { content: string; authorName: string; createdAt: string }[],
): Promise<{ summary: string; keyDecisions: string[] }> {
  if (comments.length < 5) {
    throw new Error('댓글이 5개 이상일 때만 요약을 생성할 수 있습니다.')
  }

  try {
    const commentsText = comments
      .map(
        (c, idx) =>
          `${idx + 1}. ${c.authorName} (${new Date(c.createdAt).toLocaleDateString()}): ${c.content}`,
      )
      .join('\n\n')

    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: 'user',
          content: `다음 댓글 목록을 3-5문장으로 요약하고, 주요 결정 사항이 있다면 별도로 정리해주세요.

댓글 목록:
${commentsText}

다음 형식으로 답변해주세요:
[요약]
(3-5문장 요약)

[주요 결정 사항]
- (결정 사항 1)
- (결정 사항 2)
...

주요 결정 사항이 없으면 "주요 결정 사항" 섹션은 생략하세요.`,
        },
      ],
    })

    const textContent = message.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('AI 응답을 처리할 수 없습니다.')
    }

    const responseText = textContent.text.trim()

    // 응답 파싱
    const summaryMatch = responseText.match(/\[요약\]([\s\S]*?)(\[주요 결정 사항\]|$)/)
    const decisionsMatch = responseText.match(/\[주요 결정 사항\]([\s\S]*)/)

    const summary = summaryMatch ? summaryMatch[1].trim() : responseText
    const keyDecisions: string[] = []

    if (decisionsMatch) {
      const decisionsText = decisionsMatch[1].trim()
      const decisionLines = decisionsText
        .split('\n')
        .filter((line) => line.trim().startsWith('-'))
        .map((line) => line.trim().substring(1).trim())
      keyDecisions.push(...decisionLines)
    }

    return { summary, keyDecisions }
  } catch (error) {
    console.error('AI comment summary error:', error)
    throw new Error('AI 댓글 요약 생성에 실패했습니다.')
  }
}
