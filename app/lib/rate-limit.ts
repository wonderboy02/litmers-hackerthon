/**
 * FR-042: AI Rate Limiting
 * - 사용자당 분당 10회 제한
 * - 사용자당 일당 100회 제한
 */

interface RateLimitEntry {
  perMinute: {
    count: number
    resetAt: number // Unix timestamp
  }
  perDay: {
    count: number
    resetAt: number // Unix timestamp
  }
}

// 메모리 기반 저장소 (프로덕션에서는 Redis나 DB 사용 권장)
const rateLimitStore = new Map<string, RateLimitEntry>()

const MINUTE_IN_MS = 60 * 1000
const DAY_IN_MS = 24 * 60 * 60 * 1000

export const RATE_LIMITS = {
  PER_MINUTE: 10,
  PER_DAY: 100,
} as const

export interface RateLimitResult {
  allowed: boolean
  remaining: {
    perMinute: number
    perDay: number
  }
  resetAt: {
    perMinute: Date
    perDay: Date
  }
  error?: string
}

/**
 * AI API 호출에 대한 Rate Limit 체크
 */
export function checkAIRateLimit(userId: string): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(userId)

  // 초기 진입 또는 만료된 항목
  if (!entry) {
    const newEntry: RateLimitEntry = {
      perMinute: {
        count: 1,
        resetAt: now + MINUTE_IN_MS,
      },
      perDay: {
        count: 1,
        resetAt: now + DAY_IN_MS,
      },
    }
    rateLimitStore.set(userId, newEntry)

    return {
      allowed: true,
      remaining: {
        perMinute: RATE_LIMITS.PER_MINUTE - 1,
        perDay: RATE_LIMITS.PER_DAY - 1,
      },
      resetAt: {
        perMinute: new Date(newEntry.perMinute.resetAt),
        perDay: new Date(newEntry.perDay.resetAt),
      },
    }
  }

  // 분당 제한 체크 및 리셋
  if (now >= entry.perMinute.resetAt) {
    entry.perMinute.count = 0
    entry.perMinute.resetAt = now + MINUTE_IN_MS
  }

  // 일당 제한 체크 및 리셋
  if (now >= entry.perDay.resetAt) {
    entry.perDay.count = 0
    entry.perDay.resetAt = now + DAY_IN_MS
  }

  // 제한 초과 체크
  if (entry.perMinute.count >= RATE_LIMITS.PER_MINUTE) {
    return {
      allowed: false,
      remaining: {
        perMinute: 0,
        perDay: Math.max(0, RATE_LIMITS.PER_DAY - entry.perDay.count),
      },
      resetAt: {
        perMinute: new Date(entry.perMinute.resetAt),
        perDay: new Date(entry.perDay.resetAt),
      },
      error: `분당 요청 횟수를 초과했습니다. ${Math.ceil((entry.perMinute.resetAt - now) / 1000)}초 후 다시 시도해주세요.`,
    }
  }

  if (entry.perDay.count >= RATE_LIMITS.PER_DAY) {
    return {
      allowed: false,
      remaining: {
        perMinute: Math.max(0, RATE_LIMITS.PER_MINUTE - entry.perMinute.count),
        perDay: 0,
      },
      resetAt: {
        perMinute: new Date(entry.perMinute.resetAt),
        perDay: new Date(entry.perDay.resetAt),
      },
      error: `일일 요청 횟수를 초과했습니다. ${new Date(entry.perDay.resetAt).toLocaleString('ko-KR')}에 초기화됩니다.`,
    }
  }

  // 카운트 증가
  entry.perMinute.count += 1
  entry.perDay.count += 1
  rateLimitStore.set(userId, entry)

  return {
    allowed: true,
    remaining: {
      perMinute: RATE_LIMITS.PER_MINUTE - entry.perMinute.count,
      perDay: RATE_LIMITS.PER_DAY - entry.perDay.count,
    },
    resetAt: {
      perMinute: new Date(entry.perMinute.resetAt),
      perDay: new Date(entry.perDay.resetAt),
    },
  }
}

/**
 * Rate Limit 정보 조회 (호출 횟수 차감 없음)
 */
export function getAIRateLimitStatus(userId: string): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(userId)

  if (!entry) {
    return {
      allowed: true,
      remaining: {
        perMinute: RATE_LIMITS.PER_MINUTE,
        perDay: RATE_LIMITS.PER_DAY,
      },
      resetAt: {
        perMinute: new Date(now + MINUTE_IN_MS),
        perDay: new Date(now + DAY_IN_MS),
      },
    }
  }

  // 만료 체크 (조회만 하고 리셋은 하지 않음)
  const perMinuteRemaining =
    now >= entry.perMinute.resetAt
      ? RATE_LIMITS.PER_MINUTE
      : Math.max(0, RATE_LIMITS.PER_MINUTE - entry.perMinute.count)

  const perDayRemaining =
    now >= entry.perDay.resetAt
      ? RATE_LIMITS.PER_DAY
      : Math.max(0, RATE_LIMITS.PER_DAY - entry.perDay.count)

  return {
    allowed: perMinuteRemaining > 0 && perDayRemaining > 0,
    remaining: {
      perMinute: perMinuteRemaining,
      perDay: perDayRemaining,
    },
    resetAt: {
      perMinute: new Date(entry.perMinute.resetAt),
      perDay: new Date(entry.perDay.resetAt),
    },
  }
}

/**
 * 주기적으로 만료된 항목 정리 (메모리 누수 방지)
 * 프로덕션에서는 cron job 등으로 실행 권장
 */
export function cleanupExpiredRateLimits(): void {
  const now = Date.now()
  for (const [userId, entry] of rateLimitStore.entries()) {
    // 일일 제한이 만료되고 1시간 이상 지난 항목 삭제
    if (now >= entry.perDay.resetAt + 60 * 60 * 1000) {
      rateLimitStore.delete(userId)
    }
  }
}

// 1시간마다 만료된 항목 정리
if (typeof window === 'undefined') {
  // 서버 사이드에서만 실행
  setInterval(cleanupExpiredRateLimits, 60 * 60 * 1000)
}
