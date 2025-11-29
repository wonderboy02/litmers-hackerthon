# Unlooped MVP - 프로젝트 개요 및 컨벤션

> **최종 업데이트**: 2025-11-29  
> **프로젝트명**: Unlooped MVP  
> **현재 진행률**: 90% (Phase 4~9 완료, UI 컴포넌트 일부 미구현)

---

## 📌 프로젝트 개요

### 목적
Linear, Jira와 같은 이슈 트래킹 시스템의 MVP 버전으로, AI 기능이 통합된 현대적인 프로젝트 관리 도구

### 핵심 기능
1. **팀 & 프로젝트 관리**: 팀 생성, 멤버 초대, 프로젝트 관리
2. **이슈 관리**: 칸반 보드, 드래그 앤 드롭, 서브태스크
3. **AI 통합**: 이슈 요약, 제안, 라벨 추천, 중복 감지
4. **실시간 협업**: 댓글, 알림, 활동 로그
5. **대시보드**: 개인/팀 통계, 차트

---

## 🛠 기술 스택

### Frontend
- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript (strict mode)
- **UI 라이브러리**: React 18
- **스타일링**: Tailwind CSS 4
- **상태 관리**: TanStack React Query v5
- **Drag & Drop**: @hello-pangea/dnd v18
- **차트**: Recharts v3
- **Toast**: Sonner v2
- **아이콘**: Lucide React
- **UI 컴포넌트**: Radix UI (Dialog, Dropdown, Popover 등)

### Backend
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth
- **AI**: Anthropic Claude (via @anthropic-ai/sdk)
- **이메일**: Resend
- **Validation**: Zod v4

### 개발 도구
- **포맷터**: Prettier (prettier-plugin-tailwindcss)
- **린터**: ESLint
- **타입 생성**: Supabase CLI

---

## 📂 디렉터리 구조

```
unlooped-mvp/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 인증 라우트 그룹 (비로그인)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/              # 대시보드 라우트 그룹 (로그인 필요)
│   │   ├── personal/             # 개인 대시보드
│   │   │   └── page.tsx
│   │   ├── teams/                # 팀 관리
│   │   │   ├── page.tsx          # 팀 목록
│   │   │   └── [teamId]/
│   │   │       ├── page.tsx      # 팀 상세
│   │   │       └── projects/
│   │   │           └── [projectId]/
│   │   │               ├── page.tsx                      # 칸반 보드
│   │   │               └── issues/
│   │   │                   └── [issueId]/
│   │   │                       └── page.tsx              # 이슈 상세
│   │   ├── layout.tsx            # 공통 대시보드 레이아웃
│   │   └── page.tsx              # 대시보드 홈
│   │
│   ├── api/                      # API Routes (40+ 엔드포인트)
│   │   ├── auth/                 # 인증 API
│   │   │   ├── signup/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── me/route.ts
│   │   │   ├── profile/route.ts
│   │   │   ├── change-password/route.ts
│   │   │   ├── delete-account/route.ts
│   │   │   ├── reset-password/route.ts
│   │   │   └── callback/route.ts
│   │   │
│   │   ├── teams/                # 팀 관리 API
│   │   │   ├── route.ts          # GET (목록), POST (생성)
│   │   │   └── [teamId]/
│   │   │       ├── route.ts      # GET, PATCH, DELETE
│   │   │       ├── invite/route.ts
│   │   │       ├── leave/route.ts
│   │   │       ├── members/route.ts
│   │   │       ├── role/route.ts
│   │   │       └── activity-logs/route.ts
│   │   │
│   │   ├── projects/             # 프로젝트 관리 API
│   │   │   ├── route.ts
│   │   │   └── [projectId]/
│   │   │       ├── route.ts
│   │   │       ├── archive/route.ts
│   │   │       ├── favorite/route.ts
│   │   │       ├── states/route.ts
│   │   │       ├── labels/route.ts
│   │   │       └── issues/
│   │   │           ├── route.ts
│   │   │           ├── ai/
│   │   │           │   └── duplicates/route.ts
│   │   │           └── [issueId]/
│   │   │               ├── route.ts
│   │   │               ├── move/route.ts
│   │   │               ├── history/route.ts
│   │   │               ├── subtasks/
│   │   │               │   ├── route.ts
│   │   │               │   └── [subtaskId]/route.ts
│   │   │               ├── comments/
│   │   │               │   ├── route.ts
│   │   │               │   └── [commentId]/route.ts
│   │   │               └── ai/
│   │   │                   ├── summary/route.ts
│   │   │                   ├── suggestion/route.ts
│   │   │                   ├── labels/route.ts
│   │   │                   └── comments/route.ts
│   │   │
│   │   ├── notifications/        # 알림 API
│   │   │   ├── route.ts
│   │   │   ├── unread/route.ts
│   │   │   └── mark-read/route.ts
│   │   │
│   │   └── dashboard/            # 대시보드 API
│   │       ├── personal/route.ts
│   │       ├── teams/[teamId]/route.ts
│   │       └── projects/[projectId]/route.ts
│   │
│   ├── components/               # React 컴포넌트
│   │   ├── auth/                 # 인증 관련
│   │   │   └── LoginModal.tsx
│   │   ├── common/               # 공통 UI
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   ├── dashboard/            # 대시보드
│   │   │   └── charts/
│   │   │       ├── IssueStatusChart.tsx
│   │   │       ├── IssueTimelineChart.tsx
│   │   │       ├── PriorityChart.tsx
│   │   │       └── index.ts
│   │   ├── issues/               # 이슈 관련
│   │   │   ├── CommentSection.tsx
│   │   │   └── SubtaskList.tsx
│   │   ├── kanban/               # 칸반 보드
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   └── IssueCard.tsx
│   │   ├── layout/               # 레이아웃
│   │   │   ├── DashboardHeader.tsx
│   │   │   └── NotificationDropdown.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── Header.tsx
│   │
│   ├── lib/                      # 라이브러리 & 유틸리티
│   │   ├── actions/              # Server Actions
│   │   │   └── auth.ts
│   │   ├── hooks/                # React Query Hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useTeams.ts
│   │   │   ├── useProjects.ts
│   │   │   ├── useIssues.ts
│   │   │   ├── useKanbanData.ts
│   │   │   └── useNotifications.ts
│   │   ├── repositories/         # Repository 레이어
│   │   │   ├── user.repository.ts
│   │   │   ├── team.repository.ts
│   │   │   ├── project.repository.ts
│   │   │   ├── issue.repository.ts
│   │   │   ├── comment.repository.ts
│   │   │   └── notification.repository.ts
│   │   ├── services/             # Service 레이어 (비즈니스 로직)
│   │   │   ├── auth.service.ts
│   │   │   ├── team.service.ts
│   │   │   ├── project.service.ts
│   │   │   ├── issue.service.ts
│   │   │   ├── comment.service.ts
│   │   │   ├── ai.service.ts
│   │   │   ├── notification.service.ts
│   │   │   └── dashboard.service.ts
│   │   ├── supabase/             # Supabase 클라이언트
│   │   │   ├── client.ts         # 클라이언트 사이드
│   │   │   └── server.ts         # 서버 사이드
│   │   ├── utils/                # 유틸리티 함수
│   │   │   ├── date.ts
│   │   │   ├── hash.ts
│   │   │   ├── permissions.ts
│   │   │   └── position.ts       # Drag & Drop position 계산
│   │   ├── validators/           # Zod 스키마
│   │   │   ├── auth.schema.ts
│   │   │   ├── team.schema.ts
│   │   │   ├── project.schema.ts
│   │   │   └── issue.schema.ts
│   │   ├── ai.ts                 # AI 통합 (Anthropic)
│   │   ├── email.ts              # 이메일 발송 (Resend)
│   │   ├── errors.ts             # 에러 헬퍼
│   │   ├── notifications.ts      # 알림 헬퍼
│   │   ├── rate-limit.ts         # Rate Limiting
│   │   ├── storage.ts            # 파일 스토리지
│   │   ├── toast.ts              # Toast 헬퍼 (Sonner 래퍼)
│   │   ├── queries.ts            # 레거시 쿼리 (마이그레이션 중)
│   │   └── util.ts               # 기타 유틸리티
│   │
│   ├── providers/                # Context Providers
│   │   ├── QueryProvider.tsx     # React Query
│   │   ├── AuthProvider.tsx      # 인증
│   │   └── ToastProvider.tsx     # Toast
│   │
│   ├── globals.css               # 글로벌 CSS
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 홈페이지
│
├── types/
│   └── supabase.ts               # Supabase 타입 정의 (자동 생성)
│
├── project_prd/                  # 프로젝트 문서
│   ├── CHECKLIST.md              # 개발 체크리스트
│   ├── DEVELOPMENT_STATUS.md     # 현재 진행 상황
│   ├── FRONTEND_GUIDE.md         # 프론트엔드 구현 가이드
│   ├── SHARED_TYPES_GUIDE.md     # 타입 가이드
│   ├── DEPLOYMENT_GUIDE.md       # 배포 가이드
│   ├── HANDOFF_TO_TEAM.md        # 팀 인수인계 문서
│   └── FINAL_SUMMARY.md          # 최종 요약
│
├── sql/
│   └── DB_schema.sql             # 데이터베이스 스키마
│
├── middleware.ts                 # Next.js 미들웨어 (인증 체크)
├── next.config.js
├── tsconfig.json
├── .prettierrc
├── package.json
└── claude.md                     # 프로젝트 가이드
```

---

## 🎯 아키텍처 설계 원칙

### 레이어 분리 (3-Tier Architecture)
```
API Route Layer (app/api/*)
    ↓
Service Layer (app/lib/services/*)
    ↓
Repository Layer (app/lib/repositories/*)
    ↓
Database (Supabase)
```

### 각 레이어의 책임
1. **API Route**: HTTP 요청 처리, 인증 확인, 응답 포맷팅
2. **Service**: 비즈니스 로직, 권한 검증, 알림 발송, 에러 처리
3. **Repository**: 데이터베이스 CRUD, 쿼리 최적화

### 프론트엔드 패턴
1. **Custom Hooks**: 데이터 페칭 로직을 React Query Hook으로 추상화
2. **Client Components**: 'use client' 지시어로 명시적 선언
3. **Server Components**: 기본값 (layout.tsx 등)
4. **Props Typing**: TypeScript 인터페이스로 Props 타입 정의

---

## 📝 코딩 컨벤션

### TypeScript
```typescript
// ✅ strict mode 활성화
{
  "strict": true,
  "noEmit": true,
  "esModuleInterop": true
}

// ✅ Path Alias 사용
import { Button } from '@/app/components/common'  // O
import { Button } from '../../../components/common'  // X

// ✅ 타입 정의는 인터페이스 우선
interface UserProps {
  id: string
  name: string
}

// ✅ Enum 대신 const assertion
const PRIORITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
} as const
```

### Prettier 설정
```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "arrowParens": "always"
}
```

### 네이밍 컨벤션
```typescript
// 파일명
// - 컴포넌트: PascalCase (Button.tsx, IssueCard.tsx)
// - Hooks: camelCase (useAuth.ts, useIssues.ts)
// - 유틸리티: camelCase (permissions.ts, date.ts)
// - Service/Repository: camelCase.suffix (auth.service.ts, user.repository.ts)

// 변수명
const userName = 'John'              // camelCase
const MAX_ISSUES = 200               // UPPER_SNAKE_CASE (상수)

// 함수명
function createIssue() {}            // camelCase (동사 + 명사)
function getIssueById() {}           // get/set/is/has prefix

// 컴포넌트명
export function IssueCard() {}       // PascalCase

// Hook 명
export function useIssues() {}       // use prefix + camelCase

// 타입/인터페이스
interface User {}                    // PascalCase
type IssueStatus = 'open' | 'closed' // PascalCase
```

### React 컴포넌트 패턴
```typescript
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// 1. Props 인터페이스 정의
interface ComponentProps {
  id: string
  onSuccess?: () => void
}

// 2. 컴포넌트 함수
export function Component({ id, onSuccess }: ComponentProps) {
  // 3. State 선언
  const [isOpen, setIsOpen] = useState(false)
  
  // 4. React Query Hooks
  const { data, isLoading } = useQuery({
    queryKey: ['key'],
    queryFn: async () => { /* ... */ }
  })
  
  // 5. 이벤트 핸들러
  const handleClick = () => {
    // ...
  }
  
  // 6. 조건부 렌더링 (Early Return)
  if (isLoading) return <div>Loading...</div>
  if (!data) return null
  
  // 7. JSX 반환
  return (
    <div>
      {/* ... */}
    </div>
  )
}
```

### API Route 패턴
```typescript
import { NextResponse } from 'next/server'
import { someService } from '@/app/lib/services/some.service'
import { createServerClient } from '@/app/lib/supabase/server'

export async function GET(request: Request) {
  try {
    // 1. 인증 확인
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Service 호출
    const result = await someService.getSomething(user.id)

    // 3. 성공 응답
    return NextResponse.json(result)
  } catch (error) {
    // 4. 에러 처리
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}
```

### Service 레이어 패턴
```typescript
import { someRepository } from '@/app/lib/repositories/some.repository'
import { verifyPermission } from '@/app/lib/utils/permissions'

export const someService = {
  async createSomething(userId: string, data: CreateInput) {
    // 1. 권한 검증
    await verifyPermission(userId, 'ACTION')

    // 2. 비즈니스 로직
    const validated = validateData(data)

    // 3. Repository 호출
    const result = await someRepository.create(validated)

    // 4. 후처리 (알림, 로그 등)
    await notificationService.sendNotification(/* ... */)

    return result
  }
}
```

---

## 🔒 보안 원칙

1. **환경 변수 분리**
   - 클라이언트: `NEXT_PUBLIC_*` prefix
   - 서버: prefix 없음 (API Routes에서만 접근 가능)

2. **인증 확인**
   - 모든 API Route에서 `supabase.auth.getUser()` 확인
   - 미들웨어에서 보호된 경로 체크 (`middleware.ts`)

3. **권한 검증**
   - Service 레이어에서 RBAC 권한 체크 (`verifyPermission`)
   - 팀 역할: OWNER > ADMIN > MEMBER

4. **입력 검증**
   - Zod 스키마로 모든 입력 검증
   - SQL Injection 방지 (Supabase 클라이언트 사용)

---

## 📊 데이터베이스 제약 사항

### 제한(Limits)
- 프로젝트당 최대 **200개** 이슈
- 이슈당 최대 **20개** 서브태스크
- 이슈당 최대 **5개** 라벨
- 팀당 최대 **50명** 멤버

### 소프트 삭제
- `deleted_at` 컬럼으로 소프트 삭제 구현
- 실제 데이터는 보존, 쿼리에서 제외

### Cascade 정책
- `auth.users` 삭제 시 `public.users` 자동 삭제
- 팀 삭제 시 프로젝트/이슈 자동 삭제
- 프로젝트 삭제 시 이슈/상태/라벨 자동 삭제

---

## 🚀 개발 워크플로우

### 1. DB 스키마 변경 시
```bash
# 1. Supabase Dashboard에서 스키마 수정
# 2. 타입 재생성
npm run gen:types

# 3. 관련 코드 수정
# 4. 테스트
```

### 2. 새 기능 개발 시 순서
```
1. Zod 스키마 작성 (validators/)
2. Repository 레이어 작성 (repositories/)
3. Service 레이어 작성 (services/)
4. API Route 작성 (api/)
5. React Query Hook 작성 (hooks/)
6. UI 컴포넌트 작성 (components/)
7. 페이지 작성 ((dashboard)/ 또는 (auth)/)
```

### 3. 코드 포맷팅
```bash
npm run format        # Prettier 실행
npm run lint          # ESLint 실행
```

---

## 🎨 UI/UX 가이드

### Tailwind CSS 사용
```typescript
// ✅ Utility-first 접근
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Click
</button>

// ✅ 공통 패턴은 컴포넌트로 추상화
<Button variant="primary" size="md">Click</Button>
```

### 로딩 & 에러 처리
```typescript
// 로딩 상태
if (isLoading) {
  return (
    <div className="flex items-center justify-center h-screen">
      <LoadingSpinner />
    </div>
  )
}

// 에러 상태
if (error) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-600">{error.message}</p>
    </div>
  )
}
```

### Toast 사용
```typescript
import { toast } from '@/app/lib/toast'

// 성공
toast.success('이슈가 생성되었습니다')

// 에러
toast.error(error, '이슈 생성 실패')

// 경고
toast.warning('WIP Limit을 초과했습니다')
```

---

## 📚 주요 참고 문서

1. **프론트엔드 구현**: `project_prd/FRONTEND_GUIDE.md`
2. **타입 가이드**: `project_prd/SHARED_TYPES_GUIDE.md`
3. **개발 현황**: `project_prd/DEVELOPMENT_STATUS.md`
4. **배포 가이드**: `project_prd/DEPLOYMENT_GUIDE.md`

---

## ✅ 품질 체크리스트

### 코드 작성 전
- [ ] 유사한 기존 코드 확인
- [ ] 타입 정의 확인 (`types/supabase.ts`)
- [ ] Zod 스키마 작성

### 코드 작성 중
- [ ] TypeScript strict 모드 에러 없음
- [ ] Props 인터페이스 정의
- [ ] 에러 처리 추가
- [ ] 로딩 상태 처리

### 코드 작성 후
- [ ] Prettier 포맷팅 실행
- [ ] ESLint 경고 없음
- [ ] 불필요한 콘솔 로그 제거
- [ ] 주석으로 복잡한 로직 설명
