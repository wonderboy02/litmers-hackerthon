'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  useTeam,
  useTeamMembers,
  useTeamActivityLogs,
  useUpdateTeam,
  useDeleteTeam,
  useInviteTeamMember,
  useKickTeamMember,
  useLeaveTeam,
  useChangeTeamMemberRole
} from '@/app/lib/hooks/useTeams'
import { useProjects, useCreateProject } from '@/app/lib/hooks/useProjects'
import { Card, Button, Modal, Input, LoadingSpinner } from '@/app/components/common'
import Link from 'next/link'
import { useAuth } from '@/app/lib/hooks/useAuth'

type TabType = 'projects' | 'members' | 'activity' | 'settings'

export default function TeamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.teamId as string

  const { user } = useAuth()
  const { data: team, isLoading: teamLoading } = useTeam(teamId)
  const { data: projects, isLoading: projectsLoading } = useProjects(teamId)
  const { data: members, isLoading: membersLoading } = useTeamMembers(teamId)
  const { data: activityLogs, isLoading: logsLoading } = useTeamActivityLogs(teamId, 50)

  const createProjectMutation = useCreateProject(teamId)
  const updateTeamMutation = useUpdateTeam()
  const deleteTeamMutation = useDeleteTeam()
  const inviteMutation = useInviteTeamMember()
  const kickMutation = useKickTeamMember()
  const leaveMutation = useLeaveTeam()
  const changeRoleMutation = useChangeTeamMemberRole()

  const [activeTab, setActiveTab] = useState<TabType>('projects')
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false)
  const [isInviteMemberModalOpen, setIsInviteMemberModalOpen] = useState(false)
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  const [projectFormData, setProjectFormData] = useState({
    name: '',
    description: '',
  })

  const [inviteFormData, setInviteFormData] = useState({
    email: '',
    role: 'MEMBER' as 'ADMIN' | 'MEMBER',
  })

  const [teamFormData, setTeamFormData] = useState({
    name: team?.name || '',
  })

  // 현재 사용자의 팀 내 역할 찾기
  const currentUserMember = members?.find(m => m.user_id === user?.id)
  const currentUserRole = currentUserMember?.role as 'OWNER' | 'ADMIN' | 'MEMBER' | undefined
  const isOwner = currentUserRole === 'OWNER'
  const isAdmin = currentUserRole === 'ADMIN'
  const canManageTeam = isOwner || isAdmin

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault()
    createProjectMutation.mutate(
      { ...projectFormData, teamId },
      {
        onSuccess: () => {
          setIsCreateProjectModalOpen(false)
          setProjectFormData({ name: '', description: '' })
        },
      }
    )
  }

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault()
    inviteMutation.mutate(
      { teamId, data: inviteFormData },
      {
        onSuccess: () => {
          setIsInviteMemberModalOpen(false)
          setInviteFormData({ email: '', role: 'MEMBER' })
        },
      }
    )
  }

  const handleUpdateTeam = (e: React.FormEvent) => {
    e.preventDefault()
    updateTeamMutation.mutate(
      { teamId, data: teamFormData },
      {
        onSuccess: () => {
          setIsEditTeamModalOpen(false)
        },
      }
    )
  }

  const handleDeleteTeam = () => {
    deleteTeamMutation.mutate(teamId, {
      onSuccess: () => {
        router.push('/teams')
      },
    })
  }

  const handleKickMember = (userId: string) => {
    if (confirm('정말 이 멤버를 강제 퇴장시키겠습니까?')) {
      kickMutation.mutate({ teamId, userId })
    }
  }

  const handleLeaveTeam = () => {
    if (confirm('정말 팀에서 탈퇴하시겠습니까?')) {
      leaveMutation.mutate(teamId, {
        onSuccess: () => {
          router.push('/teams')
        },
      })
    }
  }

  const handleChangeRole = (userId: string, newRole: 'OWNER' | 'ADMIN' | 'MEMBER') => {
    changeRoleMutation.mutate({ teamId, data: { userId, newRole } })
  }

  if (teamLoading || projectsLoading || membersLoading) return <LoadingSpinner fullScreen />

  return (
    <div>
      {/* 팀 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{team?.name}</h1>
          </div>
          {activeTab === 'projects' && (
            <Button onClick={() => setIsCreateProjectModalOpen(true)}>
              + 새 프로젝트
            </Button>
          )}
          {activeTab === 'members' && canManageTeam && (
            <Button onClick={() => setIsInviteMemberModalOpen(true)}>
              + 멤버 초대
            </Button>
          )}
        </div>

        {/* 팀 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card padding="md" className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">멤버</p>
                <p className="text-3xl font-bold text-blue-600">{members?.length || 0}명</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card padding="md" className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">프로젝트</p>
                <p className="text-3xl font-bold text-purple-600">{projects?.length || 0}개</p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card padding="md" className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">내 역할</p>
                <p className="text-lg font-bold text-green-600">{currentUserRole}</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card padding="md" className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">생성일</p>
                <p className="text-sm font-bold text-orange-600">
                  {team?.created_at ? new Date(team.created_at).toLocaleDateString('ko-KR') : '-'}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'projects', label: '프로젝트', icon: '📁' },
              { id: 'members', label: '멤버', icon: '👥' },
              { id: 'activity', label: '활동 로그', icon: '📋' },
              { id: 'settings', label: '설정', icon: '⚙️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div>
        {/* 프로젝트 탭 */}
        {activeTab === 'projects' && (
          <div>
            {projects && projects.length === 0 ? (
              <Card className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">아직 프로젝트가 없습니다</h3>
                <p className="text-gray-600 mb-4">새로운 프로젝트를 만들어 시작하세요</p>
                <Button onClick={() => setIsCreateProjectModalOpen(true)}>
                  첫 번째 프로젝트 만들기
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects?.map((project: any) => (
                  <Link href={`/teams/${teamId}/projects/${project.id}`} key={project.id}>
                    <Card padding="lg" hover className="h-full border-t-4 border-t-blue-500 transition-all duration-300 hover:shadow-lg">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{project.name}</h3>
                          {project.is_favorite && (
                            <div className="flex items-center gap-1 text-sm text-yellow-600 font-medium">
                              <svg className="w-4 h-4 fill-yellow-500" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              즐겨찾기
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {project.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{project.description}</p>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-100">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{project.issueCount || 0}</div>
                          <div className="text-xs text-gray-500 mt-1">이슈</div>
                        </div>
                        <div className="text-center">
                          {project.is_archived ? (
                            <div className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full inline-block">
                              보관됨
                            </div>
                          ) : (
                            <div className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full inline-block font-medium">
                              진행 중
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Icon */}
                      <div className="flex justify-end pt-2">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 멤버 탭 */}
        {activeTab === 'members' && (
          <div>
            <Card>
              <div className="divide-y divide-gray-200">
                {members?.map((member) => (
                  <div key={member.user_id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                        {member.users?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.users?.name}</p>
                        <p className="text-sm text-gray-500">{member.users?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* 역할 배지 */}
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        member.role === 'OWNER' ? 'bg-purple-100 text-purple-700' :
                        member.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {member.role}
                      </span>

                      {/* 역할 변경 (OWNER만 가능) */}
                      {isOwner && member.user_id !== user?.id && (
                        <select
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          value={member.role}
                          onChange={(e) => handleChangeRole(member.user_id, e.target.value as any)}
                        >
                          <option value="MEMBER">MEMBER로 변경</option>
                          <option value="ADMIN">ADMIN으로 변경</option>
                          {member.role === 'OWNER' && <option value="OWNER">OWNER 양도</option>}
                        </select>
                      )}

                      {/* 강제 퇴장 버튼 */}
                      {((isOwner && member.role !== 'OWNER') || (isAdmin && member.role === 'MEMBER')) && member.user_id !== user?.id && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleKickMember(member.user_id)}
                        >
                          퇴장
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* 활동 로그 탭 */}
        {activeTab === 'activity' && (
          <div>
            <Card>
              {logsLoading ? (
                <LoadingSpinner />
              ) : activityLogs && activityLogs.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{log.action_type}</span> - {log.target_type}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {log.created_at ? new Date(log.created_at).toLocaleString('ko-KR') : '-'}
                          </p>
                          {log.details && (
                            <pre className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  아직 활동 로그가 없습니다
                </div>
              )}
            </Card>
          </div>
        )}

        {/* 설정 탭 */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* 팀 정보 수정 */}
            {canManageTeam && (
              <Card>
                <h3 className="text-lg font-semibold mb-4">팀 정보 수정</h3>
                <div className="space-y-4">
                  <Button onClick={() => {
                    setTeamFormData({ name: team?.name || '' })
                    setIsEditTeamModalOpen(true)
                  }}>
                    팀 정보 수정
                  </Button>
                </div>
              </Card>
            )}

            {/* 팀 탈퇴 */}
            {!isOwner && (
              <Card>
                <h3 className="text-lg font-semibold mb-4 text-orange-600">팀 탈퇴</h3>
                <p className="text-sm text-gray-600 mb-4">
                  팀에서 탈퇴하면 모든 팀 리소스에 접근할 수 없게 됩니다.
                </p>
                <Button variant="secondary" onClick={handleLeaveTeam}>
                  팀 탈퇴
                </Button>
              </Card>
            )}

            {/* 팀 삭제 (OWNER만) */}
            {isOwner && (
              <Card>
                <h3 className="text-lg font-semibold mb-4 text-red-600">위험 구역</h3>
                <p className="text-sm text-gray-600 mb-4">
                  팀을 삭제하면 모든 프로젝트, 이슈, 댓글이 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                </p>
                <Button variant="secondary" onClick={() => setIsDeleteConfirmOpen(true)}>
                  팀 삭제
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* 프로젝트 생성 모달 */}
      <Modal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        title="새 프로젝트 만들기"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="프로젝트 이름"
            placeholder="예: 웹사이트 리뉴얼"
            value={projectFormData.name}
            onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
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
              value={projectFormData.description}
              onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateProjectModalOpen(false)}
            >
              취소
            </Button>
            <Button type="submit" isLoading={createProjectMutation.isPending}>
              생성
            </Button>
          </div>
        </form>
      </Modal>

      {/* 멤버 초대 모달 */}
      <Modal
        isOpen={isInviteMemberModalOpen}
        onClose={() => setIsInviteMemberModalOpen(false)}
        title="팀 멤버 초대"
      >
        <form onSubmit={handleInviteMember} className="space-y-4">
          <Input
            label="이메일 주소"
            type="email"
            placeholder="example@email.com"
            value={inviteFormData.email}
            onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              역할
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inviteFormData.role}
              onChange={(e) => setInviteFormData({ ...inviteFormData, role: e.target.value as any })}
            >
              <option value="MEMBER">MEMBER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsInviteMemberModalOpen(false)}
            >
              취소
            </Button>
            <Button type="submit" isLoading={inviteMutation.isPending}>
              초대 보내기
            </Button>
          </div>
        </form>
      </Modal>

      {/* 팀 정보 수정 모달 */}
      <Modal
        isOpen={isEditTeamModalOpen}
        onClose={() => setIsEditTeamModalOpen(false)}
        title="팀 정보 수정"
      >
        <form onSubmit={handleUpdateTeam} className="space-y-4">
          <Input
            label="팀 이름"
            placeholder="팀 이름"
            value={teamFormData.name}
            onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
            required
          />
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditTeamModalOpen(false)}
            >
              취소
            </Button>
            <Button type="submit" isLoading={updateTeamMutation.isPending}>
              저장
            </Button>
          </div>
        </form>
      </Modal>

      {/* 팀 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="팀 삭제 확인"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            정말로 <strong>{team?.name}</strong> 팀을 삭제하시겠습니까?
          </p>
          <p className="text-sm text-red-600">
            ⚠️ 이 작업은 되돌릴 수 없습니다. 모든 프로젝트와 이슈가 함께 삭제됩니다.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              취소
            </Button>
            <Button
              onClick={handleDeleteTeam}
              isLoading={deleteTeamMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
