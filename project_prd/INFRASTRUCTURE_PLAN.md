# 인프라 구축 세부 계획

> **목표**: PRD 기반 비즈니스 로직 구현 전 필수 인프라 완성
> **총 예상 시간**: 2~3시간
> **마지막 업데이트**: 2025-11-29

---

## 📊 우선순위 분류 체계

| 우선순위 | 설명 | 시간대 | 비고 |
|---------|------|--------|------|
| **P0** | 프로젝트 시작 전 필수 | 0~30분 | 모든 기능의 선행 조건 |
| **P1** | 핵심 기능 구현에 필수 | 30분~2시간 | FR 요구사항 직접 연관 |
| **P2** | 사용자 경험 향상 | 2~3시간 | 가산점 요소 |

---

## 🎯 P0: 최우선 항목 (0~30분)

### ✅ 1. npm 패키지 설치

**목적**: 프로젝트 전체 기능 구현에 필요한 라이브러리 설치

**설치 패키지 목록**:

```bash
npm install \
  resend \
  @anthropic-ai/sdk \
  @hello-pangea/dnd \
  recharts \
  sonner \
  date-fns \
  zod \
  nanoid \
  bcryptjs
```

```bash
npm install -D \
  @types/bcryptjs
```

**패키지별 용도**:

| 패키지 | 용도 | 관련 FR |
|--------|------|---------|
| `resend` | 이메일 발송 (비밀번호 재설정, 팀 초대) | FR-003, FR-013 |
| `@anthropic-ai/sdk` | Claude AI API (요약, 제안, 자동분류) | FR-040~045 |
| `@hello-pangea/dnd` | Drag & Drop (칸반 보드) | FR-051, FR-052 |
| `recharts` | 대시보드 차트/시각화 | FR-080~082 |
| `sonner` | 토스트 알림 UI | FR-090~091 |
| `date-fns` | 날짜 포맷팅 (마감일, 알림) | 전역 유틸 |
| `zod` | 스키마 밸리데이션 | 전역 밸리데이션 |
| `nanoid` | 짧은 고유 ID 생성 (토큰) | FR-003, FR-013 |
| `bcryptjs` | 비밀번호 해싱 (백업용) | FR-001 |

**예상 시간**: 5분

**검증 방법**:
```bash
npm list resend @anthropic-ai/sdk @hello-pangea/dnd recharts sonner
```

**체크리스트**:
- [ ] 모든 패키지 설치 완료
- [ ] package.json에 버전 기록 확인
- [ ] TypeScript 타입 정의 설치 확인

---

### ✅ 2. 환경 변수 설정

**목적**: API 키 및 민감 정보 관리

**필요한 환경 변수**:

```env
# .env.local

# Supabase (이미 설정됨)
NEXT_PUBLIC_SUPABASE_URL=https://xlovwwdppjfsbuzibctk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Resend (이메일)
RESEND_API_KEY=re_xxxxxxxxx

# Anthropic (AI)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxx

# Google OAuth (Supabase Dashboard에서 설정)
# - Supabase Auth에서 Google Provider 활성화
# - Google Cloud Console에서 OAuth 2.0 클라이언트 ID 발급
# - Redirect URI: https://xlovwwdppjfsbuzibctk.supabase.co/auth/v1/callback

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**설정 순서**:

1. **Resend API Key 발급**:
   - https://resend.com/signup 가입
   - API Keys 메뉴에서 키 생성
   - `.env.local`에 `RESEND_API_KEY` 추가

2. **Anthropic API Key 발급**:
   - https://console.anthropic.com/ 가입
   - API Keys 생성
   - `.env.local`에 `ANTHROPIC_API_KEY` 추가

3. **Google OAuth 설정**:
   - Supabase Dashboard → Authentication → Providers → Google 활성화
   - Google Cloud Console에서 OAuth 클라이언트 ID 생성
   - Redirect URI 설정

**예상 시간**: 15분

**검증 방법**:
```typescript
// app/api/test-env/route.ts
export async function GET() {
  return Response.json({
    resend: !!process.env.RESEND_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL
  })
}
```

**체크리스트**:
- [ ] `.env.local` 파일 생성
- [ ] 모든 API 키 발급 및 설정
- [ ] `.gitignore`에 `.env.local` 포함 확인
- [ ] 환경 변수 로드 테스트

---

### ✅ 3. Supabase 데이터베이스 스키마 마이그레이션

**목적**: DB_SCHEMA.md 기반으로 실제 테이블 생성

**실행 방법**:

**Option 1: Supabase Dashboard (권장 - 빠름)**
1. Supabase Dashboard → SQL Editor
2. `project_prd/DB_SCHEMA.md`의 SQL 스크립트 복사
3. 실행

**Option 2: 로컬 Supabase CLI (시간 많을 때)**
```bash
npx supabase init
npx supabase link --project-ref xlovwwdppjfsbuzibctk
npx supabase db push
```

**타입 파일 생성**:
```bash
npm run gen:types
```

**예상 시간**: 10분

**검증 방법**:
- Supabase Dashboard → Table Editor에서 테이블 확인
- `types/supabase.ts` 파일 생성 확인

**체크리스트**:
- [ ] 모든 테이블 생성 완료
- [ ] FK 제약조건 확인
- [ ] RLS 정책 설정 (선택)
- [ ] TypeScript 타입 파일 생성

---

## 🚀 P1: 핵심 필수 항목 (30분~2시간)

### ✅ 4. 이메일 발송 시스템

**목적**: 비밀번호 재설정, 팀 초대 이메일 발송 (FR-003, FR-013)

**폴더 구조**:
```
app/
└── lib/
    ├── email/
    │   ├── client.ts          # Resend 클라이언트
    │   ├── templates/
    │   │   ├── password-reset.tsx
    │   │   └── team-invitation.tsx
    │   └── send.ts            # 이메일 발송 유틸
```

**구현 파일**:

**1) `app/lib/email/client.ts`**:
```typescript
import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set')
}

export const resend = new Resend(process.env.RESEND_API_KEY)
```

**2) `app/lib/email/templates/password-reset.tsx`**:
```typescript
import * as React from 'react'

interface PasswordResetEmailProps {
  resetLink: string
  userName: string
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  resetLink,
  userName
}) => (
  <div>
    <h1>비밀번호 재설정</h1>
    <p>안녕하세요, {userName}님</p>
    <p>아래 링크를 클릭하여 비밀번호를 재설정하세요:</p>
    <a href={resetLink}>{resetLink}</a>
    <p>이 링크는 1시간 후 만료됩니다.</p>
  </div>
)
```

**3) `app/lib/email/templates/team-invitation.tsx`**:
```typescript
import * as React from 'react'

interface TeamInvitationEmailProps {
  inviteLink: string
  teamName: string
  inviterName: string
}

export const TeamInvitationEmail: React.FC<TeamInvitationEmailProps> = ({
  inviteLink,
  teamName,
  inviterName
}) => (
  <div>
    <h1>팀 초대</h1>
    <p>{inviterName}님이 {teamName} 팀에 초대했습니다.</p>
    <a href={inviteLink}>초대 수락하기</a>
    <p>이 초대는 7일 후 만료됩니다.</p>
  </div>
)
```

**4) `app/lib/email/send.ts`**:
```typescript
import { resend } from './client'
import { PasswordResetEmail } from './templates/password-reset'
import { TeamInvitationEmail } from './templates/team-invitation'

export async function sendPasswordResetEmail(
  to: string,
  userName: string,
  token: string
) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

  await resend.emails.send({
    from: 'Unlooped <noreply@yourdomain.com>',
    to,
    subject: '비밀번호 재설정 요청',
    react: PasswordResetEmail({ resetLink, userName })
  })
}

export async function sendTeamInvitationEmail(
  to: string,
  teamName: string,
  inviterName: string,
  token: string
) {
  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${token}`

  await resend.emails.send({
    from: 'Unlooped <noreply@yourdomain.com>',
    to,
    subject: `${teamName} 팀 초대`,
    react: TeamInvitationEmail({ inviteLink, teamName, inviterName })
  })
}
```

**예상 시간**: 30분

**검증 방법**:
```typescript
// app/api/test-email/route.ts
import { sendPasswordResetEmail } from '@/app/lib/email/send'

export async function GET() {
  await sendPasswordResetEmail('test@example.com', 'Test User', 'test-token')
  return Response.json({ success: true })
}
```

**체크리스트**:
- [ ] Resend 클라이언트 설정
- [ ] 이메일 템플릿 2개 작성
- [ ] 발송 유틸 함수 작성
- [ ] 테스트 이메일 발송 성공

---

### ✅ 5. AI API 클라이언트

**목적**: Claude AI 요약, 제안, 자동분류 기능 (FR-040~045)

**폴더 구조**:
```
app/
└── lib/
    ├── ai/
    │   ├── client.ts          # Anthropic 클라이언트
    │   ├── prompts.ts         # 프롬프트 템플릿
    │   ├── cache.ts           # AI 캐싱 로직
    │   └── rate-limit.ts      # Rate Limiting
```

**구현 파일**:

**1) `app/lib/ai/client.ts`**:
```typescript
import Anthropic from '@anthropic-ai/sdk'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set')
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function callClaude(prompt: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }]
  })

  const content = message.content[0]
  return content.type === 'text' ? content.text : ''
}
```

**2) `app/lib/ai/prompts.ts`**:
```typescript
export const AI_PROMPTS = {
  summary: (description: string) => `
다음 이슈 설명을 2~4문장으로 요약해주세요:

${description}

요약:`,

  suggestion: (title: string, description: string) => `
다음 이슈를 해결하기 위한 접근 방식을 3~5개의 단계로 제안해주세요:

제목: ${title}
설명: ${description}

제안:`,

  labelSuggestion: (title: string, description: string, labels: string[]) => `
다음 이슈에 적합한 라벨을 최대 3개 선택해주세요:

제목: ${title}
설명: ${description}

사용 가능한 라벨: ${labels.join(', ')}

추천 라벨 (JSON 배열로 반환):`,

  duplicateDetection: (title: string, existingTitles: string[]) => `
다음 이슈 제목이 기존 이슈와 유사한지 판단해주세요:

새 이슈: ${title}

기존 이슈:
${existingTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}

유사한 이슈가 있다면 번호를 JSON 배열로 반환하세요. 없으면 빈 배열 []:`,

  commentSummary: (comments: Array<{ author: string; content: string }>) => `
다음 댓글들의 논의 내용을 3~5문장으로 요약해주세요:

${comments.map((c, i) => `${i + 1}. ${c.author}: ${c.content}`).join('\n\n')}

요약:`
} as const
```

**3) `app/lib/ai/cache.ts`**:
```typescript
import crypto from 'crypto'
import { supabase } from '@/app/lib/supabase'

export function generateHash(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex')
}

export async function getAICache(
  issueId: string,
  featureType: 'SUMMARY' | 'SUGGESTION',
  inputHash: string
) {
  const { data } = await supabase
    .from('ai_caches')
    .select('output_text')
    .eq('issue_id', issueId)
    .eq('feature_type', featureType)
    .eq('input_hash', inputHash)
    .single()

  return data?.output_text || null
}

export async function setAICache(
  issueId: string,
  featureType: 'SUMMARY' | 'SUGGESTION',
  inputHash: string,
  outputText: string
) {
  await supabase.from('ai_caches').insert({
    issue_id: issueId,
    feature_type: featureType,
    input_hash: inputHash,
    output_text: outputText
  })
}
```

**4) `app/lib/ai/rate-limit.ts`**:
```typescript
import { supabase } from '@/app/lib/supabase'

export async function checkRateLimit(userId: string): Promise<boolean> {
  const now = new Date()

  // 분당 10회 제한
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
  const { count: minuteCount } = await supabase
    .from('ai_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneMinuteAgo.toISOString())

  if (minuteCount && minuteCount >= 10) {
    throw new Error('분당 최대 10회 요청 가능합니다')
  }

  // 일당 100회 제한
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const { count: dayCount } = await supabase
    .from('ai_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneDayAgo.toISOString())

  if (dayCount && dayCount >= 100) {
    throw new Error('일일 최대 100회 요청 가능합니다')
  }

  return true
}

export async function logAIUsage(userId: string) {
  await supabase.from('ai_usage_logs').insert({ user_id: userId })
}
```

**예상 시간**: 40분

**검증 방법**:
```typescript
// app/api/test-ai/route.ts
import { callClaude } from '@/app/lib/ai/client'
import { AI_PROMPTS } from '@/app/lib/ai/prompts'

export async function GET() {
  const result = await callClaude(AI_PROMPTS.summary('테스트 설명입니다.'))
  return Response.json({ result })
}
```

**체크리스트**:
- [ ] Anthropic 클라이언트 설정
- [ ] 5개 프롬프트 템플릿 작성
- [ ] AI 캐싱 로직 구현
- [ ] Rate Limiting 구현
- [ ] 테스트 호출 성공

---

### ✅ 6. Google OAuth 설정

**목적**: Google 계정 로그인 (FR-004)

**설정 단계**:

**1) Google Cloud Console 설정**:
1. https://console.cloud.google.com/ 접속
2. 새 프로젝트 생성 (Unlooped MVP)
3. APIs & Services → Credentials
4. OAuth 2.0 클라이언트 ID 생성
5. Authorized redirect URIs 추가:
   ```
   https://xlovwwdppjfsbuzibctk.supabase.co/auth/v1/callback
   ```

**2) Supabase Dashboard 설정**:
1. Authentication → Providers → Google
2. Enabled 체크
3. Client ID, Client Secret 입력 (Google Console에서 복사)

**3) 프론트엔드 로그인 버튼**:
```typescript
// app/components/GoogleLoginButton.tsx
'use client'

import { supabase } from '@/app/lib/supabase'

export function GoogleLoginButton() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  return (
    <button onClick={handleGoogleLogin}>
      Google로 로그인
    </button>
  )
}
```

**4) OAuth 콜백 라우트**:
```typescript
// app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

**예상 시간**: 20분

**검증 방법**:
- Google 로그인 버튼 클릭 → Google 계정 선택 → 대시보드 리다이렉트

**체크리스트**:
- [ ] Google Cloud Console OAuth 설정
- [ ] Supabase Provider 활성화
- [ ] 로그인 버튼 구현
- [ ] 콜백 라우트 구현
- [ ] 실제 로그인 테스트

---

### ✅ 7. 전역 에러 핸들링 시스템

**목적**: 일관된 에러 처리 및 사용자 피드백

**폴더 구조**:
```
app/
├── components/
│   └── ErrorBoundary.tsx
└── lib/
    ├── errors/
    │   ├── types.ts           # 커스텀 에러 클래스
    │   └── handler.ts         # 에러 핸들러
```

**구현 파일**:

**1) `app/lib/errors/types.ts`**:
```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = '인증이 필요합니다') {
    super(message, 'AUTHENTICATION_ERROR', 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = '권한이 없습니다') {
    super(message, 'FORBIDDEN_ERROR', 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = '리소스를 찾을 수 없습니다') {
    super(message, 'NOT_FOUND_ERROR', 404)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string) {
    super(message, 'RATE_LIMIT_ERROR', 429)
  }
}
```

**2) `app/lib/errors/handler.ts`**:
```typescript
import { AppError } from './types'
import { toast } from 'sonner'

export function handleError(error: unknown) {
  console.error(error)

  if (error instanceof AppError) {
    toast.error(error.message)
    return
  }

  if (error instanceof Error) {
    toast.error(error.message)
    return
  }

  toast.error('알 수 없는 오류가 발생했습니다')
}

export function handleAPIError(error: unknown) {
  if (error instanceof AppError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }

  return Response.json(
    { error: '서버 오류가 발생했습니다' },
    { status: 500 }
  )
}
```

**3) `app/components/ErrorBoundary.tsx`**:
```typescript
'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>문제가 발생했습니다</h1>
          <button onClick={() => this.setState({ hasError: false })}>
            다시 시도
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

**예상 시간**: 20분

**체크리스트**:
- [ ] 커스텀 에러 클래스 5개 작성
- [ ] 에러 핸들러 유틸 작성
- [ ] ErrorBoundary 컴포넌트 작성
- [ ] Root Layout에 ErrorBoundary 적용

---

## 🎨 P2: 사용자 경험 향상 항목 (2~3시간)

### ✅ 8. 토스트/알림 UI 시스템

**목적**: 사용자 피드백 및 알림 표시 (FR-090~091)

**설정 파일**:

**1) `app/providers/ToastProvider.tsx`**:
```typescript
'use client'

import { Toaster } from 'sonner'

export function ToastProvider() {
  return <Toaster position="top-right" richColors />
}
```

**2) `app/layout.tsx` 수정**:
```typescript
import { ToastProvider } from './providers/ToastProvider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}
```

**3) 사용 예시**:
```typescript
import { toast } from 'sonner'

// 성공
toast.success('이슈가 생성되었습니다')

// 에러
toast.error('권한이 없습니다')

// 로딩
const toastId = toast.loading('처리 중...')
// ... 작업 완료 후
toast.success('완료되었습니다', { id: toastId })
```

**예상 시간**: 10분

**체크리스트**:
- [ ] Toaster 컴포넌트 설정
- [ ] Root Layout에 적용
- [ ] 테스트 토스트 표시

---

### ✅ 9. Supabase Storage (프로필 이미지)

**목적**: 프로필 이미지 업로드 (FR-005)

**설정 단계**:

**1) Supabase Dashboard에서 버킷 생성**:
1. Storage → New Bucket
2. 이름: `avatars`
3. Public 체크

**2) 업로드 유틸 함수**:
```typescript
// app/lib/storage/upload.ts
import { supabase } from '@/app/lib/supabase'

export async function uploadAvatar(file: File, userId: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}
```

**예상 시간**: 15분

**체크리스트**:
- [ ] Storage 버킷 생성
- [ ] 업로드 유틸 함수 작성
- [ ] 테스트 이미지 업로드

---

## 📋 전체 체크리스트

### P0 항목
- [ ] npm 패키지 설치 (9개)
- [ ] 환경 변수 설정 (Resend, Anthropic, Google OAuth)
- [ ] Supabase 스키마 마이그레이션
- [ ] TypeScript 타입 생성

### P1 항목
- [ ] 이메일 발송 시스템 (Resend + 템플릿 2개)
- [ ] AI 클라이언트 (Claude + 프롬프트 5개)
- [ ] AI 캐싱 로직
- [ ] AI Rate Limiting
- [ ] Google OAuth 설정
- [ ] 에러 핸들링 시스템

### P2 항목
- [ ] 토스트 UI (Sonner)
- [ ] Supabase Storage (아바타)

---

## ⏱️ 예상 타임라인

| 시간 | 작업 |
|------|------|
| 0:00 - 0:05 | npm 패키지 설치 |
| 0:05 - 0:20 | 환경 변수 설정 (API 키 발급) |
| 0:20 - 0:30 | Supabase 스키마 마이그레이션 |
| 0:30 - 1:00 | 이메일 발송 시스템 구현 |
| 1:00 - 1:40 | AI 클라이언트 구현 |
| 1:40 - 2:00 | Google OAuth 설정 |
| 2:00 - 2:20 | 에러 핸들링 시스템 |
| 2:20 - 2:30 | 토스트 UI 설정 |
| 2:30 - 2:45 | Supabase Storage 설정 |
| **2:45 - 3:00** | **전체 테스트 및 검증** |

---

## 🚨 주의사항

1. **API 키 노출 방지**: `.env.local`을 절대 커밋하지 않기
2. **타입 안정성**: 환경 변수 접근 전 반드시 존재 여부 체크
3. **에러 처리**: 모든 외부 API 호출에 try-catch 적용
4. **Rate Limiting**: AI API 호출 전 반드시 제한 확인
5. **캐싱**: AI 캐시 hit/miss 로그 남기기

---

## 🎯 완료 기준

모든 항목 완료 후:

1. ✅ `npm run dev` 실행 시 에러 없음
2. ✅ 테스트 이메일 발송 성공
3. ✅ AI 요약 API 호출 성공
4. ✅ Google OAuth 로그인 성공
5. ✅ 토스트 메시지 표시 확인
6. ✅ 프로필 이미지 업로드 성공

---

**다음 단계**: 비즈니스 로직 구현 (3.1 인증 → 3.2 팀 → 3.3 프로젝트 → 3.4 이슈)
