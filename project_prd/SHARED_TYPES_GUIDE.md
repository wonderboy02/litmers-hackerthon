# 공유 타입 및 유틸리티 가이드

> **Phase 1, 2, 3 구현 팀원분들을 위한 공통 파일 안내**

## 📁 생성된 공통 파일

### 1. Zod 스키마 (Validation)

모든 스키마는 `app/lib/validators/` 폴더에 있습니다.

#### 인증 관련 (Phase 1)
```typescript
// app/lib/validators/auth.schema.ts
import { signupSchema, loginSchema, ... } from '@/app/lib/validators/auth.schema'
```

**사용 가능한 스키마:**
- `signupSchema` - 회원가입
- `loginSchema` - 로그인
- `resetPasswordRequestSchema` - 비밀번호 재설정 요청
- `resetPasswordSchema` - 비밀번호 재설정
- `updateProfileSchema` - 프로필 수정
- `changePasswordSchema` - 비밀번호 변경

#### 팀 관련 (Phase 2)
```typescript
// app/lib/validators/team.schema.ts
import { createTeamSchema, ... } from '@/app/lib/validators/team.schema'
```

**사용 가능한 스키마:**
- `createTeamSchema` - 팀 생성
- `updateTeamSchema` - 팀 수정
- `inviteMemberSchema` - 멤버 초대
- `changeRoleSchema` - 역할 변경

#### 프로젝트 관련 (Phase 3)
```typescript
// app/lib/validators/project.schema.ts
import { createProjectSchema, ... } from '@/app/lib/validators/project.schema'
```

**사용 가능한 스키마:**
- `createProjectSchema` - 프로젝트 생성
- `updateProjectSchema` - 프로젝트 수정
- `createCustomStateSchema` - 커스텀 상태 생성
- `createLabelSchema` - 라벨 생성

### 2. 유틸리티 함수

모든 유틸리티는 `app/lib/utils/` 폴더에 있습니다.

#### 권한 검증 (Phase 2, 3에서 사용)
```typescript
// app/lib/utils/permissions.ts
import { hasPermission, isOwner, canKickMember } from '@/app/lib/utils/permissions'

// 사용 예시
if (hasPermission(userRole, ['OWNER', 'ADMIN'])) {
  // OWNER 또는 ADMIN만 실행 가능
}

if (canKickMember(requesterRole, targetRole)) {
  // 강제 퇴장 가능
}
```

**주요 함수:**
- `hasPermission(userRole, allowedRoles)` - 특정 역할 권한 확인
- `isOwner(role)` - OWNER 권한 확인
- `isAdminOrAbove(role)` - ADMIN 이상 권한 확인
- `canKickMember(requesterRole, targetRole)` - 강제 퇴장 가능 여부
- `canChangeRole(role)` - 역할 변경 가능 여부

#### 날짜 처리
```typescript
// app/lib/utils/date.ts
import { formatDate, isWithinDays } from '@/app/lib/utils/date'

const formatted = formatDate(new Date())  // "2025-11-29"
const isDueSoon = isWithinDays(dueDate, 7)  // 7일 이내인지 확인
```

#### 해시 함수 (AI 캐싱용)
```typescript
// app/lib/utils/hash.ts
import { sha256 } from '@/app/lib/utils/hash'

const hash = sha256(issueDescription)  // AI 캐싱에 사용
```

#### Position 계산 (Phase 3, 4에서 사용)
```typescript
// app/lib/utils/position.ts
import { calculatePosition } from '@/app/lib/utils/position'

// 기본 상태 생성 시 position 값
const backlog = { position: 1.0 }
const inProgress = { position: 2.0 }
const done = { position: 3.0 }
```

## 🔑 주요 타입 정의

### Database 타입
```typescript
// types/supabase.ts (npm run gen:types로 생성)
import { Database } from '@/types/supabase'

type User = Database['public']['Tables']['users']['Row']
type Team = Database['public']['Tables']['teams']['Row']
type Project = Database['public']['Tables']['projects']['Row']
```

### 역할 타입
```typescript
type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER'
type Priority = 'HIGH' | 'MEDIUM' | 'LOW'
```

## 📝 API Route 작성 예시

```typescript
// app/api/teams/route.ts
import { NextRequest } from 'next/server'
import { createTeamSchema } from '@/app/lib/validators/team.schema'
import { createErrorResponse } from '@/app/lib/errors'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = createTeamSchema.parse(body) // Zod 검증

    // Service 레이어 호출
    const result = await teamService.createTeam(userId, validated.name)

    return Response.json(result)
  } catch (error) {
    return createErrorResponse(error)
  }
}
```

## ⚠️ 주의사항

### Phase 2 (팀 관리)
1. **팀 생성 시 반드시 TeamMember에 OWNER 추가**
   ```typescript
   await teamMemberRepository.create(teamId, userId, 'OWNER')
   ```

2. **권한 검증 필수**
   - 모든 팀 작업 전 `teamService.verifyPermission()` 호출

### Phase 3 (프로젝트 관리)
1. **프로젝트 생성 시 기본 상태 3개 자동 생성** ⭐ 핵심!
   ```typescript
   const defaultStates = [
     { name: 'Backlog', position: 1.0, color: '#gray' },
     { name: 'In Progress', position: 2.0, color: '#blue' },
     { name: 'Done', position: 3.0, color: '#green' }
   ]

   for (const state of defaultStates) {
     await supabase.from('project_states').insert({
       project_id: projectId,
       ...state
     })
   }
   ```

2. **프로젝트 개수 제한 (팀당 최대 15개)**
   ```typescript
   const { count } = await supabase
     .from('projects')
     .select('*', { count: 'exact', head: true })
     .eq('team_id', teamId)
     .is('deleted_at', null)

   if (count >= 15) throw new ValidationError('팀당 최대 15개 프로젝트')
   ```

## 🔗 연동 포인트

### Phase 1 → Phase 2
- `userRepository.findById(userId)` - 사용자 조회
- 팀 생성 시 `ownerId`에 현재 사용자 ID 사용

### Phase 2 → Phase 3
- `teamService.verifyMembership()` - 프로젝트 접근 전 팀 멤버십 확인
- 프로젝트 생성 시 `teamId` 필수

### Phase 3 → Phase 4
- `project_states` 테이블의 ID를 `issues.state_id`에서 참조
- 이슈 생성 시 기본 상태는 "Backlog" (첫 번째 상태)

## 📚 참고 문서

- **DB 스키마**: `project_prd/DB_SCHEMA.md`
- **구현 계획**: `project_prd/IMPLEMENTATION_PLAN.md`
- **체크리스트**: `project_prd/CHECKLIST.md`
- **PRD**: `project_prd/PRD_KR_VER.md`

---

**질문이 있으면 언제든 물어보세요!**
