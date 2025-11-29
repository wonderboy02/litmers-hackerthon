# 🚀 Unlooped MVP 프로젝트 세팅 가이드

이 가이드는 Unlooped MVP 프로젝트를 로컬 환경에서 실행하고 Vercel에 배포하기 위한 전체 세팅 과정을 안내합니다.

## 📋 목차

1. [사전 요구사항](#사전-요구사항)
2. [Supabase 설정](#1-supabase-설정)
3. [Google OAuth 설정](#2-google-oauth-설정)
4. [Gmail SMTP 설정](#3-gmail-smtp-설정)
5. [OpenAI API 설정](#4-openai-api-설정)
6. [로컬 개발 환경 설정](#5-로컬-개발-환경-설정)
7. [Vercel 배포](#6-vercel-배포)
8. [트러블슈팅](#트러블슈팅)

---

## 사전 요구사항

- Node.js 18.x 이상
- npm 또는 yarn
- Git
- Google 계정 (Gmail 및 OAuth용)
- Vercel 계정 (배포용)
- OpenAI 계정 (AI 기능용)

---

## 1. Supabase 설정

### 1.1 Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 접속 후 로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Name**: 프로젝트 이름 입력 (예: `unlooped-mvp`)
   - **Database Password**: 강력한 비밀번호 생성 및 저장
   - **Region**: 가장 가까운 지역 선택 (예: `Northeast Asia (Seoul)`)
4. "Create new project" 클릭 (프로젝트 생성까지 약 2분 소요)

### 1.2 Supabase API 키 획득

1. Supabase 대시보드에서 생성한 프로젝트 선택
2. 좌측 사이드바에서 **Settings** (⚙️) → **API** 클릭
3. 다음 정보 복사:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co` 형식
   - **Project API keys** → **anon public**: `eyJhbG...` 형식의 긴 키

> 📝 **중요**: `anon public` 키를 사용하세요. `service_role` 키는 서버 측에서만 사용해야 합니다.

### 1.3 Supabase 데이터베이스 마이그레이션

프로젝트에 포함된 마이그레이션 파일을 실행하여 데이터베이스 스키마를 생성합니다:

```bash
# Supabase CLI 설치 (한 번만 실행)
npm install -g supabase

# Supabase 프로젝트 링크
npx supabase login
npx supabase link --project-ref [프로젝트 ID]

# 마이그레이션 실행
npx supabase db push
```

> 💡 **프로젝트 ID**는 Supabase URL에서 `https://[프로젝트ID].supabase.co` 형식으로 확인할 수 있습니다.

---

## 2. Google OAuth 설정

Google 소셜 로그인을 위한 OAuth 2.0 클라이언트 ID를 생성합니다.

### 2.1 Google Cloud Console 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 상단 프로젝트 선택 드롭다운 → **새 프로젝트** 클릭
3. 프로젝트 이름 입력 (예: `Unlooped MVP`) → **만들기**

### 2.2 OAuth 동의 화면 구성

1. 좌측 메뉴 → **API 및 서비스** → **OAuth 동의 화면**
2. User Type 선택:
   - **외부** 선택 (개인 Gmail 계정용)
   - **내부** 선택 (Google Workspace 조직용)
3. **만들기** 클릭
4. 앱 정보 입력:
   - **앱 이름**: Unlooped MVP
   - **사용자 지원 이메일**: 본인 이메일
   - **개발자 연락처 정보**: 본인 이메일
5. **저장 후 계속** 클릭
6. 범위(Scopes) 페이지: **저장 후 계속** (기본값 사용)
7. 테스트 사용자 페이지: 필요시 테스트 사용자 추가 → **저장 후 계속**

### 2.3 OAuth 클라이언트 ID 생성

1. 좌측 메뉴 → **API 및 서비스** → **사용자 인증 정보**
2. 상단 **+ 사용자 인증 정보 만들기** → **OAuth 클라이언트 ID** 선택
3. 애플리케이션 유형: **웹 애플리케이션**
4. 이름: `Unlooped Web Client`
5. **승인된 JavaScript 원본** 추가:
   ```
   http://localhost:3000
   https://your-domain.vercel.app
   ```
6. **승인된 리디렉션 URI** 추가:
   ```
   http://localhost:3000/auth/callback
   https://your-domain.vercel.app/auth/callback
   https://[프로젝트ID].supabase.co/auth/v1/callback
   ```
7. **만들기** 클릭
8. 생성된 **클라이언트 ID**와 **클라이언트 보안 비밀** 복사 및 저장

### 2.4 Supabase에 Google OAuth 연결

1. Supabase 대시보드 → **Authentication** → **Providers**
2. **Google** 클릭하여 활성화
3. Google OAuth 정보 입력:
   - **Client ID**: 위에서 복사한 Google 클라이언트 ID
   - **Client Secret**: 위에서 복사한 Google 클라이언트 보안 비밀
4. **Save** 클릭

---

## 3. Gmail SMTP 설정

이메일 발송 기능을 위한 Gmail SMTP 설정입니다.

### 3.1 Google 계정 2단계 인증 활성화

1. [Google 계정 보안 설정](https://myaccount.google.com/security) 접속
2. **2단계 인증** 섹션 찾기
3. 아직 활성화되지 않았다면 **시작하기** 클릭
4. 안내에 따라 2단계 인증 설정 완료

> ⚠️ **필수**: 앱 비밀번호를 생성하려면 2단계 인증이 반드시 활성화되어 있어야 합니다.

### 3.2 Gmail 앱 비밀번호 생성

1. [Google 앱 비밀번호](https://myaccount.google.com/apppasswords) 페이지 접속
   - 또는 Google 계정 → 보안 → 앱 비밀번호
2. "앱 선택" 드롭다운 → **메일** 선택
3. "기기 선택" 드롭다운 → **기타(맞춤 이름)** 선택
4. 이름 입력: `Unlooped MVP`
5. **생성** 클릭
6. 생성된 16자리 비밀번호 복사 (공백 포함)
   - 형식: `xxxx xxxx xxxx xxxx`
   - `.env.local`에 저장할 때는 공백 제거: `xxxxxxxxxxxxxxxx`

> 💡 **참고**: 이 비밀번호는 한 번만 표시되므로 반드시 안전한 곳에 저장하세요.

---

## 4. OpenAI API 설정

AI 기능 사용을 위한 OpenAI API 키를 발급받습니다.

### 4.1 OpenAI API 키 발급

1. [OpenAI Platform](https://platform.openai.com/) 접속 및 로그인
2. 우측 상단 프로필 아이콘 → **View API keys** 클릭
   - 또는 [API Keys 페이지](https://platform.openai.com/api-keys) 직접 접속
3. **+ Create new secret key** 클릭
4. 이름 입력 (선택사항): `Unlooped MVP`
5. **Create secret key** 클릭
6. 생성된 API 키 복사 (형식: `sk-...`)

> ⚠️ **중요**: 이 키는 한 번만 표시되므로 반드시 안전한 곳에 저장하세요.

### 4.2 OpenAI 사용량 및 결제 설정

1. [Billing 페이지](https://platform.openai.com/account/billing/overview) 접속
2. 결제 수단 추가 (크레딧 카드)
3. 사용량 한도 설정 (선택사항):
   - **Usage limits** → **Set a monthly budget** 설정 권장

---

## 5. 로컬 개발 환경 설정

### 5.1 저장소 클론 및 의존성 설치

```bash
# 저장소 클론
git clone https://github.com/your-username/unlooped-mvp.git
cd unlooped-mvp

# 의존성 설치
npm install
```

### 5.2 환경 변수 설정

1. `.env.local.example` 파일을 복사하여 `.env.local` 파일 생성:

```bash
cp .env.local.example .env.local
```

2. `.env.local` 파일을 편집하여 실제 값 입력:

```bash
# SUPABASE CONFIG
NEXT_PUBLIC_SUPABASE_URL=https://xlovwwdppjfsbuzibctk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-supabase-anon-key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Gmail SMTP
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx  # 공백 제거한 16자리

# AI Configuration
OPENAI_API_KEY=sk-ant-your-actual-api-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 5.3 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속하여 애플리케이션 확인

### 5.4 타입 생성 (선택사항)

Supabase 데이터베이스 스키마가 변경된 경우:

```bash
npm run gen:types
```

---

## 6. Vercel 배포

### 6.1 Vercel 계정 연결

1. [Vercel](https://vercel.com) 접속 및 로그인
2. **Add New...** → **Project** 클릭
3. Git 저장소 연결:
   - GitHub, GitLab, 또는 Bitbucket 선택
   - 저장소 선택 및 Import

### 6.2 프로젝트 설정

1. **Configure Project** 페이지에서:
   - **Framework Preset**: Next.js (자동 감지됨)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: `.next` (기본값)

### 6.3 환경 변수 설정

**Environment Variables** 섹션에서 다음 환경 변수들을 추가합니다:

| Name | Value | Environments |
|------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xlovwwdppjfsbuzibctk.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-supabase-anon-key` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://your-preview.vercel.app` | Preview |
| `GMAIL_USER` | `your-email@gmail.com` | Production, Preview |
| `GMAIL_APP_PASSWORD` | `xxxxxxxxxxxxxxxx` | Production, Preview |
| `OPENAI_API_KEY` | `sk-ant-your-api-key` | Production, Preview |
| `GOOGLE_CLIENT_ID` | `your-client-id.apps.googleusercontent.com` | Production, Preview |
| `GOOGLE_CLIENT_SECRET` | `your-client-secret` | Production, Preview |

> 📝 **참고**: 민감한 정보(`GMAIL_APP_PASSWORD`, `OPENAI_API_KEY` 등)는 반드시 **Sensitive** 체크박스를 선택하세요.

### 6.4 배포 시작

1. 환경 변수 입력 완료 후 **Deploy** 클릭
2. 빌드 및 배포 진행 상황 확인 (약 2-5분 소요)
3. 배포 완료 후 **Visit** 클릭하여 사이트 확인

### 6.5 Google OAuth 리디렉션 URI 업데이트

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. **API 및 서비스** → **사용자 인증 정보**
3. 생성한 OAuth 클라이언트 ID 클릭
4. **승인된 리디렉션 URI**에 Vercel 도메인 추가:
   ```
   https://your-domain.vercel.app/auth/callback
   https://your-domain.vercel.app
   ```
5. **저장** 클릭

### 6.6 Supabase Site URL 업데이트

1. Supabase 대시보드 → **Authentication** → **URL Configuration**
2. **Site URL** 수정:
   ```
   https://your-domain.vercel.app
   ```
3. **Redirect URLs**에 추가:
   ```
   https://your-domain.vercel.app/**
   ```
4. **Save** 클릭

### 6.7 자동 배포 설정

Vercel은 기본적으로 Git 푸시 시 자동 배포됩니다:

- **Production**: `main` 브랜치에 푸시 시
- **Preview**: PR 생성 또는 다른 브랜치에 푸시 시

---

## 트러블슈팅

### 문제: Supabase 연결 실패

**증상**: `Failed to fetch` 또는 CORS 에러

**해결 방법**:
1. `.env.local` 파일의 `NEXT_PUBLIC_SUPABASE_URL` 확인
2. Supabase 프로젝트가 활성 상태인지 확인
3. 브라우저 캐시 삭제 및 개발 서버 재시작

### 문제: Google OAuth 로그인 실패

**증상**: `redirect_uri_mismatch` 에러

**해결 방법**:
1. Google Cloud Console에서 승인된 리디렉션 URI 확인
2. Supabase에 설정한 Google OAuth 콜백 URL 확인:
   ```
   https://[프로젝트ID].supabase.co/auth/v1/callback
   ```

### 문제: Gmail SMTP 이메일 발송 실패

**증상**: `Invalid login` 또는 `Authentication failed`

**해결 방법**:
1. 2단계 인증이 활성화되어 있는지 확인
2. 앱 비밀번호를 공백 없이 입력했는지 확인
3. 새로운 앱 비밀번호를 생성하여 재시도

### 문제: OpenAI API 호출 실패

**증상**: `401 Unauthorized` 또는 `Incorrect API key`

**해결 방법**:
1. API 키가 `sk-`로 시작하는지 확인
2. OpenAI 계정의 사용량 한도 및 결제 정보 확인
3. [API Keys 페이지](https://platform.openai.com/api-keys)에서 키가 활성 상태인지 확인

### 문제: Vercel 빌드 실패

**증상**: Build error 또는 TypeScript errors

**해결 방법**:
1. 로컬에서 `npm run build` 실행하여 에러 확인
2. 환경 변수가 모두 설정되었는지 확인
3. `node_modules` 삭제 후 재설치:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### 문제: 타입 에러 발생

**증상**: TypeScript 컴파일 에러

**해결 방법**:
1. Supabase 타입 재생성:
   ```bash
   npm run gen:types
   ```
2. TypeScript 서버 재시작 (VSCode: `Cmd+Shift+P` → `TypeScript: Restart TS Server`)

---

## 📚 추가 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Vercel 문서](https://vercel.com/docs)
- [Google OAuth 가이드](https://developers.google.com/identity/protocols/oauth2)
- [OpenAI API 문서](https://platform.openai.com/docs)

---

## 🆘 도움이 필요하신가요?

문제가 해결되지 않으면 다음을 확인하세요:
- GitHub Issues에 문제 등록
- 프로젝트 담당자에게 문의
- 각 서비스의 공식 문서 및 커뮤니티 포럼 확인

---

**마지막 업데이트**: 2025-11-29
