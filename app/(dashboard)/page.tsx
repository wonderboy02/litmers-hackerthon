'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardHomePage() {
  const router = useRouter()

  useEffect(() => {
    // 대시보드 홈은 개인 대시보드로 리다이렉트
    router.replace('/personal')
  }, [router])

  return null
}
