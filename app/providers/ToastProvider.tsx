'use client'

import { Toaster } from 'sonner'

/**
 * 전역 Toast Provider
 * Sonner 토스트를 애플리케이션 전체에서 사용 가능하도록 설정
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        style: {
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        classNames: {
          error: 'bg-red-50 text-red-900 border-red-200',
          success: 'bg-green-50 text-green-900 border-green-200',
          warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
          info: 'bg-blue-50 text-blue-900 border-blue-200',
        },
      }}
    />
  )
}
