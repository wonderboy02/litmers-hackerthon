import { toast as sonnerToast } from 'sonner'
import { getErrorMessage } from './errors'

/**
 * 토스트 헬퍼 함수
 * Sonner를 래핑하여 일관된 토스트 인터페이스 제공
 */

export const toast = {
  /**
   * 성공 토스트
   */
  success: (message: string, description?: string) => {
    return sonnerToast.success(message, {
      description,
    })
  },

  /**
   * 에러 토스트
   */
  error: (error: unknown, fallbackMessage?: string) => {
    const message = getErrorMessage(error)
    return sonnerToast.error(fallbackMessage || '오류가 발생했습니다', {
      description: message,
    })
  },

  /**
   * 경고 토스트
   */
  warning: (message: string, description?: string) => {
    return sonnerToast.warning(message, {
      description,
    })
  },

  /**
   * 정보 토스트
   */
  info: (message: string, description?: string) => {
    return sonnerToast.info(message, {
      description,
    })
  },

  /**
   * 로딩 토스트
   */
  loading: (message: string, description?: string) => {
    return sonnerToast.loading(message, {
      description,
    })
  },

  /**
   * Promise 기반 토스트
   * API 호출 등에 유용
   */
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: unknown) => string)
    },
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    })
  },

  /**
   * 커스텀 토스트
   */
  custom: (message: string, description?: string) => {
    return sonnerToast(message, {
      description,
    })
  },

  /**
   * 토스트 닫기
   */
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId)
  },
}
