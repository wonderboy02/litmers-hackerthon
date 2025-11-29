/**
 * 애플리케이션 전역 에러 타입 정의 및 핸들링
 */

/**
 * 커스텀 에러 클래스들
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode: number = 500,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class AuthError extends AppError {
  constructor(message: string = '인증에 실패했습니다.', code?: string) {
    super(message, code, 401)
    this.name = 'AuthError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = '권한이 없습니다.', code?: string) {
    super(message, code, 403)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = '리소스를 찾을 수 없습니다.', code?: string) {
    super(message, code, 404)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string = '입력값이 올바르지 않습니다.', code?: string) {
    super(message, code, 400)
    this.name = 'ValidationError'
  }
}

export class RateLimitError extends AppError {
  constructor(
    message: string = '요청 횟수를 초과했습니다.',
    code?: string,
    public resetAt?: Date,
  ) {
    super(message, code, 429)
    this.name = 'RateLimitError'
  }
}

/**
 * API 에러 응답 인터페이스
 */
export interface ApiErrorResponse {
  error: {
    message: string
    code?: string
    details?: unknown
  }
}

/**
 * Supabase 에러를 AppError로 변환
 */
export function handleSupabaseError(error: unknown): AppError {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code
    const message =
      (error as { message?: string }).message || '데이터베이스 오류가 발생했습니다.'

    // Supabase Auth 에러
    if (code === 'invalid_credentials') {
      return new AuthError('이메일 또는 비밀번호가 올바르지 않습니다.', code)
    }
    if (code === 'email_not_confirmed') {
      return new AuthError('이메일 인증이 필요합니다.', code)
    }
    if (code === 'user_already_exists') {
      return new ValidationError('이미 사용 중인 이메일입니다.', code)
    }

    // Supabase DB 에러
    if (code === '23505') {
      // Unique constraint violation
      return new ValidationError('중복된 값이 존재합니다.', code)
    }
    if (code === '23503') {
      // Foreign key violation
      return new ValidationError('참조된 데이터가 존재하지 않습니다.', code)
    }

    return new AppError(message, code)
  }

  return new AppError('알 수 없는 오류가 발생했습니다.')
}

/**
 * API 에러를 사용자 친화적인 메시지로 변환
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }

  return '알 수 없는 오류가 발생했습니다.'
}

/**
 * Next.js API Route 에러 응답 생성
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string = '오류가 발생했습니다.',
): Response {
  if (error instanceof AppError) {
    return Response.json(
      {
        error: {
          message: error.message,
          code: error.code,
        },
      } satisfies ApiErrorResponse,
      { status: error.statusCode },
    )
  }

  console.error('Unhandled error:', error)

  return Response.json(
    {
      error: {
        message: defaultMessage,
      },
    } satisfies ApiErrorResponse,
    { status: 500 },
  )
}

/**
 * 에러 로깅 (프로덕션에서는 Sentry 등과 연동)
 */
export function logError(
  error: unknown,
  context?: { userId?: string; action?: string; metadata?: Record<string, unknown> },
): void {
  if (process.env.NODE_ENV === 'production') {
    // TODO: Sentry, LogRocket 등 에러 트래킹 서비스와 연동
    console.error('[ERROR]', {
      error,
      context,
      timestamp: new Date().toISOString(),
    })
  } else {
    console.error('[DEV ERROR]', error, context)
  }
}
