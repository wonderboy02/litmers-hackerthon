'use client'

import { useAuth } from '@/app/lib/hooks/useAuth'
import { NotificationDropdown } from './NotificationDropdown'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function DashboardHeader() {
  const { user, logoutMutation } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logoutMutation.mutateAsync()
    router.push('/auth/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 및 네비게이션 */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              Unlooped
            </Link>

            <nav className="flex items-center gap-1">
              <Link
                href="/dashboard/teams"
                className="text-sm text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                팀
              </Link>
              <Link
                href="/dashboard/personal"
                className="text-sm text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                대시보드
              </Link>
            </nav>
          </div>

          {/* 우측 메뉴 */}
          <div className="flex items-center gap-4">
            {/* 알림 */}
            <NotificationDropdown />

            {/* 사용자 메뉴 */}
            {user && (
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>

                {/* 프로필 이미지 */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-sm">
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span>{user.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                {/* 로그아웃 */}
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
