'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/app/lib/toast'
import type { Database } from '@/types/supabase'

type User = Database['public']['Tables']['users']['Row']

interface SignupData {
  email: string
  password: string
  name: string
}

interface LoginData {
  email: string
  password: string
}

interface UpdateProfileData {
  name?: string
  profileImage?: string
}

interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

/**
 * useAuth Hook
 * 인증 관련 모든 기능을 제공하는 React Query Hook
 */
export function useAuth() {
  const queryClient = useQueryClient()

  // 현재 사용자 조회
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        if (res.status === 401) return null // 인증되지 않음
        throw new Error('사용자 정보 조회 실패')
      }
      const data = await res.json()
      return data.user
    },
    retry: false,
  })

  // 회원가입
  const signupMutation = useMutation({
    mutationFn: async (data: SignupData) => {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '회원가입 실패')
      }

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      toast.success('회원가입이 완료되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // 로그인
  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '로그인 실패')
      }

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      toast.success('로그인되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // 로그아웃
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (!res.ok) {
        throw new Error('로그아웃 실패')
      }

      return res.json()
    },
    onSuccess: () => {
      queryClient.clear() // 모든 캐시 삭제
      toast.success('로그아웃되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // 비밀번호 재설정 요청
  const requestPasswordResetMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '요청 실패')
      }

      return res.json()
    },
    onSuccess: () => {
      toast.success('비밀번호 재설정 이메일이 발송되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // 비밀번호 재설정 실행
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      const res = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '비밀번호 재설정 실패')
      }

      return res.json()
    },
    onSuccess: () => {
      toast.success('비밀번호가 재설정되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // 프로필 수정
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '프로필 수정 실패')
      }

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      toast.success('프로필이 수정되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // 비밀번호 변경
  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '비밀번호 변경 실패')
      }

      return res.json()
    },
    onSuccess: () => {
      toast.success('비밀번호가 변경되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // 계정 삭제
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '계정 삭제 실패')
      }

      return res.json()
    },
    onSuccess: () => {
      queryClient.clear()
      toast.success('계정이 삭제되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  return {
    // 상태
    user,
    isLoading,
    isAuthenticated: !!user,

    // Mutations
    signup: signupMutation.mutate,
    signupAsync: signupMutation.mutateAsync,
    isSigningUp: signupMutation.isPending,

    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,

    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,

    requestPasswordReset: requestPasswordResetMutation.mutate,
    requestPasswordResetAsync: requestPasswordResetMutation.mutateAsync,
    isRequestingPasswordReset: requestPasswordResetMutation.isPending,

    resetPassword: resetPasswordMutation.mutate,
    resetPasswordAsync: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,

    updateProfile: updateProfileMutation.mutate,
    updateProfileAsync: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,

    changePassword: changePasswordMutation.mutate,
    changePasswordAsync: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,

    deleteAccount: deleteAccountMutation.mutate,
    deleteAccountAsync: deleteAccountMutation.mutateAsync,
    isDeletingAccount: deleteAccountMutation.isPending,
  }
}
