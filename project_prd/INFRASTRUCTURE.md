# 인프라 구축 문서

Unlooped MVP 프로젝트의 인프라 레이어에 대한 설명입니다.

## 📦 설치된 패키지

### 핵심 인프라 패키지
- **resend**: 이메일 발송 (비밀번호 재설정, 팀 초대)
- **@anthropic-ai/sdk**: Claude AI API 클라이언트
- **@hello-pangea/dnd**: Drag & Drop (칸반 보드)
- **recharts**: 차트/시각화 (대시보드)
- **sonner**: 토스트 알림 UI
- **date-fns**: 날짜 포맷팅
- **zod**: 스키마 밸리데이션

## 🏗️ 구축된 인프라

### 1. 이메일 발송 시스템 (`app/lib/email.ts`)

**목적**: FR-003(비밀번호 재설정), FR-013(팀 초대) 이메일 발송

**주요 함수**:
- `sendPasswordResetEmail()`: 비밀번호 재설정 이메일
- `sendTeamInvitationEmail()`: 팀 초대 이메일

**환경 변수**:
```env
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=Unlooped <noreply@unlooped.app>
```

**사용 예시**:
```typescript
import { sendPasswordResetEmail } from '@/app/lib/email'

await sendPasswordResetEmail(
  'user@example.com',
  'reset-token-123',
  'John Doe'
)
```

---

### 2. AI API 클라이언트 (`app/lib/ai.ts`)

**목적**: FR-040~045 AI 기능 구현

**주요 함수**:
- `generateIssueSummary()`: 이슈 설명 요약 (FR-040)
- `generateIssueSuggestion()`: 해결 전략 제안 (FR-041)
- `recommendLabels()`: 라벨 자동 추천 (FR-043)
- `detectDuplicateIssues()`: 중복 이슈 탐지 (FR-044)
- `summarizeComments()`: 댓글 요약 (FR-045)

**환경 변수**:
```env
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

**사용 예시**:
```typescript
import { generateIssueSummary } from '@/app/lib/ai'

const summary = await generateIssueSummary(issueDescription)
```

**제약 사항**:
- 설명이 10자 이하이면 AI 기능 실행 불가
- 댓글 요약은 5개 이상일 때만 가능
- Rate Limiting 적용 필수

---

### 3. Rate Limiting (`app/lib/rate-limit.ts`)

**목적**: FR-042 AI API 호출 제한

**제한 정책**:
- 분당 10회
- 일당 100회

**주요 함수**:
- `checkAIRateLimit()`: Rate Limit 체크 및 카운트 증가
- `getAIRateLimitStatus()`: 현재 상태 조회 (카운트 증가 없음)
- `cleanupExpiredRateLimits()`: 만료된 항목 정리

**사용 예시**:
```typescript
import { checkAIRateLimit } from '@/app/lib/rate-limit'

const result = checkAIRateLimit(userId)
if (!result.allowed) {
  throw new Error(result.error)
}
```

**참고**:
- 현재는 메모리 기반 저장소 사용
- 프로덕션에서는 Redis나 DB 사용 권장

---

### 4. Supabase Storage (`app/lib/storage.ts`)

**목적**: FR-005 프로필 이미지 업로드/관리

**주요 함수**:
- `uploadProfileImage()`: 프로필 이미지 업로드
- `deleteProfileImage()`: 기존 이미지 삭제
- `getProfileImageUrl()`: Public URL 가져오기
- `validateImageFile()`: 클라이언트 사이드 검증
- `fileToBase64()`: 미리보기용 Base64 변환

**제약 사항**:
- 허용 파일 타입: JPG, PNG, WebP, GIF
- 최대 파일 크기: 5MB
- 버킷 이름: `avatars`

**Supabase Dashboard 설정**:
1. Storage → Create Bucket
2. 버킷 이름: `avatars`
3. Public 설정: ✅

**사용 예시**:
```typescript
import { uploadProfileImage } from '@/app/lib/storage'

const { publicUrl } = await uploadProfileImage(userId, file)
```

---

### 5. 전역 에러 핸들링 (`app/lib/errors.ts`, `app/components/ErrorBoundary.tsx`)

**목적**: 일관된 에러 처리 및 사용자 친화적 메시지

**커스텀 에러 클래스**:
- `AppError`: 기본 애플리케이션 에러
- `AuthError`: 인증 에러 (401)
- `ForbiddenError`: 권한 에러 (403)
- `NotFoundError`: 리소스 없음 (404)
- `ValidationError`: 입력값 검증 에러 (400)
- `RateLimitError`: Rate Limit 초과 (429)

**주요 함수**:
- `handleSupabaseError()`: Supabase 에러 변환
- `getErrorMessage()`: 사용자 친화적 메시지 추출
- `createErrorResponse()`: API 에러 응답 생성
- `logError()`: 에러 로깅 (Sentry 연동 준비)

**ErrorBoundary 사용**:
```tsx
import { ErrorBoundary } from '@/app/components/ErrorBoundary'

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

---

### 6. 토스트 시스템 (`app/lib/toast.ts`, `app/providers/ToastProvider.tsx`)

**목적**: 일관된 사용자 피드백

**주요 함수**:
```typescript
import { toast } from '@/app/lib/toast'

// 성공
toast.success('저장되었습니다')

// 에러
toast.error(error, '저장에 실패했습니다')

// 경고
toast.warning('주의하세요')

// 정보
toast.info('안내 메시지')

// 로딩
const toastId = toast.loading('처리 중...')
toast.dismiss(toastId)

// Promise 기반
toast.promise(apiCall(), {
  loading: '처리 중...',
  success: '완료!',
  error: '실패했습니다',
})
```

**Provider 설정**:
```tsx
// app/layout.tsx
import { ToastProvider } from '@/app/providers/ToastProvider'

<ToastProvider />
```

---

### 7. 알림 시스템 (`app/lib/notifications.ts`)

**목적**: FR-090, FR-091 인앱 알림

**알림 타입**:
- `ISSUE_ASSIGNED`: 이슈 담당자 지정
- `ISSUE_COMMENTED`: 이슈 댓글 작성
- `DUE_DATE_APPROACHING`: 마감일 임박 (1일 전)
- `DUE_DATE_TODAY`: 마감일 당일
- `TEAM_INVITED`: 팀 초대
- `ROLE_CHANGED`: 역할 변경

**주요 함수**:
- `getNotificationMessage()`: 알림 메시지 템플릿
- `getNotificationIcon()`: 알림 아이콘 및 색상

**사용 예시**:
```typescript
import { getNotificationMessage, NotificationType } from '@/app/lib/notifications'

const { title, message } = getNotificationMessage(
  NotificationType.ISSUE_ASSIGNED,
  { actorName: 'John', issueName: 'Bug Fix' }
)
```

---

## 🔧 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xlovwwdppjfsbuzibctk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=Unlooped <noreply@unlooped.app>

# AI (Anthropic Claude)
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

`.env.local.example` 파일을 참고하세요.

---

## 📝 다음 단계

인프라가 모두 갖춰졌으니 다음 단계는:

1. **DB 스키마 적용**: Supabase 마이그레이션 실행
2. **비즈니스 로직 구현**: 팀, 프로젝트, 이슈 CRUD
3. **UI 컴포넌트 개발**: 칸반 보드, 대시보드 등
4. **API Routes 구현**: Next.js App Router API
5. **테스트 및 배포**

---

## ⚠️ 주의사항

### Supabase Storage 버킷
- Dashboard에서 `avatars` 버킷을 수동으로 생성해야 합니다
- Public 접근 설정 필수

### Rate Limiting
- 현재는 메모리 기반이므로 서버 재시작 시 초기화됩니다
- 프로덕션에서는 Redis 또는 DB 기반으로 전환 필요

### 이메일 발송
- Resend API Key 발급 필요: https://resend.com
- 발신 도메인 인증 권장 (프로덕션)

### AI API
- Anthropic API Key 발급: https://console.anthropic.com
- 비용 발생에 주의 (사용량 모니터링 권장)

---

## 📚 추가 리소스

- [Resend 문서](https://resend.com/docs)
- [Anthropic Claude API 문서](https://docs.anthropic.com)
- [Sonner 문서](https://sonner.emilkowal.ski)
- [Supabase Storage 문서](https://supabase.com/docs/guides/storage)
