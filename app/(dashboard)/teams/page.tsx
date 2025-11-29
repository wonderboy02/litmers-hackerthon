'use client'

import { useState } from 'react'
import { useTeams, useCreateTeam } from '@/app/lib/hooks/useTeams'
import { Card, Button, Modal, Input, LoadingSpinner } from '@/app/components/common'
import Link from 'next/link'

export default function TeamsPage() {
  const { data: teams, isLoading } = useTeams()
  const createTeamMutation = useCreateTeam()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()

    createTeamMutation.mutate(formData, {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams?.map((team: any) => {
            const projectCount = team.projectCount || 0
            const memberCount = team.memberCount || 0

            return (
              <Link href={`/teams/${team.id}`} key={team.id}>
                <Card padding="lg" hover className="h-full border-t-4 border-t-purple-500 transition-all duration-300 hover:shadow-lg flex flex-col">
                  {/* Header with Team Name and Role */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-2xl text-gray-900">{team.name}</h3>
                      <span className="text-sm font-medium px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                        {team.role}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex-1 mb-4">
                    {team.description ? (
                      <p className="text-sm text-gray-600 leading-relaxed">{team.description}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">팀 설명이 없습니다.</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-6 pt-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600">{projectCount}</div>
                      <div className="text-sm text-gray-500 mt-2">프로젝트</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600">{memberCount}</div>
                      <div className="text-sm text-gray-500 mt-2">멤버</div>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
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
            <Button type="submit" isLoading={createTeamMutation.isPending}>
              생성
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
