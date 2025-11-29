# 🎨 프론트엔드 구현 가이드

> **목표**: 백엔드 API와 React Query Hooks를 활용한 프론트엔드 페이지 구현
> **전제**: Phase 4~9의 API Routes와 Hooks는 모두 구현 완료

---

## 📋 목차

1. [프론트엔드 구조 이해](#1-프론트엔드-구조-이해)
2. [이미 구현된 것들](#2-이미-구현된-것들)
3. [구현해야 할 페이지 목록](#3-구현해야-할-페이지-목록)
4. [페이지 구현 방법](#4-페이지-구현-방법)
5. [UI 컴포넌트 작성 패턴](#5-ui-컴포넌트-작성-패턴)
6. [예시 코드](#6-예시-코드)

---

## 1. 프론트엔드 구조 이해

### Next.js App Router 구조

```
app/
├── (auth)/              # 인증 관련 페이지 (비로그인)
│   ├── login/
│   │   └── page.tsx     # 로그인 페이지
│   └── signup/
│       └── page.tsx     # 회원가입 페이지
│
├── (dashboard)/         # 대시보드 레이아웃 (로그인 필요)
│   ├── layout.tsx       # 공통 레이아웃 (헤더, 사이드바)
│   ├── page.tsx         # 홈/대시보드 메인
│   ├── teams/
│   │   ├── page.tsx     # 팀 목록
│   │   └── [teamId]/
│   │       ├── page.tsx # 팀 상세
│   │       └── projects/
│   │           ├── page.tsx           # 프로젝트 목록
│   │           └── [projectId]/
│   │               ├── page.tsx       # 칸반 보드 (Phase 5 ✅)
│   │               └── issues/
│   │                   └── [issueId]/
│   │                       └── page.tsx # 이슈 상세
│   └── personal/
│       └── page.tsx     # 개인 대시보드
│
└── api/                 # API Routes (✅ 모두 완료)
```

---

## 2. 이미 구현된 것들 ✅

### 백엔드 (100% 완료)
- ✅ 모든 API Routes (30+ 엔드포인트)
- ✅ Repository & Service 레이어
- ✅ 권한 검증 및 에러 처리

### React Query Hooks (100% 완료)
- ✅ `useIssues.ts` - 이슈 CRUD, 검색, 이동
- ✅ `useKanbanData.ts` - 칸반 보드 데이터
- ✅ `useNotifications.ts` - 알림

### UI 컴포넌트 (일부 완료)
- ✅ **칸반 보드**: `KanbanBoard`, `KanbanColumn`, `IssueCard`
- ✅ **차트**: `IssueStatusChart`, `IssueTimelineChart`, `PriorityChart`
- ⬜ **기타 컴포넌트**: 직접 구현 필요

---

## 3. 구현해야 할 페이지 목록

### Phase 1, 2, 3 (팀원 작업)
- [ ] 로그인 페이지 (`app/(auth)/login/page.tsx`)
- [ ] 회원가입 페이지 (`app/(auth)/signup/page.tsx`)
- [ ] 팀 목록 페이지 (`app/(dashboard)/teams/page.tsx`)
- [ ] 팀 상세 페이지 (`app/(dashboard)/teams/[teamId]/page.tsx`)
- [ ] 프로젝트 목록 페이지 (`app/(dashboard)/teams/[teamId]/projects/page.tsx`)

### Phase 4~9 (추가 구현 필요)
- [ ] 이슈 상세 페이지 (`app/(dashboard)/teams/[teamId]/projects/[projectId]/issues/[issueId]/page.tsx`)
- [ ] 개인 대시보드 페이지 (`app/(dashboard)/personal/page.tsx`)
- [ ] 헤더 컴포넌트 (알림 포함)
- [ ] 이슈 폼 컴포넌트
- [ ] 댓글 컴포넌트

---

## 4. 페이지 구현 방법

### 4-1. 기본 페이지 구조

모든 페이지는 다음 구조를 따릅니다:

```typescript
'use client'  // Client Component로 선언

import { useQuery, useMutation } from '@tanstack/react-query'
import { useState } from 'react'

export default function PageName() {
  // 1. State 관리
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 2. 데이터 fetch (React Query Hook 사용)
  const { data, isLoading } = useSomeHook()

  // 3. Mutation (생성, 수정, 삭제)
  const createMutation = useCreateSomething()

  // 4. 로딩 상태
  if (isLoading) return <div>로딩 중...</div>

  // 5. 데이터 없음 상태
  if (!data) return <div>데이터가 없습니다</div>

  // 6. UI 렌더링
  return (
    <div>
      {/* 페이지 내용 */}
    </div>
  )
}
```

### 4-2. React Query Hook 사용 패턴

**이미 구현된 Hook을 활용**하기만 하면 됩니다!

```typescript
// ✅ 이슈 목록 조회
import { useIssues } from '@/app/lib/hooks/useIssues'

const { data: issues, isLoading } = useIssues(projectId)

// ✅ 이슈 생성
import { useCreateIssue } from '@/app/lib/hooks/useIssues'

const createMutation = useCreateIssue(projectId)

createMutation.mutate({
  title: '새 이슈',
  description: '설명',
  priority: 'HIGH'
})

// ✅ 칸반 보드 데이터
import { useKanbanData } from '@/app/lib/hooks/useKanbanData'

const { data: kanbanData } = useKanbanData(projectId)
```

**Hook이 모든 API 호출을 처리하므로, fetch 코드를 직접 작성할 필요가 없습니다!**

---

## 5. UI 컴포넌트 작성 패턴

### 5-1. 공통 컴포넌트 구조

```
app/components/
├── common/              # 공통 UI 컴포넌트
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── LoadingSpinner.tsx
├── issues/              # 이슈 관련
│   ├── IssueForm.tsx
│   ├── IssueList.tsx
│   └── IssueFilters.tsx
├── kanban/              # ✅ 이미 완성
│   ├── KanbanBoard.tsx
│   ├── KanbanColumn.tsx
│   └── IssueCard.tsx
└── dashboard/           # ✅ 차트는 완성
    └── charts/
```

### 5-2. 컴포넌트 작성 원칙

1. **작은 단위로 분리**: 한 컴포넌트는 하나의 책임만
2. **Props로 데이터 전달**: 부모에서 자식으로 데이터 전달
3. **Hook 사용**: 데이터 fetch는 React Query Hook 사용
4. **타입 정의**: TypeScript 인터페이스로 Props 타입 정의

---

## 6. 예시 코드

### 예시 0: 칸반 보드 페이지 (Phase 5)

**파일**: `app/(dashboard)/teams/[teamId]/projects/[projectId]/page.tsx`

```typescript
'use client'

import { KanbanBoard } from '@/app/components/kanban/KanbanBoard'
import { useParams } from 'next/navigation'

export default function ProjectKanbanPage() {
  const params = useParams()
  const projectId = params.projectId as string

  return (
    <div className="h-screen bg-gray-50">
      {/* KanbanBoard 컴포넌트는 이미 완성되어 있으므로 import만 하면 됩니다 */}
      <KanbanBoard projectId={projectId} />
    </div>
  )
}
```

**완료 기준**: 칸반 보드가 표시되고 드래그 앤 드롭이 작동하면 성공!

---

### 예시 1: 이슈 상세 페이지

```typescript
'use client'

import { useIssue, useUpdateIssue } from '@/app/lib/hooks/useIssues'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function IssueDetailPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const issueId = params.issueId as string

  // ✅ Hook으로 데이터 fetch
  const { data: issue, isLoading } = useIssue(projectId, issueId)
  const updateMutation = useUpdateIssue(projectId, issueId)

  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>로딩 중...</div>
      </div>
    )
  }

  if (!issue) {
    return <div>이슈를 찾을 수 없습니다</div>
  }

  const handleUpdate = () => {
    updateMutation.mutate({ title }, {
      onSuccess: () => {
        setIsEditing(false)
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-6">
        {isEditing ? (
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold border-b-2 w-full"
            />
            <button onClick={handleUpdate}>저장</button>
            <button onClick={() => setIsEditing(false)}>취소</button>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold">{issue.title}</h1>
            <button onClick={() => {
              setTitle(issue.title)
              setIsEditing(true)
            }}>
              수정
            </button>
          </div>
        )}
      </div>

      {/* 이슈 정보 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-gray-500">상태</label>
          <p className="font-medium">{issue.state?.name}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500">우선순위</label>
          <p className="font-medium">{issue.priority}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500">담당자</label>
          <p className="font-medium">{issue.assignee?.name || '없음'}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500">마감일</label>
          <p className="font-medium">{issue.due_date || '없음'}</p>
        </div>
      </div>

      {/* 설명 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">설명</h2>
        <p className="text-gray-700">{issue.description}</p>
      </div>

      {/* 서브태스크 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">서브태스크</h2>
        {issue.subtasks?.map((subtask: any) => (
          <div key={subtask.id} className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={subtask.is_completed}
              onChange={() => {/* 서브태스크 토글 */}}
            />
            <span className={subtask.is_completed ? 'line-through' : ''}>
              {subtask.title}
            </span>
          </div>
        ))}
      </div>

      {/* 댓글 섹션은 별도 컴포넌트로 분리 */}
      <CommentSection issueId={issueId} projectId={projectId} />
    </div>
  )
}
```

### 예시 2: 개인 대시보드 페이지

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'

export default function PersonalDashboardPage() {
  // ✅ API 호출 (Hook 패턴)
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard', 'personal'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/personal')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    }
  })

  if (isLoading) return <div>로딩 중...</div>

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">개인 대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">전체 이슈</h3>
          <p className="text-3xl font-bold">{dashboard.totalIssues}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">마감 임박</h3>
          <p className="text-3xl font-bold text-orange-600">
            {dashboard.dueSoonIssues?.length || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">오늘 마감</h3>
          <p className="text-3xl font-bold text-red-600">
            {dashboard.dueTodayIssues?.length || 0}
          </p>
        </div>
      </div>

      {/* 상태별 이슈 */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">내 이슈</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(dashboard.issuesByState || {}).map(([state, issues]: [string, any]) => (
            <div key={state} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium mb-2">{state}</h3>
              <p className="text-2xl font-bold">{issues.length}</p>
              <ul className="mt-2 space-y-1">
                {issues.slice(0, 3).map((issue: any) => (
                  <li key={issue.id} className="text-sm text-gray-600 truncate">
                    {issue.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 소속 팀 */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">소속 팀</h2>
        <div className="grid grid-cols-2 gap-4">
          {dashboard.teams?.map((team: any) => (
            <div key={team.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium">{team.name}</h3>
              <p className="text-sm text-gray-500">
                프로젝트 {team.projects?.length || 0}개
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### 예시 3: 댓글 컴포넌트

```typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

interface CommentSectionProps {
  issueId: string
  projectId: string
}

export function CommentSection({ issueId, projectId }: CommentSectionProps) {
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')

  // ✅ 댓글 조회
  const { data: comments } = useQuery({
    queryKey: ['comments', issueId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/issues/${issueId}/comments`)
      if (!res.ok) throw new Error('Failed')
      return res.json()
    }
  })

  // ✅ 댓글 작성
  const createMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/projects/${projectId}/issues/${issueId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] })
      setContent('')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      createMutation.mutate(content)
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">댓글</h2>

      {/* 댓글 목록 */}
      <div className="space-y-4 mb-6">
        {comments?.map((comment: any) => (
          <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">{comment.user.name}</span>
              <span className="text-sm text-gray-500">
                {new Date(comment.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-700">{comment.content}</p>
          </div>
        ))}
      </div>

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 입력하세요..."
          className="w-full border rounded-lg p-3 mb-2"
          rows={3}
        />
        <button
          type="submit"
          disabled={!content.trim() || createMutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {createMutation.isPending ? '작성 중...' : '댓글 작성'}
        </button>
      </form>
    </div>
  )
}
```

### 예시 4: 이슈 생성 폼

```typescript
'use client'

import { useCreateIssue } from '@/app/lib/hooks/useIssues'
import { useState } from 'react'

interface IssueFormProps {
  projectId: string
  onSuccess?: () => void
}

export function IssueForm({ projectId, onSuccess }: IssueFormProps) {
  const createMutation = useCreateIssue(projectId)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as 'HIGH' | 'MEDIUM' | 'LOW'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    createMutation.mutate(formData, {
      onSuccess: () => {
        setFormData({ title: '', description: '', priority: 'MEDIUM' })
        onSuccess?.()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 제목 */}
      <div>
        <label className="block text-sm font-medium mb-1">제목</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full border rounded-lg p-2"
          required
        />
      </div>

      {/* 설명 */}
      <div>
        <label className="block text-sm font-medium mb-1">설명</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border rounded-lg p-2"
          rows={4}
        />
      </div>

      {/* 우선순위 */}
      <div>
        <label className="block text-sm font-medium mb-1">우선순위</label>
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
          className="w-full border rounded-lg p-2"
        >
          <option value="HIGH">높음</option>
          <option value="MEDIUM">보통</option>
          <option value="LOW">낮음</option>
        </select>
      </div>

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={createMutation.isPending}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {createMutation.isPending ? '생성 중...' : '이슈 생성'}
      </button>
    </form>
  )
}
```

---

## 7. 구현 순서 추천

### 우선순위 1: 핵심 페이지
1. **칸반 보드 페이지** (✅ 이미 완성)
   - `app/(dashboard)/teams/[teamId]/projects/[projectId]/page.tsx`
   - `KanbanBoard` 컴포넌트 import만 하면 됨

2. **이슈 상세 페이지**
   - `app/(dashboard)/.../issues/[issueId]/page.tsx`
   - `useIssue` Hook 사용
   - 댓글 컴포넌트 포함

3. **개인 대시보드**
   - `app/(dashboard)/personal/page.tsx`
   - 차트 컴포넌트 활용

### 우선순위 2: 공통 레이아웃
4. **헤더 컴포넌트** (알림 포함)
   - `app/components/layout/Header.tsx`
   - `useUnreadNotifications` Hook 사용

5. **사이드바 컴포넌트**
   - `app/components/layout/Sidebar.tsx`

### 우선순위 3: 기타 컴포넌트
6. **이슈 폼, 댓글, 필터 등**

---

## 8. Tailwind CSS 스타일링

### 기본 클래스 활용

```typescript
// 버튼
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
  클릭
</button>

// 카드
<div className="bg-white p-6 rounded-lg shadow">
  카드 내용
</div>

// 입력 필드
<input className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" />

// 그리드 레이아웃
<div className="grid grid-cols-3 gap-4">
  <div>...</div>
  <div>...</div>
  <div>...</div>
</div>
```

---

## 9. 자주 사용하는 패턴

### 로딩 상태
```typescript
if (isLoading) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}
```

### 에러 상태
```typescript
if (error) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-600">에러가 발생했습니다: {error.message}</p>
    </div>
  )
}
```

### 모달
```typescript
{isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg max-w-md w-full">
      <h2 className="text-xl font-bold mb-4">모달 제목</h2>
      {/* 모달 내용 */}
      <button onClick={() => setIsModalOpen(false)}>닫기</button>
    </div>
  </div>
)}
```

---

## 10. 핵심 요약

### ✅ 이미 완성된 것
- **모든 백엔드 API** (30+ 엔드포인트)
- **React Query Hooks** (useIssues, useKanbanData, useNotifications)
- **칸반 보드 컴포넌트**
- **차트 컴포넌트**

### 📝 구현 방법
1. **페이지 파일 생성** (`app/(dashboard)/.../page.tsx`)
2. **Hook 사용**으로 데이터 fetch
3. **UI 렌더링** (Tailwind CSS)
4. **컴포넌트 분리** (재사용성)

### 💡 핵심 원칙
- **Hook 활용**: API 호출 코드를 직접 작성하지 말고 Hook 사용
- **컴포넌트 분리**: 작은 단위로 분리하여 재사용
- **타입 안전**: TypeScript 인터페이스 활용
- **로딩/에러 처리**: 항상 로딩과 에러 상태 처리

---

**프론트엔드 구현을 시작하세요! 백엔드는 이미 완성되어 있습니다! 🚀**

---

## 11. 추가 구현 예시 (미구현 컴포넌트)

### 예시 5: 이슈 필터 컴포넌트 (Phase 4)

**파일**: `app/components/issues/IssueFilters.tsx`

```typescript
'use client'

import { useState } from 'react'
import type { IssueFilterInput } from '@/app/lib/validators/issue.schema'

interface IssueFiltersProps {
  onFilterChange: (filters: IssueFilterInput) => void
  projectStates?: Array<{ id: string; name: string }>
  projectLabels?: Array<{ id: string; name: string; color: string }>
  teamMembers?: Array<{ id: string; name: string }>
}

export function IssueFilters({
  onFilterChange,
  projectStates = [],
  projectLabels = [],
  teamMembers = []
}: IssueFiltersProps) {
  const [filters, setFilters] = useState<IssueFilterInput>({})

  const handleFilterUpdate = (key: keyof IssueFilterInput, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFilterChange({})
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">필터</h3>
        <button
          onClick={clearFilters}
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          초기화
        </button>
      </div>

      {/* 검색어 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          검색
        </label>
        <input
          type="text"
          placeholder="제목 또는 설명 검색..."
          value={filters.search || ''}
          onChange={(e) => handleFilterUpdate('search', e.target.value || undefined)}
          className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 상태 필터 */}
      {projectStates.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            상태
          </label>
          <div className="space-y-1">
            {projectStates.map((state) => (
              <label key={state.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.stateIds?.includes(state.id) || false}
                  onChange={(e) => {
                    const currentStates = filters.stateIds || []
                    const newStates = e.target.checked
                      ? [...currentStates, state.id]
                      : currentStates.filter(id => id !== state.id)
                    handleFilterUpdate('stateIds', newStates.length > 0 ? newStates : undefined)
                  }}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">{state.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 우선순위 필터 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">
          우선순위
        </label>
        <div className="space-y-1">
          {(['HIGH', 'MEDIUM', 'LOW'] as const).map((priority) => (
            <label key={priority} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.priorities?.includes(priority) || false}
                onChange={(e) => {
                  const current = filters.priorities || []
                  const updated = e.target.checked
                    ? [...current, priority]
                    : current.filter(p => p !== priority)
                  handleFilterUpdate('priorities', updated.length > 0 ? updated : undefined)
                }}
                className="rounded"
              />
              <span className="text-sm text-gray-700">
                {priority === 'HIGH' && '🔴 높음'}
                {priority === 'MEDIUM' && '🟡 보통'}
                {priority === 'LOW' && '⚪ 낮음'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 담당자 필터 */}
      {teamMembers.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            담당자
          </label>
          <select
            value={filters.assigneeIds?.[0] || ''}
            onChange={(e) => {
              const value = e.target.value
              handleFilterUpdate('assigneeIds', value ? [value] : undefined)
            }}
            className="w-full text-sm border border-gray-300 rounded px-3 py-2"
          >
            <option value="">전체</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 라벨 필터 */}
      {projectLabels.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            라벨
          </label>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {projectLabels.map((label) => (
              <label key={label.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.labelIds?.includes(label.id) || false}
                  onChange={(e) => {
                    const current = filters.labelIds || []
                    const updated = e.target.checked
                      ? [...current, label.id]
                      : current.filter(id => id !== label.id)
                    handleFilterUpdate('labelIds', updated.length > 0 ? updated : undefined)
                  }}
                  className="rounded"
                />
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: `${label.color}20`,
                    color: label.color,
                    border: `1px solid ${label.color}40`
                  }}
                >
                  {label.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 마감일 필터 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">
          마감일
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.hasDueDate || false}
              onChange={(e) => handleFilterUpdate('hasDueDate', e.target.checked || undefined)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">마감일 있음만</span>
          </label>
        </div>
      </div>
    </div>
  )
}
```

**사용 예시**:
```typescript
import { IssueFilters } from '@/app/components/issues/IssueFilters'
import { useIssues } from '@/app/lib/hooks/useIssues'
import { useState } from 'react'

const [filters, setFilters] = useState<IssueFilterInput>({})
const { data: issues } = useIssues(projectId, filters)

<IssueFilters
  onFilterChange={setFilters}
  projectStates={states}
  projectLabels={labels}
  teamMembers={members}
/>
```

---

### 예시 6: 서브태스크 리스트 컴포넌트 (Phase 4)

**파일**: `app/components/issues/SubtaskList.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useCreateSubtask, useUpdateSubtask, useDeleteSubtask } from '@/app/lib/hooks/useIssues'

interface SubtaskListProps {
  projectId: string
  issueId: string
  subtasks: Array<{
    id: string
    title: string
    is_completed: boolean
  }>
}

export function SubtaskList({ projectId, issueId, subtasks }: SubtaskListProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const createMutation = useCreateSubtask(projectId, issueId)
  const updateMutation = useUpdateSubtask(projectId, issueId)
  const deleteMutation = useDeleteSubtask(projectId, issueId)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return

    createMutation.mutate(newSubtaskTitle, {
      onSuccess: () => {
        setNewSubtaskTitle('')
        setIsAdding(false)
      }
    })
  }

  const handleToggle = (subtaskId: string, currentStatus: boolean) => {
    updateMutation.mutate({
      subtaskId,
      isCompleted: !currentStatus
    })
  }

  const handleDelete = (subtaskId: string) => {
    if (confirm('서브태스크를 삭제하시겠습니까?')) {
      deleteMutation.mutate(subtaskId)
    }
  }

  const completedCount = subtasks.filter(st => st.is_completed).length
  const totalCount = subtasks.length

  return (
    <div className="space-y-3">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          서브태스크
          {totalCount > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              {completedCount}/{totalCount} 완료
            </span>
          )}
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + 추가
          </button>
        )}
      </div>

      {/* 진행률 바 */}
      {totalCount > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      )}

      {/* 서브태스크 목록 */}
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded group"
          >
            {/* 체크박스 */}
            <input
              type="checkbox"
              checked={subtask.is_completed}
              onChange={() => handleToggle(subtask.id, subtask.is_completed)}
              className="w-4 h-4 rounded border-gray-300"
            />

            {/* 제목 */}
            <span
              className={`flex-1 text-sm ${
                subtask.is_completed
                  ? 'line-through text-gray-400'
                  : 'text-gray-700'
              }`}
            >
              {subtask.title}
            </span>

            {/* 삭제 버튼 */}
            <button
              onClick={() => handleDelete(subtask.id)}
              className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 text-xs"
            >
              삭제
            </button>
          </div>
        ))}
      </div>

      {/* 새 서브태스크 추가 폼 */}
      {isAdding && (
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="서브태스크 제목..."
            className="flex-1 text-sm border border-gray-300 rounded px-3 py-2"
            autoFocus
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
          >
            추가
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false)
              setNewSubtaskTitle('')
            }}
            className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
          >
            취소
          </button>
        </form>
      )}

      {/* 빈 상태 */}
      {subtasks.length === 0 && !isAdding && (
        <p className="text-sm text-gray-500 text-center py-4">
          서브태스크가 없습니다. 추가 버튼을 클릭하여 생성하세요.
        </p>
      )}
    </div>
  )
}
```

---

### 예시 7: AI 기능 버튼 컴포넌트 (Phase 6)

#### 7-1. AI 요약 버튼

**파일**: `app/components/ai/AISummaryButton.tsx`

```typescript
'use client'

import { useState } from 'react'

interface AISummaryButtonProps {
  projectId: string
  issueId: string
}

export function AISummaryButton({ projectId, issueId }: AISummaryButtonProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateSummary = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `/api/projects/${projectId}/issues/${issueId}/ai/summary`,
        { method: 'POST' }
      )

      if (!res.ok) {
        throw new Error('AI 요약 생성 실패')
      }

      const data = await res.json()
      setSummary(data.summary)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleGenerateSummary}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all"
      >
        <span>🤖</span>
        <span className="font-medium">
          {isLoading ? 'AI 요약 생성 중...' : 'AI 요약 생성'}
        </span>
      </button>

      {/* AI 요약 결과 */}
      {summary && (
        <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
          <h4 className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
            <span>✨</span>
            AI 요약
          </h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{summary}</p>
        </div>
      )}

      {/* 에러 표시 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}
```

#### 7-2. AI 제안 버튼

**파일**: `app/components/ai/AISuggestionButton.tsx`

```typescript
'use client'

import { useState } from 'react'

interface AISuggestionButtonProps {
  projectId: string
  issueId: string
}

export function AISuggestionButton({ projectId, issueId }: AISuggestionButtonProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerateSuggestions = async () => {
    setIsLoading(true)

    try {
      const res = await fetch(
        `/api/projects/${projectId}/issues/${issueId}/ai/suggestion`,
        { method: 'POST' }
      )

      if (!res.ok) throw new Error('AI 제안 생성 실패')

      const data = await res.json()
      setSuggestions(data.suggestions || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleGenerateSuggestions}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50"
      >
        <span>💡</span>
        <span className="font-medium">
          {isLoading ? 'AI 제안 생성 중...' : 'AI 제안 받기'}
        </span>
      </button>

      {suggestions.length > 0 && (
        <div className="p-4 bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-lg space-y-2">
          <h4 className="text-sm font-semibold text-green-900 flex items-center gap-2">
            <span>💡</span>
            AI 제안사항
          </h4>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex gap-2 text-sm text-gray-700">
                <span className="text-green-600">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

#### 7-3. AI 라벨 추천

**파일**: `app/components/ai/AILabelRecommendation.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useUpdateIssue } from '@/app/lib/hooks/useIssues'

interface AILabelRecommendationProps {
  projectId: string
  issueId: string
  currentLabelIds: string[]
}

export function AILabelRecommendation({
  projectId,
  issueId,
  currentLabelIds
}: AILabelRecommendationProps) {
  const [recommendedLabels, setRecommendedLabels] = useState<Array<{
    id: string
    name: string
    color: string
    confidence: number
  }>>([])
  const [isLoading, setIsLoading] = useState(false)

  const updateMutation = useUpdateIssue(projectId, issueId)

  const handleGetRecommendations = async () => {
    setIsLoading(true)

    try {
      const res = await fetch(
        `/api/projects/${projectId}/issues/${issueId}/ai/labels`,
        { method: 'POST' }
      )

      if (!res.ok) throw new Error('라벨 추천 실패')

      const data = await res.json()
      setRecommendedLabels(data.recommendedLabels || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyLabel = (labelId: string) => {
    const newLabelIds = [...currentLabelIds, labelId]
    updateMutation.mutate({ labelIds: newLabelIds })
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleGetRecommendations}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 disabled:opacity-50"
      >
        <span>🏷️</span>
        <span>{isLoading ? '분석 중...' : 'AI 라벨 추천'}</span>
      </button>

      {recommendedLabels.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600">추천 라벨 (클릭하여 적용)</p>
          <div className="flex flex-wrap gap-2">
            {recommendedLabels.map((label) => (
              <button
                key={label.id}
                onClick={() => handleApplyLabel(label.id)}
                disabled={currentLabelIds.includes(label.id)}
                className="flex items-center gap-2 px-3 py-1 rounded text-xs transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: `${label.color}20`,
                  color: label.color,
                  border: `1px solid ${label.color}40`
                }}
              >
                <span>{label.name}</span>
                <span className="text-xs opacity-70">
                  {Math.round(label.confidence * 100)}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

---

### 예시 8: 알림 드롭다운 (Phase 9)

**파일**: `app/components/layout/NotificationDropdown.tsx`

```typescript
'use client'

import { useState, useRef, useEffect } from 'react'
import { useUnreadNotifications, useMarkNotificationAsRead } from '@/app/lib/hooks/useNotifications'
import { useRouter } from 'next/navigation'

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const { data: notifications = [] } = useUnreadNotifications()
  const markAsReadMutation = useMarkNotificationAsRead()

  const unreadCount = notifications.length

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = async (notification: any) => {
    // 읽음 처리
    if (!notification.is_read) {
      await markAsReadMutation.mutateAsync(notification.id)
    }

    // 링크로 이동
    if (notification.link) {
      router.push(notification.link)
    }

    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 알림 아이콘 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* 읽지 않은 알림 뱃지 */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* 헤더 */}
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">알림</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {unreadCount}개의 읽지 않은 알림
              </p>
            )}
          </div>

          {/* 알림 목록 */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500">새로운 알림이 없습니다</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification: any) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    {/* 알림 내용 */}
                    <p className="text-sm text-gray-900 mb-1">
                      {notification.message}
                    </p>

                    {/* 시간 */}
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(notification.created_at)}
                    </p>

                    {/* 읽지 않음 표시 */}
                    {!notification.is_read && (
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 푸터 */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <button
                onClick={() => {
                  router.push('/notifications')
                  setIsOpen(false)
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                모든 알림 보기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// 시간 표시 헬퍼
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return '방금 전'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`

  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric'
  })
}
```

---

### 예시 9: 헤더 컴포넌트 with 알림 (Phase 9)

**파일**: `app/components/layout/Header.tsx`

```typescript
'use client'

import { useAuth } from '@/app/lib/hooks/useAuth'
import { NotificationDropdown } from './NotificationDropdown'
import Link from 'next/link'

export function Header() {
  const { user, logoutMutation } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Unlooped
            </Link>

            {/* 네비게이션 */}
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/teams"
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded hover:bg-gray-100"
              >
                팀
              </Link>
              <Link
                href="/personal"
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded hover:bg-gray-100"
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
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>

                {/* 프로필 이미지 */}
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-medium">
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <span>{user.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                {/* 로그아웃 */}
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded hover:bg-gray-100"
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
```

---

### 예시 10: IssueDetailModal (Phase 5 - 칸반 보드용)

**파일**: `app/components/kanban/IssueDetailModal.tsx`

```typescript
'use client'

import { useIssue } from '@/app/lib/hooks/useIssues'
import { SubtaskList } from '@/app/components/issues/SubtaskList'
import { CommentSection } from '@/app/components/issues/CommentSection'
import { AISummaryButton } from '@/app/components/ai/AISummaryButton'
import { AISuggestionButton } from '@/app/components/ai/AISuggestionButton'

interface IssueDetailModalProps {
  projectId: string
  issueId: string
  onClose: () => void
}

export function IssueDetailModal({ projectId, issueId, onClose }: IssueDetailModalProps) {
  const { data: issue, isLoading } = useIssue(projectId, issueId)

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!issue) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{issue.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">상태</label>
              <p className="font-medium">{issue.state?.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">우선순위</label>
              <p className="font-medium">{issue.priority}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">담당자</label>
              <p className="font-medium">{issue.assignee?.name || '없음'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">마감일</label>
              <p className="font-medium">{issue.due_date || '없음'}</p>
            </div>
          </div>

          {/* 설명 */}
          <div>
            <h3 className="text-lg font-semibold mb-2">설명</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
          </div>

          {/* AI 기능 */}
          <div className="flex gap-3">
            <AISummaryButton projectId={projectId} issueId={issueId} />
            <AISuggestionButton projectId={projectId} issueId={issueId} />
          </div>

          {/* 서브태스크 */}
          {issue.subtasks && (
            <SubtaskList
              projectId={projectId}
              issueId={issueId}
              subtasks={issue.subtasks}
            />
          )}

          {/* 댓글 */}
          <CommentSection projectId={projectId} issueId={issueId} />
        </div>
      </div>
    </div>
  )
}
```

**사용 예시** (IssueCard.tsx에서):
```typescript
import { IssueDetailModal } from './IssueDetailModal'
import { useState } from 'react'

// IssueCard 내부에서
const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null)

<div onClick={() => setSelectedIssueId(issue.id)}>
  {/* IssueCard 내용 */}
</div>

{selectedIssueId && (
  <IssueDetailModal
    projectId={projectId}
    issueId={selectedIssueId}
    onClose={() => setSelectedIssueId(null)}
  />
)}
```

---

## 12. 중요 Hook 참조 가이드

### 이슈 관련 Hooks (`useIssues.ts`)

```typescript
// ✅ 구현된 Hooks
useIssue(projectId, issueId)              // 이슈 상세 조회
useIssues(projectId, filters?)            // 이슈 목록 조회 (필터링)
useCreateIssue(projectId)                 // 이슈 생성
useUpdateIssue(projectId, issueId)        // 이슈 수정
useMoveIssue(projectId)                   // 이슈 이동 (Optimistic Update 포함)
useDeleteIssue(projectId)                 // 이슈 삭제
useIssueHistory(projectId, issueId)       // 이슈 히스토리
useCreateSubtask(projectId, issueId)      // 서브태스크 생성
useUpdateSubtask(projectId, issueId)      // 서브태스크 수정
useDeleteSubtask(projectId, issueId)      // 서브태스크 삭제
```

### 알림 Hooks (`useNotifications.ts`)

```typescript
// ✅ 구현된 Hooks
useNotifications(limit?, offset?)          // 알림 목록 (30초 자동 갱신)
useUnreadNotifications()                   // 미읽은 알림 (10초 자동 갱신)
useMarkNotificationAsRead()                // 알림 읽음 처리
useMarkAllNotificationsAsRead()            // 전체 읽음 처리
```

### 칸반 Hook (`useKanbanData.ts`)

```typescript
// ✅ 구현된 Hook
useKanbanData(projectId)                   // 칸반 보드 데이터 (30초 자동 갱신)
// 반환: { states: [...], totalIssues: number }
```

---

**이제 모든 필요한 컴포넌트 예시가 준비되었습니다! 🎉**
