'use client'

import { useState } from 'react'
import { useTeams, useCreateTeam } from '@/app/lib/hooks/useTeams'
import { Card, Button, Modal, Input, LoadingSpinner } from '@/app/components/common'
import Link from 'next/link'

export default function TeamsPage() {
  const { data: teams, isLoading } = useTeams()
  const createMutation = useCreateTeam()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()

    createMutation.mutate(formData, {
      onSuccess: () => {
        setIsCreateModalOpen(false)
        setFormData({ name: '', description: '' })
      },
    })
  }

  if (isLoading) return <LoadingSpinner fullScreen />

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">팀</h1>
          <p className="text-gray-600 mt-2">소속된 팀을 확인하고 관리하세요</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          + 새 팀 만들기
        </Button>
      </div>

      {teams && teams.length === 0 ? (
        <Card className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">아직 팀이 없습니다</h3>
          <p className="text-gray-600 mb-4">새로운 팀을 만들어 프로젝트를 시작하세요</p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            첫 번째 팀 만들기
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {teams?.map((team: any) => (
            <Link href={`/dashboard/teams/${team.id}`} key={team.id}>
              <Card padding="md" hover>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{team.name}</h3>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {team.role}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{team.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{team.projectCount || 0}개</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>{team.memberCount || 0}명</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* 팀 생성 모달 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="새 팀 만들기"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="팀 이름"
            placeholder="예: 개발팀"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="팀에 대한 간단한 설명을 입력하세요"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              취소
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              생성
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
