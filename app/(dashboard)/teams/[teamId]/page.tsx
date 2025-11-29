'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useTeam } from '@/app/lib/hooks/useTeams'
import { useProjects, useCreateProject } from '@/app/lib/hooks/useProjects'
import { Card, Button, Modal, Input, LoadingSpinner } from '@/app/components/common'
import Link from 'next/link'

export default function TeamDetailPage() {
  const params = useParams()
  const teamId = params.teamId as string

  const { data: team, isLoading: teamLoading } = useTeam(teamId)
  const { data: projects, isLoading: projectsLoading } = useProjects(teamId)
  const createMutation = useCreateProject(teamId)

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

  if (teamLoading || projectsLoading) return <LoadingSpinner fullScreen />

  return (
    <div>
      {/* 팀 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{team?.name}</h1>
            <p className="text-gray-600 mt-2">{team?.description}</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            + 새 프로젝트
          </Button>
        </div>

        {/* 팀 정보 */}
        <div className="grid grid-cols-4 gap-4">
          <Card padding="sm">
            <p className="text-sm text-gray-500">멤버</p>
            <p className="text-2xl font-bold text-gray-900">{team?.memberCount || 0}명</p>
          </Card>
          <Card padding="sm">
            <p className="text-sm text-gray-500">프로젝트</p>
            <p className="text-2xl font-bold text-gray-900">{projects?.length || 0}개</p>
          </Card>
          <Card padding="sm">
            <p className="text-sm text-gray-500">내 역할</p>
            <p className="text-lg font-semibold text-blue-600">{team?.role}</p>
          </Card>
          <Card padding="sm">
            <p className="text-sm text-gray-500">생성일</p>
            <p className="text-sm text-gray-900">
              {team?.created_at ? new Date(team.created_at).toLocaleDateString('ko-KR') : '-'}
            </p>
          </Card>
        </div>
      </div>

      {/* 프로젝트 목록 */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">프로젝트</h2>

        {projects && projects.length === 0 ? (
          <Card className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">아직 프로젝트가 없습니다</h3>
            <p className="text-gray-600 mb-4">새로운 프로젝트를 만들어 시작하세요</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              첫 번째 프로젝트 만들기
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {projects?.map((project: any) => (
              <Link href={`/teams/${teamId}/projects/${project.id}`} key={project.id}>
                <Card padding="md" hover>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg">{project.name}</h3>
                    {project.is_favorite && (
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>이슈 {project.issueCount || 0}개</span>
                    {project.is_archived && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        보관됨
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 프로젝트 생성 모달 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="새 프로젝트 만들기"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="프로젝트 이름"
            placeholder="예: 웹사이트 리뉴얼"
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
              placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
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
