'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { KanbanBoard } from '@/app/components/kanban/KanbanBoard'
import { IssueList } from '@/app/components/issues/IssueList'
import { ProjectStats } from '@/app/components/projects/ProjectStats'
import { CreateIssueModal } from '@/app/components/issues/CreateIssueModal'
import { useProject } from '@/app/lib/hooks/useProjects'
import { useKanbanData } from '@/app/lib/hooks/useKanbanData'

type TabType = 'kanban' | 'list'

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const teamId = params.teamId as string
  const [activeTab, setActiveTab] = useState<TabType>('kanban')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { data: project, isLoading: isLoadingProject, error: projectError } = useProject(projectId)
  const { data: kanbanData, isLoading: isLoadingKanban, error: kanbanError } = useKanbanData(projectId)

  if (isLoadingProject || isLoadingKanban) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">프로젝트를 불러오는 중...</div>
      </div>
    )
  }

  if (projectError || kanbanError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500">
          프로젝트를 불러오는 중 오류가 발생했습니다.
          <br />
          <span className="text-sm text-gray-600">
            {projectError?.message || kanbanError?.message}
          </span>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">프로젝트를 찾을 수 없습니다.</div>
      </div>
    )
  }

  // kanbanData가 없거나 states가 없으면 빈 데이터로 초기화
  const safeKanbanData = kanbanData || { states: [], totalIssues: 0 }

  // 모든 이슈를 평탄화
  const allIssues = safeKanbanData.states.flatMap((state: any) =>
    state.issues.map((issue: any) => ({
      ...issue,
      state: {
        id: state.id,
        name: state.name,
        color: state.color,
      },
    }))
  )

  return (
    <div className="p-6 space-y-6">
      {/* 프로젝트 헤더 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600 whitespace-pre-wrap">{project.description}</p>
            )}
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span>
                생성일:{' '}
                {new Date(project.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              {project.is_archived && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                  아카이브됨
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            이슈 생성
          </button>
        </div>
      </div>

      {/* 프로젝트 통계 */}
      <ProjectStats states={safeKanbanData.states} totalIssues={safeKanbanData.totalIssues} />

      {/* 탭 전환 UI */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'kanban'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
                칸반 보드
              </div>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                이슈 리스트
              </div>
            </button>
          </nav>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="p-6">
          {activeTab === 'kanban' ? (
            <KanbanBoard projectId={projectId} />
          ) : (
            <IssueList projectId={projectId} issues={allIssues} />
          )}
        </div>
      </div>

      {/* 이슈 생성 모달 */}
      <CreateIssueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={projectId}
        teamId={teamId}
      />
    </div>
  )
}
