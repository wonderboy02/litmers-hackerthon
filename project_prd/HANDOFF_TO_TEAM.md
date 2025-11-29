# 📬 팀원 전달 사항

> **작성일**: 2025-11-29
> **작성자**: Claude (Phase 4~7 구현 담당)
> **대상**: Phase 1, 2, 3 구현 팀원

---

## 🎯 요약

Phase 4 (이슈 관리), Phase 5 (칸반 보드), Phase 6 (AI 기능), Phase 7 (댓글 시스템)의 백엔드 로직과 프론트엔드 Hook이 **모두 완료**되었습니다.

팀원분들이 **Phase 1 (인증), Phase 2 (팀 관리), Phase 3 (프로젝트 관리)**를 구현하시면 전체 시스템이 완성됩니다.

필요한 **공통 타입, 스키마, 유틸리티**는 모두 준비되어 있으니 바로 사용하시면 됩니다.

---

## 📦 제공된 공통 파일 (즉시 사용 가능)

### 1. Zod Validation 스키마

| 파일 경로 | 용도 | Phase |
|-----------|------|-------|
| `app/lib/validators/auth.schema.ts` | 회원가입, 로그인, 비밀번호 재설정 등 | Phase 1 |
| `app/lib/validators/team.schema.ts` | 팀 생성, 멤버 초대, 역할 변경 등 | Phase 2 |
| `app/lib/validators/project.schema.ts` | 프로젝트 생성, 상태 관리, 라벨 관리 등 | Phase 3 |
| `app/lib/validators/issue.schema.ts` | 이슈 CRUD, 필터링, 서브태스크 등 | Phase 4 (완료) |

**사용 예시**:
```typescript
import { signupSchema } from '@/app/lib/validators/auth.schema'

const validated = signupSchema.parse(body) // Zod 검증
```

### 2. 유틸리티 함수

| 파일 경로 | 주요 함수 | 사용처 |
|-----------|-----------|--------|
| `app/lib/utils/hash.ts` | `sha256()` | AI 캐싱용 해시 생성 |
| `app/lib/utils/date.ts` | `formatDate()`, `isWithinDays()` | 날짜 포맷팅, 마감일 체크 |
| `app/lib/utils/permissions.ts` | `hasPermission()`, `canKickMember()` | 팀 권한 검증 |
| `app/lib/utils/position.ts` | `calculatePosition()` | 칸반 보드 position 계산 |

**사용 예시**:
```typescript
import { hasPermission } from '@/app/lib/utils/permissions'

if (hasPermission(userRole, ['OWNER', 'ADMIN'])) {
  // OWNER 또는 ADMIN만 실행 가능한 로직
}
```

### 3. 참고 문서

| 문서 경로 | 내용 |
|-----------|------|
| `project_prd/SHARED_TYPES_GUIDE.md` | **공유 타입 사용 가이드** (필독!) |
| `project_prd/DEVELOPMENT_STATUS.md` | 전체 개발 진행 상황 |
| `project_prd/IMPLEMENTATION_PLAN.md` | Phase별 구현 계획 |
| `project_prd/DB_SCHEMA.md` | 데이터베이스 스키마 명세 |

---

## 🚨 핵심 주의사항 (반드시 확인!)

### Phase 1 (인증 시스템)

**파일 구조**:
```
app/lib/repositories/user.repository.ts
app/lib/services/auth.service.ts
app/api/auth/signup/route.ts
app/api/auth/login/route.ts
app/api/auth/logout/route.ts
app/api/auth/reset-password/route.ts
app/api/auth/profile/route.ts
app/lib/hooks/useAuth.ts
```

**주의사항**:
- Supabase Auth를 사용하므로 비밀번호는 Supabase가 관리
- `public.users` 테이블에는 프로필 정보만 저장
- Google OAuth 사용자는 `google_id` 필드 사용

---

### Phase 2 (팀 관리)

**파일 구조**:
```
app/lib/repositories/team.repository.ts
app/lib/services/team.service.ts
app/api/teams/route.ts
app/api/teams/[teamId]/route.ts
app/api/teams/[teamId]/members/route.ts
app/api/teams/[teamId]/invite/route.ts
app/lib/hooks/useTeams.ts
```

**⚠️ 중요 주의사항**:

1. **팀 생성 시 반드시 TeamMember에 OWNER 추가**:
   ```typescript
   // 팀 생성 후 즉시 실행
   await teamMemberRepository.create(teamId, userId, 'OWNER')
   ```

2. **권한 검증 필수**:
   ```typescript
   // 모든 팀 작업 전에 호출
   await teamService.verifyPermission(teamId, userId, ['OWNER', 'ADMIN'])
   ```

3. **이메일 발송**:
   - 팀 초대 시 실제 이메일 발송 필요
   - `sendTeamInvitationEmail()` 함수 사용 (이미 구현됨)

---

### Phase 3 (프로젝트 관리)

**파일 구조**:
```
app/lib/repositories/project.repository.ts
app/lib/services/project.service.ts
app/api/projects/route.ts
app/api/projects/[projectId]/route.ts
app/api/projects/[projectId]/states/route.ts
app/lib/hooks/useProjects.ts
```

**⚠️ 가장 중요한 주의사항** ⭐:

**프로젝트 생성 시 기본 상태 3개 자동 생성** (필수!):
```typescript
// app/lib/services/project.service.ts

async createProject(teamId: string, userId: string, data: { name: string; description?: string }) {
  // 1. 프로젝트 생성
  const project = await projectRepository.create({
    team_id: teamId,
    owner_id: userId,
    name: data.name,
    description: data.description
  })

  // 2. ✅ 기본 상태 3개 자동 생성 (핵심!)
  const defaultStates = [
    { name: 'Backlog', position: 1.0, color: '#gray' },
    { name: 'In Progress', position: 2.0, color: '#blue' },
    { name: 'Done', position: 3.0, color: '#green' }
  ]

  for (const state of defaultStates) {
    await supabase.from('project_states').insert({
      project_id: project.id,
      name: state.name,
      position: state.position,
      color: state.color
    })
  }

  return project
}
```

**이 작업을 빠뜨리면 칸반 보드가 작동하지 않습니다!**

**추가 제한 사항**:
```typescript
// 팀당 최대 15개 프로젝트 제한
const { count } = await supabase
  .from('projects')
  .select('*', { count: 'exact', head: true })
  .eq('team_id', teamId)
  .is('deleted_at', null)

if (count >= 15) {
  throw new ValidationError('팀당 최대 15개 프로젝트만 생성 가능합니다')
}
```

---

## 📋 구현 가이드

### 1. Repository 레이어 작성 패턴

```typescript
// app/lib/repositories/user.repository.ts

import { supabase } from '@/app/lib/supabase'
import { Database } from '@/types/supabase'

type User = Database['public']['Tables']['users']['Row']

export const userRepository = {
  async findById(id: string): Promise<User | null> {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)  // ⚠️ Soft Delete 필터 필수
      .single()

    return data
  },

  // ... 다른 메서드
}
```

### 2. Service 레이어 작성 패턴

```typescript
// app/lib/services/auth.service.ts

import { userRepository } from '@/app/lib/repositories/user.repository'
import { ValidationError } from '@/app/lib/errors'

export const authService = {
  async signup(email: string, password: string, name: string) {
    // 1. 검증
    const existing = await userRepository.findByEmail(email)
    if (existing) {
      throw new ValidationError('이미 사용 중인 이메일입니다')
    }

    // 2. Supabase Auth 회원가입
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })

    if (error) throw new Error(error.message)

    // 3. public.users 테이블에 프로필 생성
    await userRepository.create({
      id: authData.user!.id,
      email,
      name
    })

    return authData
  }
}
```

### 3. API Route 작성 패턴

```typescript
// app/api/auth/signup/route.ts

import { NextRequest } from 'next/server'
import { authService } from '@/app/lib/services/auth.service'
import { signupSchema } from '@/app/lib/validators/auth.schema'
import { createErrorResponse } from '@/app/lib/errors'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = signupSchema.parse(body)  // Zod 검증

    const result = await authService.signup(
      validated.email,
      validated.password,
      validated.name
    )

    return Response.json(result)
  } catch (error) {
    return createErrorResponse(error)  // 통일된 에러 응답
  }
}
```

### 4. React Query Hook 작성 패턴

```typescript
// app/lib/hooks/useAuth.ts

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/app/lib/toast'

export function useAuth() {
  const queryClient = useQueryClient()

  const signupMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; name: string }) => {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('회원가입 실패')
      return res.json()
    },
    onSuccess: () => {
      toast.success('회원가입이 완료되었습니다')
    },
    onError: () => {
      toast.error('회원가입에 실패했습니다')
    }
  })

  return { signup: signupMutation.mutate }
}
```

---

## 🔗 Phase 간 연동 포인트

### Phase 1 → Phase 2
```typescript
// 팀 생성 시 현재 사용자 ID 사용
const user = await userRepository.findById(userId)
const team = await teamRepository.create({
  name: '팀 이름',
  owner_id: user.id  // Phase 1에서 생성된 사용자 ID
})
```

### Phase 2 → Phase 3
```typescript
// 프로젝트 생성 전 팀 멤버십 확인
await teamService.verifyMembership(teamId, userId)

const project = await projectRepository.create({
  team_id: teamId,  // Phase 2에서 생성된 팀 ID
  owner_id: userId,
  name: '프로젝트 이름'
})
```

### Phase 3 → Phase 4 (이미 구현됨)
```typescript
// 이슈 생성 시 프로젝트의 기본 상태(Backlog) 사용
const { data: states } = await supabase
  .from('project_states')
  .select('id')
  .eq('project_id', projectId)
  .order('position', { ascending: true })
  .limit(1)

const issue = await issueRepository.create({
  project_id: projectId,
  state_id: states[0].id  // Phase 3에서 생성된 첫 번째 상태(Backlog)
})
```

---

## ✅ 구현 완료 확인 체크리스트

### Phase 1 (인증)
- [ ] 회원가입 API 작동 확인
- [ ] 로그인 API 작동 확인
- [ ] Google OAuth 작동 확인
- [ ] 비밀번호 재설정 이메일 발송 확인
- [ ] 프로필 수정 작동 확인

### Phase 2 (팀 관리)
- [ ] 팀 생성 시 TeamMember에 OWNER 추가 확인
- [ ] 팀 멤버 초대 이메일 발송 확인
- [ ] 역할 변경 작동 확인
- [ ] 강제 퇴장 권한 검증 확인
- [ ] 팀 활동 로그 기록 확인

### Phase 3 (프로젝트 관리)
- [ ] **프로젝트 생성 시 기본 상태 3개 자동 생성 확인** ⭐ 가장 중요!
- [ ] 프로젝트당 15개 제한 작동 확인
- [ ] 즐겨찾기 기능 작동 확인
- [ ] 프로젝트 아카이브 작동 확인

---

## 🐛 문제 발생 시 확인 사항

### 1. 타입 에러 발생 시
```bash
# Supabase 타입 재생성
npm run gen:types
```

### 2. 공통 함수 사용법 확인
- `project_prd/SHARED_TYPES_GUIDE.md` 참고
- 모든 스키마와 유틸리티의 사용 예시가 포함되어 있습니다

### 3. DB 스키마 확인
- `project_prd/DB_SCHEMA.md` 참고
- 테이블 관계, 제약 조건, 인덱스 정보 확인

### 4. 구현 참고
- Phase 4~7 코드를 참고하여 동일한 패턴 사용
- Repository → Service → API Route → Hook 순서로 작성

---

## 📞 질문/문의

구현 중 궁금한 사항이 있으면:
1. `SHARED_TYPES_GUIDE.md` 먼저 확인
2. Phase 4~7 코드 참고
3. `DEVELOPMENT_STATUS.md`에서 전체 구조 확인

---

## 🎯 최종 목표

Phase 1, 2, 3를 완료하시면:
- ✅ 사용자 인증 시스템
- ✅ 팀 관리 시스템
- ✅ 프로젝트 관리 시스템
- ✅ 이슈 관리 시스템 (완료)
- ✅ 칸반 보드 (완료)
- ✅ AI 기능 (완료)
- ✅ 댓글 시스템 (완료)

**모든 핵심 기능이 완성되어 바로 테스트 가능합니다!**

---

**작업 화이팅! 🚀**
