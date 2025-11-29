# 전체 구현 계획

> **목표**: PRD 기반 Unlooped MVP 완전 구현 (8시간 내)
> **전략**: Phase별 순차 구현 → 테스트 → 배포
> **마지막 업데이트**: 2025-11-29

---

## 📊 전체 개요

### 구현 현황

| 항목 | 상태 | 비고 |
|------|------|------|
| **인프라** | ✅ 완료 | 이메일, AI, Storage, 에러 핸들링 |
| **DB 스키마** | 🟡 준비 | SQL 실행 필요 |
| **비즈니스 로직** | ⬜ 대기 | 본 계획서 기반 구현 |
| **UI 컴포넌트** | ⬜ 대기 | 비즈니스 로직 후 구현 |

### 총 예상 시간: **6~7시간**

| Phase | 주제 | 예상 시간 | 우선순위 |
|-------|------|-----------|----------|
| Phase 0 | DB 스키마 적용 | 15분 | P0 |
| Phase 1 | 인증 시스템 | 1시간 | P0 |
| Phase 2 | 팀 관리 | 1시간 | P1 |
| Phase 3 | 프로젝트 관리 | 45분 | P1 |
| Phase 4 | 이슈 기본 CRUD | 1시간 | P1 |
| Phase 5 | 칸반 보드 (Drag & Drop) | 1시간 | P1 |
| Phase 6 | AI 기능 | 45분 | P1 |
| Phase 7 | 댓글 시스템 | 30분 | P2 |
| Phase 8 | 대시보드/통계 | 45분 | P2 |
| Phase 9 | 알림 시스템 | 30분 | P2 |

---

## 🗂️ 프로젝트 폴더 구조

```
app/
├── (auth)/                      # 인증 관련 라우트 그룹
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   ├── reset-password/
│   │   ├── page.tsx
│   │   └── [token]/page.tsx
│   └── oauth/
│       └── callback/
│           └── route.ts
│
├── (dashboard)/                 # 대시보드 레이아웃 그룹
│   ├── layout.tsx              # 공통 레이아웃 (헤더, 사이드바)
│   ├── teams/
│   │   ├── page.tsx            # 팀 목록
│   │   ├── [teamId]/
│   │   │   ├── page.tsx        # 팀 상세 (멤버, 활동 로그)
│   │   │   ├── settings/
│   │   │   │   └── page.tsx    # 팀 설정
│   │   │   └── projects/
│   │   │       ├── page.tsx    # 프로젝트 목록
│   │   │       └── [projectId]/
│   │   │           ├── page.tsx            # 칸반 보드
│   │   │           ├── issues/
│   │   │           │   └── [issueId]/
│   │   │           │       └── page.tsx    # 이슈 상세
│   │   │           └── settings/
│   │   │               └── page.tsx        # 프로젝트 설정
│   ├── personal/
│   │   └── page.tsx            # 개인 대시보드
│   └── profile/
│       └── page.tsx            # 프로필 관리
│
├── api/                         # API Routes
│   ├── auth/
│   │   ├── signup/route.ts
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   ├── reset-password/route.ts
│   │   └── profile/route.ts
│   ├── teams/
│   │   ├── route.ts            # POST (생성), GET (목록)
│   │   └── [teamId]/
│   │       ├── route.ts        # GET, PATCH, DELETE
│   │       ├── members/route.ts
│   │       ├── invite/route.ts
│   │       └── activity-logs/route.ts
│   ├── projects/
│   │   ├── route.ts
│   │   └── [projectId]/
│   │       ├── route.ts
│   │       ├── states/route.ts
│   │       ├── labels/route.ts
│   │       ├── favorite/route.ts
│   │       └── issues/
│   │           ├── route.ts
│   │           └── [issueId]/
│   │               ├── route.ts
│   │               ├── move/route.ts
│   │               ├── comments/route.ts
│   │               ├── subtasks/route.ts
│   │               └── ai/
│   │                   ├── summary/route.ts
│   │                   ├── suggestion/route.ts
│   │                   └── labels/route.ts
│   ├── notifications/
│   │   ├── route.ts
│   │   └── mark-read/route.ts
│   └── dashboard/
│       ├── personal/route.ts
│       └── team/[teamId]/route.ts
│
├── components/                  # UI 컴포넌트
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── GoogleLoginButton.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── NotificationDropdown.tsx
│   ├── teams/
│   │   ├── TeamCard.tsx
│   │   ├── TeamMemberList.tsx
│   │   ├── InviteMemberModal.tsx
│   │   └── RoleChangeModal.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectForm.tsx
│   │   └── CustomStateForm.tsx
│   ├── kanban/
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   ├── IssueCard.tsx
│   │   └── IssueDetailModal.tsx
│   ├── issues/
│   │   ├── IssueForm.tsx
│   │   ├── IssueFilters.tsx
│   │   ├── SubtaskList.tsx
│   │   ├── CommentList.tsx
│   │   └── IssueHistory.tsx
│   ├── ai/
│   │   ├── AISummaryButton.tsx
│   │   ├── AISuggestionButton.tsx
│   │   └── AILabelRecommendation.tsx
│   ├── dashboard/
│   │   ├── PersonalDashboard.tsx
│   │   ├── ProjectDashboard.tsx
│   │   ├── TeamStatistics.tsx
│   │   └── charts/
│   │       ├── IssueStatusChart.tsx
│   │       └── IssueTimelineChart.tsx
│   └── common/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Dropdown.tsx
│       └── LoadingSpinner.tsx
│
├── lib/
│   ├── supabase.ts             # ✅ 이미 존재
│   ├── email.ts                # ✅ 이미 존재
│   ├── ai.ts                   # ✅ 이미 존재
│   ├── rate-limit.ts           # ✅ 이미 존재
│   ├── storage.ts              # ✅ 이미 존재
│   ├── errors.ts               # ✅ 이미 존재
│   ├── toast.ts                # ✅ 이미 존재
│   ├── notifications.ts        # ✅ 이미 존재
│   │
│   ├── services/               # 비즈니스 로직 레이어 (신규)
│   │   ├── auth.service.ts
│   │   ├── team.service.ts
│   │   ├── project.service.ts
│   │   ├── issue.service.ts
│   │   ├── comment.service.ts
│   │   ├── ai.service.ts
│   │   └── notification.service.ts
│   │
│   ├── repositories/           # 데이터 액세스 레이어 (신규)
│   │   ├── user.repository.ts
│   │   ├── team.repository.ts
│   │   ├── project.repository.ts
│   │   ├── issue.repository.ts
│   │   └── notification.repository.ts
│   │
│   ├── validators/             # Zod 스키마 (신규)
│   │   ├── auth.schema.ts
│   │   ├── team.schema.ts
│   │   ├── project.schema.ts
│   │   └── issue.schema.ts
│   │
│   ├── hooks/                  # React Query Hooks (신규)
│   │   ├── useAuth.ts
│   │   ├── useTeams.ts
│   │   ├── useProjects.ts
│   │   ├── useIssues.ts
│   │   └── useNotifications.ts
│   │
│   └── utils/                  # 유틸리티 (신규)
│       ├── position.ts         # LexoRank 구현
│       ├── hash.ts             # SHA256 해싱
│       ├── date.ts             # 날짜 포맷팅
│       └── permissions.ts      # 권한 검증
│
└── providers/
    ├── QueryProvider.tsx       # ✅ 이미 존재
    └── ToastProvider.tsx       # ✅ 이미 존재
```

---

## 🚀 Phase 0: DB 스키마 적용 (15분)

### 목표
- Supabase에 전체 테이블 생성
- 타입 파일 생성

### 작업 순서

**1. Supabase Dashboard에서 SQL 실행**
1. Supabase Dashboard → SQL Editor
2. `sql/DB_schema.sql` 전체 복사
3. 실행 (Run)

**2. TypeScript 타입 생성**
```bash
npm run gen:types
```

**3. 검증**
```bash
# Supabase Dashboard → Table Editor에서 테이블 확인
# - users, teams, projects, issues 등 20개 테이블 존재 확인
```

### 체크리스트
- [ ] 모든 테이블 생성 완료 (20개)
- [ ] ENUM 타입 생성 완료 (user_role, priority_level, ai_feature_type)
- [ ] Index 생성 완료
- [ ] `types/supabase.ts` 파일 업데이트

---

## 🔐 Phase 1: 인증 시스템 (1시간)

### 구현 FR
- FR-001: 회원가입
- FR-002: 로그인/로그아웃
- FR-003: 비밀번호 재설정
- FR-004: Google OAuth
- FR-005: 프로필 관리
- FR-006: 비밀번호 변경
- FR-007: 계정 삭제

### 작업 순서

#### 1-1. Zod 스키마 작성 (10분)

**파일**: `app/lib/validators/auth.schema.ts`

```typescript
import { z } from 'zod'

export const signupSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다').max(255),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다').max(100),
  name: z.string().min(1, '이름을 입력해주세요').max(50)
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export const resetPasswordRequestSchema = z.object({
  email: z.string().email()
})

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6).max(100)
})

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  profileImage: z.string().url().optional()
})

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6).max(100),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: '새 비밀번호가 일치하지 않습니다',
  path: ['confirmPassword']
})
```

#### 1-2. Repository 레이어 (15분)

**파일**: `app/lib/repositories/user.repository.ts`

```typescript
import { supabase } from '@/app/lib/supabase'
import { Database } from '@/types/supabase'

type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

export const userRepository = {
  async findById(id: string): Promise<User | null> {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    return data
  },

  async findByEmail(email: string): Promise<User | null> {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .is('deleted_at', null)
      .single()
    return data
  },

  async findByGoogleId(googleId: string): Promise<User | null> {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', googleId)
      .is('deleted_at', null)
      .single()
    return data
  },

  async create(user: UserInsert): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: UserUpdate): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  }
}

export const passwordResetRepository = {
  async create(userId: string, token: string) {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1시간 후

    const { data, error } = await supabase
      .from('password_reset_tokens')
      .insert({ user_id: userId, token, expires_at: expiresAt.toISOString() })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async findValidToken(token: string) {
    const { data } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .gte('expires_at', new Date().toISOString())
      .single()

    return data
  },

  async deleteToken(token: string) {
    await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('token', token)
  }
}
```

#### 1-3. Service 레이어 (20분)

**파일**: `app/lib/services/auth.service.ts`

```typescript
import { supabase } from '@/app/lib/supabase'
import { userRepository, passwordResetRepository } from '@/app/lib/repositories/user.repository'
import { sendPasswordResetEmail } from '@/app/lib/email'
import { AuthError, ValidationError, NotFoundError } from '@/app/lib/errors'
import { nanoid } from 'nanoid'

export const authService = {
  // FR-001: 회원가입
  async signup(email: string, password: string, name: string) {
    // 이메일 중복 체크
    const existing = await userRepository.findByEmail(email)
    if (existing) {
      throw new ValidationError('이미 사용 중인 이메일입니다')
    }

    // Supabase Auth 회원가입
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })

    if (authError) throw new AuthError(authError.message)
    if (!authData.user) throw new AuthError('회원가입에 실패했습니다')

    // public.users 테이블에 프로필 생성
    await userRepository.create({
      id: authData.user.id,
      email,
      name,
      password_hash: null, // Supabase Auth가 관리
      google_id: null
    })

    return authData
  },

  // FR-002: 로그인
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw new AuthError('이메일 또는 비밀번호가 올바르지 않습니다')
    }

    return data
  },

  // FR-002: 로그아웃
  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw new AuthError(error.message)
  },

  // FR-003: 비밀번호 재설정 요청
  async requestPasswordReset(email: string) {
    const user = await userRepository.findByEmail(email)
    if (!user) {
      // 보안: 사용자 존재 여부 노출 방지
      return { success: true }
    }

    const token = nanoid(32)
    await passwordResetRepository.create(user.id, token)
    await sendPasswordResetEmail(email, token, user.name)

    return { success: true }
  },

  // FR-003: 비밀번호 재설정
  async resetPassword(token: string, newPassword: string) {
    const resetToken = await passwordResetRepository.findValidToken(token)
    if (!resetToken) {
      throw new ValidationError('유효하지 않거나 만료된 토큰입니다')
    }

    const user = await userRepository.findById(resetToken.user_id)
    if (!user) throw new NotFoundError('사용자를 찾을 수 없습니다')

    // Supabase Auth 비밀번호 변경
    const { error } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (error) throw new AuthError(error.message)

    // 토큰 삭제
    await passwordResetRepository.deleteToken(token)

    return { success: true }
  },

  // FR-005: 프로필 수정
  async updateProfile(userId: string, updates: { name?: string; profileImage?: string }) {
    return await userRepository.update(userId, {
      name: updates.name,
      profile_image: updates.profileImage
    })
  },

  // FR-006: 비밀번호 변경
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId)
    if (!user) throw new NotFoundError('사용자를 찾을 수 없습니다')

    // Google OAuth 사용자는 비밀번호 변경 불가
    if (user.google_id) {
      throw new ValidationError('Google 계정으로 가입한 사용자는 비밀번호를 변경할 수 없습니다')
    }

    // 현재 비밀번호 검증
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    })

    if (signInError) {
      throw new ValidationError('현재 비밀번호가 올바르지 않습니다')
    }

    // 새 비밀번호로 변경
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw new AuthError(error.message)

    return { success: true }
  },

  // FR-007: 계정 삭제
  async deleteAccount(userId: string) {
    // 소유한 팀 확인
    const { count } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .is('deleted_at', null)

    if (count && count > 0) {
      throw new ValidationError('소유한 팀을 먼저 삭제하거나 소유권을 이전해주세요')
    }

    // Soft Delete
    await userRepository.softDelete(userId)

    // Supabase Auth 삭제 (선택)
    // await supabase.auth.admin.deleteUser(userId)

    return { success: true }
  },

  // 현재 사용자 조회
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw new AuthError(error.message)
    if (!user) return null

    const profile = await userRepository.findById(user.id)
    return profile
  }
}
```

#### 1-4. API Routes (10분)

**파일**: `app/api/auth/signup/route.ts`

```typescript
import { NextRequest } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { signupSchema } from '@/app/lib/validators/auth.schema'
import { createErrorResponse } from '@/app/lib/errors'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = signupSchema.parse(body)

    const result = await authService.signup(
      validated.email,
      validated.password,
      validated.name
    )

    return Response.json(result)
  } catch (error) {
    return createErrorResponse(error)
  }
}
```

**파일**: `app/api/auth/login/route.ts`, `logout/route.ts`, `reset-password/route.ts` 등 유사하게 구현

#### 1-5. React Query Hooks (5분)

**파일**: `app/lib/hooks/useAuth.ts`

```typescript
'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/app/lib/toast'

export function useAuth() {
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me')
      if (!res.ok) return null
      return res.json()
    }
  })

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('로그인 실패')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      toast.success('로그인되었습니다')
    },
    onError: () => {
      toast.error('이메일 또는 비밀번호가 올바르지 않습니다')
    }
  })

  const signupMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; name: string }) => {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('회원가입 실패')
      return res.json()
    },
    onSuccess: () => {
      toast.success('회원가입이 완료되었습니다')
    }
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch('/api/auth/logout', { method: 'POST' })
    },
    onSuccess: () => {
      queryClient.clear()
      toast.success('로그아웃되었습니다')
    }
  })

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    logout: logoutMutation.mutate
  }
}
```

#### 1-6. UI 컴포넌트 (10분)

**파일**: `app/(auth)/login/page.tsx`, `signup/page.tsx` 등

### 체크리스트
- [ ] Zod 스키마 작성
- [ ] Repository 레이어 작성
- [ ] Service 레이어 작성
- [ ] API Routes 작성 (7개)
- [ ] React Query Hooks 작성
- [ ] UI 컴포넌트 작성 (로그인, 회원가입, 비밀번호 재설정)
- [ ] Google OAuth 버튼 구현
- [ ] 프로필 관리 페이지

---

## 👥 Phase 2: 팀 관리 (1시간)

### 구현 FR
- FR-010: 팀 생성
- FR-011: 팀 정보 수정
- FR-012: 팀 삭제
- FR-013: 팀 멤버 초대
- FR-014: 팀 멤버 조회
- FR-015: 팀 멤버 강제 퇴장
- FR-016: 팀 탈퇴
- FR-017: 역할 체계 (OWNER/ADMIN/MEMBER)
- FR-018: 역할 변경
- FR-019: 팀 활동 로그

### 작업 순서

#### 2-1. Zod 스키마 (5분)

**파일**: `app/lib/validators/team.schema.ts`

```typescript
import { z } from 'zod'

export const createTeamSchema = z.object({
  name: z.string().min(1).max(50)
})

export const updateTeamSchema = z.object({
  name: z.string().min(1).max(50)
})

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER')
})

export const changeRoleSchema = z.object({
  userId: z.string().uuid(),
  newRole: z.enum(['OWNER', 'ADMIN', 'MEMBER'])
})
```

#### 2-2. Repository 레이어 (10분)

**파일**: `app/lib/repositories/team.repository.ts`

```typescript
import { supabase } from '@/app/lib/supabase'
import { Database } from '@/types/supabase'

type Team = Database['public']['Tables']['teams']['Row']
type TeamInsert = Database['public']['Tables']['teams']['Insert']
type TeamMember = Database['public']['Tables']['team_members']['Row']

export const teamRepository = {
  async findById(id: string): Promise<Team | null> {
    const { data } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    return data
  },

  async findByUserId(userId: string): Promise<Team[]> {
    const { data } = await supabase
      .from('teams')
      .select(`
        *,
        team_members!inner(user_id)
      `)
      .eq('team_members.user_id', userId)
      .is('deleted_at', null)

    return data || []
  },

  async create(team: TeamInsert): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .insert(team)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<TeamInsert>): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('teams')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  }
}

export const teamMemberRepository = {
  async findMember(teamId: string, userId: string): Promise<TeamMember | null> {
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single()

    return data
  },

  async findMembers(teamId: string): Promise<TeamMember[]> {
    const { data } = await supabase
      .from('team_members')
      .select(`
        *,
        users(id, name, email, profile_image)
      `)
      .eq('team_id', teamId)

    return data || []
  },

  async create(teamId: string, userId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER') {
    const { data, error } = await supabase
      .from('team_members')
      .insert({ team_id: teamId, user_id: userId, role })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateRole(teamId: string, userId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER') {
    const { error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('team_id', teamId)
      .eq('user_id', userId)

    if (error) throw error
  },

  async remove(teamId: string, userId: string) {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId)

    if (error) throw error
  }
}

export const teamInvitationRepository = {
  async create(teamId: string, email: string, inviterId: string, token: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일

    const { data, error } = await supabase
      .from('team_invitations')
      .insert({
        team_id: teamId,
        email,
        inviter_id: inviterId,
        token,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async findValidToken(token: string) {
    const { data } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('token', token)
      .gte('expires_at', new Date().toISOString())
      .single()

    return data
  },

  async findPending(teamId: string, email: string) {
    const { data } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('team_id', teamId)
      .eq('email', email)
      .gte('expires_at', new Date().toISOString())
      .single()

    return data
  },

  async updateExpiry(id: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const { error } = await supabase
      .from('team_invitations')
      .update({ expires_at: expiresAt.toISOString() })
      .eq('id', id)

    if (error) throw error
  },

  async delete(token: string) {
    await supabase
      .from('team_invitations')
      .delete()
      .eq('token', token)
  }
}

export const teamActivityLogRepository = {
  async create(log: {
    teamId: string
    actorId: string | null
    targetType: string
    targetId: string | null
    actionType: string
    details?: any
  }) {
    const { error } = await supabase
      .from('team_activity_logs')
      .insert({
        team_id: log.teamId,
        actor_id: log.actorId,
        target_type: log.targetType,
        target_id: log.targetId,
        action_type: log.actionType,
        details: log.details
      })

    if (error) throw error
  },

  async findByTeam(teamId: string, limit = 50) {
    const { data } = await supabase
      .from('team_activity_logs')
      .select(`
        *,
        actor:users(name, profile_image)
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(limit)

    return data || []
  }
}
```

#### 2-3. Service 레이어 (20분)

**파일**: `app/lib/services/team.service.ts`

```typescript
import { teamRepository, teamMemberRepository, teamInvitationRepository, teamActivityLogRepository } from '@/app/lib/repositories/team.repository'
import { sendTeamInvitationEmail } from '@/app/lib/email'
import { ForbiddenError, ValidationError, NotFoundError } from '@/app/lib/errors'
import { nanoid } from 'nanoid'

export const teamService = {
  // FR-010: 팀 생성
  async createTeam(userId: string, name: string) {
    const team = await teamRepository.create({
      name,
      owner_id: userId
    })

    // 생성자를 OWNER로 추가
    await teamMemberRepository.create(team.id, userId, 'OWNER')

    // 활동 로그
    await teamActivityLogRepository.create({
      teamId: team.id,
      actorId: userId,
      targetType: 'TEAM',
      targetId: team.id,
      actionType: 'CREATED'
    })

    return team
  },

  // FR-011: 팀 정보 수정
  async updateTeam(teamId: string, userId: string, updates: { name: string }) {
    await this.verifyPermission(teamId, userId, ['OWNER', 'ADMIN'])

    return await teamRepository.update(teamId, updates)
  },

  // FR-012: 팀 삭제
  async deleteTeam(teamId: string, userId: string) {
    await this.verifyPermission(teamId, userId, ['OWNER'])

    // Soft Delete (하위 프로젝트, 이슈도 Cascade로 자동 삭제됨)
    await teamRepository.softDelete(teamId)

    return { success: true }
  },

  // FR-013: 팀 멤버 초대
  async inviteMember(teamId: string, inviterId: string, email: string, role: 'ADMIN' | 'MEMBER' = 'MEMBER') {
    await this.verifyPermission(teamId, inviterId, ['OWNER', 'ADMIN'])

    const team = await teamRepository.findById(teamId)
    if (!team) throw new NotFoundError('팀을 찾을 수 없습니다')

    // 기존 초대 확인
    const existing = await teamInvitationRepository.findPending(teamId, email)

    if (existing) {
      // 재발송 (만료일 갱신)
      await teamInvitationRepository.updateExpiry(existing.id)
      await sendTeamInvitationEmail(email, team.name, 'Admin', existing.token)
    } else {
      // 신규 초대
      const token = nanoid(32)
      await teamInvitationRepository.create(teamId, email, inviterId, token)
      await sendTeamInvitationEmail(email, team.name, 'Admin', token)
    }

    return { success: true }
  },

  // FR-014: 팀 멤버 조회
  async getMembers(teamId: string, userId: string) {
    await this.verifyMembership(teamId, userId)

    return await teamMemberRepository.findMembers(teamId)
  },

  // FR-015: 팀 멤버 강제 퇴장
  async kickMember(teamId: string, requesterId: string, targetUserId: string) {
    const requesterMember = await teamMemberRepository.findMember(teamId, requesterId)
    const targetMember = await teamMemberRepository.findMember(teamId, targetUserId)

    if (!requesterMember || !targetMember) {
      throw new NotFoundError('멤버를 찾을 수 없습니다')
    }

    // 권한 검증
    if (requesterMember.role === 'OWNER') {
      // OWNER는 모든 멤버 강제 퇴장 가능
    } else if (requesterMember.role === 'ADMIN') {
      // ADMIN은 MEMBER만 강제 퇴장 가능
      if (targetMember.role !== 'MEMBER') {
        throw new ForbiddenError('MEMBER만 강제 퇴장할 수 있습니다')
      }
    } else {
      throw new ForbiddenError('권한이 없습니다')
    }

    // OWNER 본인은 강제 퇴장 불가
    if (targetMember.role === 'OWNER') {
      throw new ValidationError('OWNER는 강제 퇴장할 수 없습니다')
    }

    await teamMemberRepository.remove(teamId, targetUserId)

    // 활동 로그
    await teamActivityLogRepository.create({
      teamId,
      actorId: requesterId,
      targetType: 'MEMBER',
      targetId: targetUserId,
      actionType: 'KICKED'
    })

    return { success: true }
  },

  // FR-016: 팀 탈퇴
  async leaveTeam(teamId: string, userId: string) {
    const member = await teamMemberRepository.findMember(teamId, userId)
    if (!member) throw new NotFoundError('멤버를 찾을 수 없습니다')

    // OWNER는 탈퇴 불가
    if (member.role === 'OWNER') {
      throw new ValidationError('OWNER는 탈퇴할 수 없습니다. 팀을 삭제하거나 소유권을 이전해주세요')
    }

    await teamMemberRepository.remove(teamId, userId)

    // 활동 로그
    await teamActivityLogRepository.create({
      teamId,
      actorId: userId,
      targetType: 'MEMBER',
      targetId: userId,
      actionType: 'LEFT'
    })

    return { success: true }
  },

  // FR-018: 역할 변경
  async changeRole(teamId: string, requesterId: string, targetUserId: string, newRole: 'OWNER' | 'ADMIN' | 'MEMBER') {
    await this.verifyPermission(teamId, requesterId, ['OWNER'])

    // OWNER 양도 시
    if (newRole === 'OWNER') {
      // 기존 OWNER를 ADMIN으로 강등
      await teamMemberRepository.updateRole(teamId, requesterId, 'ADMIN')

      // 팀 소유자 변경
      await teamRepository.update(teamId, { owner_id: targetUserId })
    }

    await teamMemberRepository.updateRole(teamId, targetUserId, newRole)

    // 활동 로그
    await teamActivityLogRepository.create({
      teamId,
      actorId: requesterId,
      targetType: 'MEMBER',
      targetId: targetUserId,
      actionType: 'ROLE_CHANGED',
      details: { newRole }
    })

    return { success: true }
  },

  // FR-019: 팀 활동 로그
  async getActivityLogs(teamId: string, userId: string, limit = 50) {
    await this.verifyMembership(teamId, userId)

    return await teamActivityLogRepository.findByTeam(teamId, limit)
  },

  // 권한 검증 유틸
  async verifyPermission(teamId: string, userId: string, allowedRoles: ('OWNER' | 'ADMIN' | 'MEMBER')[]) {
    const member = await teamMemberRepository.findMember(teamId, userId)

    if (!member || !allowedRoles.includes(member.role)) {
      throw new ForbiddenError('권한이 없습니다')
    }

    return member
  },

  // 멤버십 검증
  async verifyMembership(teamId: string, userId: string) {
    const member = await teamMemberRepository.findMember(teamId, userId)

    if (!member) {
      throw new ForbiddenError('팀 멤버가 아닙니다')
    }

    return member
  }
}
```

#### 2-4. API Routes (10분)

**파일**: `app/api/teams/route.ts`, `[teamId]/route.ts`, `[teamId]/members/route.ts`, `[teamId]/invite/route.ts` 등

#### 2-5. React Query Hooks (5분)

**파일**: `app/lib/hooks/useTeams.ts`

#### 2-6. UI 컴포넌트 (10분)

**파일**: `app/components/teams/TeamCard.tsx`, `TeamMemberList.tsx`, `InviteMemberModal.tsx` 등

### 체크리스트
- [ ] Zod 스키마
- [ ] Repository (4개)
- [ ] Service 레이어
- [ ] API Routes (6개)
- [ ] React Query Hooks
- [ ] UI 컴포넌트 (팀 목록, 멤버 관리, 초대 모달)

---

## 📊 Phase 3: 프로젝트 관리 (45분)

### 구현 FR
- FR-020: 프로젝트 생성
- FR-021: 프로젝트 목록 조회
- FR-022: 프로젝트 상세 페이지
- FR-023: 프로젝트 수정
- FR-024: 프로젝트 삭제
- FR-025: 프로젝트 설명
- FR-026: 프로젝트 아카이브
- FR-027: 프로젝트 즐겨찾기

### 핵심 구현: 프로젝트 생성 시 기본 상태 자동 생성

**파일**: `app/lib/services/project.service.ts` (일부)

```typescript
async createProject(teamId: string, userId: string, data: { name: string; description?: string }) {
  // 팀당 최대 15개 제한
  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', teamId)
    .is('deleted_at', null)

  if (count && count >= 15) {
    throw new ValidationError('팀당 최대 15개 프로젝트만 생성 가능합니다')
  }

  const project = await projectRepository.create({
    team_id: teamId,
    owner_id: userId,
    name: data.name,
    description: data.description
  })

  // ✅ 기본 3개 상태 자동 생성 (핵심!)
  const defaultStates = [
    { name: 'Backlog', position: 1.0, color: '#gray' },
    { name: 'In Progress', position: 2.0, color: '#blue' },
    { name: 'Done', position: 3.0, color: '#green' }
  ]

  for (const state of defaultStates) {
    await supabase.from('project_states').insert({
      project_id: project.id,
      ...state
    })
  }

  return project
}
```

### 체크리스트
- [ ] Repository (프로젝트, 상태, 라벨, 즐겨찾기)
- [ ] Service 레이어
- [ ] **기본 상태 자동 생성 로직**
- [ ] API Routes
- [ ] React Query Hooks
- [ ] UI 컴포넌트

---

## 🎯 Phase 4: 이슈 기본 CRUD (1시간)

### 구현 FR
- FR-030: 이슈 생성
- FR-031: 이슈 상세 조회
- FR-032: 이슈 수정
- FR-033: 이슈 상태 변경
- FR-034: 담당자 지정
- FR-035: 이슈 삭제
- FR-036: 이슈 검색/필터링
- FR-037: 이슈 우선순위
- FR-038: 이슈 라벨/태그
- FR-039: 이슈 변경 히스토리
- FR-039-2: 서브태스크

### 핵심 구현: Position 계산

**파일**: `app/lib/utils/position.ts`

```typescript
export function calculatePosition(
  prevPosition: number | null,
  nextPosition: number | null
): number {
  // 최상단
  if (prevPosition === null && nextPosition !== null) {
    return nextPosition / 2
  }

  // 최하단
  if (prevPosition !== null && nextPosition === null) {
    return prevPosition + 1.0
  }

  // 중간
  if (prevPosition !== null && nextPosition !== null) {
    const newPos = (prevPosition + nextPosition) / 2

    // 정밀도 한계 체크
    if (newPos === prevPosition || newPos === nextPosition) {
      throw new Error('Position rebalancing required')
    }

    return newPos
  }

  // 빈 컬럼
  return 1.0
}
```

### 체크리스트
- [ ] Repository (이슈, 히스토리, 서브태스크)
- [ ] Service 레이어
- [ ] Position 계산 유틸
- [ ] API Routes (10개)
- [ ] React Query Hooks
- [ ] UI 컴포넌트

---

## 🗂️ Phase 5: 칸반 보드 (1시간)

### 구현 FR
- FR-050: 칸반 보드 표시
- FR-051: Drag & Drop 이동
- FR-052: 같은 컬럼 내 순서 변경
- FR-053: 커스텀 컬럼
- FR-054: WIP Limit

### 핵심 구현: @hello-pangea/dnd

**파일**: `app/components/kanban/KanbanBoard.tsx`

```typescript
'use client'

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useMutation } from '@tanstack/react-query'

export function KanbanBoard({ projectId }: { projectId: string }) {
  const { data: kanbanData } = useKanbanData(projectId)
  const moveIssueMutation = useMoveIssue()

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    // 상태 변경 또는 순서 변경
    moveIssueMutation.mutate({
      issueId: draggableId,
      newStateId: destination.droppableId,
      newPosition: {
        prevItemPosition: /* 계산 */,
        nextItemPosition: /* 계산 */
      }
    })
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {kanbanData.states.map(state => (
        <Droppable key={state.id} droppableId={state.id}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {state.issues.map((issue, index) => (
                <Draggable key={issue.id} draggableId={issue.id} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <IssueCard issue={issue} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </DragDropContext>
  )
}
```

### 체크리스트
- [ ] KanbanBoard 컴포넌트
- [ ] Drag & Drop 로직
- [ ] Optimistic Update
- [ ] WIP Limit 경고 UI
- [ ] 커스텀 상태 관리

---

## 🤖 Phase 6: AI 기능 (45분)

### 구현 FR
- FR-040: 설명 요약 생성
- FR-041: 해결 전략 제안
- FR-042: AI Rate Limiting (이미 구현됨)
- FR-043: AI 이슈 자동 분류
- FR-044: AI 중복 이슈 탐지
- FR-045: AI 댓글 요약

### 체크리스트
- [ ] AI Service (캐싱 로직 포함)
- [ ] API Routes (5개)
- [ ] UI 버튼 컴포넌트 (5개)
- [ ] Rate Limiting 통합

---

## 💬 Phase 7: 댓글 시스템 (30분)

### 구현 FR
- FR-060: 댓글 작성
- FR-061: 댓글 조회
- FR-062: 댓글 수정
- FR-063: 댓글 삭제

### 체크리스트
- [ ] Repository
- [ ] Service
- [ ] API Routes
- [ ] UI 컴포넌트

---

## 📈 Phase 8: 대시보드/통계 (45분)

### 구현 FR
- FR-080: 프로젝트 대시보드
- FR-081: 개인 대시보드
- FR-082: 팀 통계

### 핵심 구현: Recharts

**파일**: `app/components/dashboard/charts/IssueStatusChart.tsx`

```typescript
import { PieChart, Pie, Cell } from 'recharts'

export function IssueStatusChart({ data }: { data: any[] }) {
  return (
    <PieChart width={300} height={300}>
      <Pie data={data} dataKey="count" nameKey="status">
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
    </PieChart>
  )
}
```

### 체크리스트
- [ ] 대시보드 API (3개)
- [ ] 차트 컴포넌트 (3개)
- [ ] UI 레이아웃

---

## 🔔 Phase 9: 알림 시스템 (30분)

### 구현 FR
- FR-090: 인앱 알림
- FR-091: 알림 읽음 처리

### 체크리스트
- [ ] Repository
- [ ] Service (알림 생성 로직)
- [ ] API Routes
- [ ] UI (헤더 알림 드롭다운)

---

## 🚀 배포 (Phase 10)

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 환경 변수 설정
- Vercel Dashboard → Settings → Environment Variables
- 모든 `.env.local` 변수 추가

### 체크리스트
- [ ] Vercel 배포
- [ ] 환경 변수 설정
- [ ] Google OAuth Redirect URI 업데이트
- [ ] 실제 도메인 확인

---

## 📋 전체 완료 체크리스트

### Phase 0: DB 스키마
- [ ] SQL 실행
- [ ] 타입 생성

### Phase 1: 인증
- [ ] 회원가입/로그인
- [ ] Google OAuth
- [ ] 비밀번호 재설정
- [ ] 프로필 관리

### Phase 2: 팀
- [ ] 팀 CRUD
- [ ] 멤버 관리
- [ ] 초대 시스템
- [ ] 활동 로그

### Phase 3: 프로젝트
- [ ] 프로젝트 CRUD
- [ ] **기본 상태 자동 생성**
- [ ] 즐겨찾기

### Phase 4: 이슈
- [ ] 이슈 CRUD
- [ ] 검색/필터링
- [ ] 히스토리
- [ ] 서브태스크

### Phase 5: 칸반
- [ ] Drag & Drop
- [ ] Position 계산
- [ ] WIP Limit

### Phase 6: AI
- [ ] 요약/제안
- [ ] 자동 분류
- [ ] 중복 탐지
- [ ] 댓글 요약

### Phase 7: 댓글
- [ ] CRUD 완성

### Phase 8: 대시보드
- [ ] 개인/프로젝트/팀 대시보드
- [ ] 차트 구현

### Phase 9: 알림
- [ ] 인앱 알림
- [ ] 읽음 처리

### Phase 10: 배포
- [ ] Vercel 배포
- [ ] 환경 변수 설정

---

## ⚠️ 주요 주의사항

1. **프로젝트 생성 시 기본 상태 자동 생성** - 가장 중요!
2. **모든 쿼리에 `deleted_at IS NULL` 조건**
3. **팀 멤버십 검증** (다른 팀 데이터 접근 차단)
4. **AI 캐싱** (input_hash 기반)
5. **Rate Limiting** 적용
6. **Position 정밀도 처리**

---

## 🎯 성공 기준

8시간 내에:
1. ✅ 모든 필수 FR 구현 완료
2. ✅ 배포 완료 및 접근 가능한 URL
3. ✅ 실제 이메일 발송 작동
4. ✅ AI 기능 작동
5. ✅ Google OAuth 작동
6. ✅ Drag & Drop 작동
7. ✅ 대시보드 차트 표시

---

**다음 단계**: Phase 0부터 순차 구현 시작
