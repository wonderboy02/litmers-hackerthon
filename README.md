# Unlooped MVP

Unlooped MVP는 Next.js 14 기반의 프로젝트 관리 및 이슈 트래킹 시스템입니다. AI 기능, 실시간 협업, Google OAuth 로그인을 지원합니다.

## 🌟 주요 기능

- 🔐 **Google OAuth 소셜 로그인**
- 📧 **이메일 알림 시스템** (Gmail SMTP)
- 🤖 **AI 기반 기능** (OpenAI API)
- 👥 **팀 및 프로젝트 관리**
- 📋 **이슈 트래킹 및 작업 관리**
- 🔔 **실시간 알림**
- 💬 **댓글 및 협업 기능**

## 🛠️ 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **UI**: React 18 + Tailwind CSS 4
- **상태 관리**: TanStack React Query v5
- **백엔드**: Supabase (PostgreSQL)
- **인증**: Supabase Auth + Google OAuth
- **이메일**: Gmail SMTP
- **AI**: OpenAI API

---

## 🚀 빠른 시작

### 1. 저장소 클론 및 의존성 설치

```bash
git clone https://github.com/your-username/unlooped-mvp.git
cd unlooped-mvp
npm install
```

### 2. 환경 변수 설정

`.env.local.example` 파일을 복사하여 `.env.local` 생성:

```bash
cp .env.local.example .env.local
```

`.env.local` 파일 편집:

```bash
# SUPABASE CONFIG
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Gmail SMTP
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-digit-app-password

# AI Configuration
OPENAI_API_KEY=sk-proj-your-openai-api-key

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 📖 상세 설정 가이드

각 서비스별 상세 설정 방법은 **[SETUP.md](./SETUP.md)** 파일을 참조하세요.

### Supabase 설정

1. [Supabase](https://supabase.com) 프로젝트 생성
2. API 키 복사 (Settings → API)
3. 데이터베이스 마이그레이션 실행:

```bash
npx supabase login
npx supabase link --project-ref [프로젝트ID]
npx supabase db push
```

📚 **자세한 내용**: [SETUP.md - Supabase 설정](./SETUP.md#1-supabase-설정)

### Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 프로젝트 생성
2. OAuth 2.0 클라이언트 ID 생성
3. Supabase에 Google Provider 연결

📚 **자세한 내용**: [SETUP.md - Google OAuth 설정](./SETUP.md#2-google-oauth-설정)

### Gmail SMTP 설정

1. Google 계정 2단계 인증 활성화
2. [앱 비밀번호](https://myaccount.google.com/apppasswords) 생성
3. 16자리 비밀번호를 `.env.local`에 저장 (공백 제거)

📚 **자세한 내용**: [SETUP.md - Gmail SMTP 설정](./SETUP.md#3-gmail-smtp-설정)

### OpenAI API 설정

1. [OpenAI Platform](https://platform.openai.com/) 접속
2. API 키 생성
3. 결제 정보 등록

📚 **자세한 내용**: [SETUP.md - OpenAI API 설정](./SETUP.md#4-openai-api-설정)

---

## 🌐 Vercel 배포

### 1. Vercel 프로젝트 생성

1. [Vercel](https://vercel.com)에서 GitHub 저장소 Import
2. 환경 변수 설정 (Production, Preview 환경별)
3. Deploy 클릭

### 2. 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수 추가:

| 변수 이름 | 설명 |
|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public 키 |
| `NEXT_PUBLIC_APP_URL` | 배포된 도메인 URL |
| `GMAIL_USER` | Gmail 주소 |
| `GMAIL_APP_PASSWORD` | Gmail 앱 비밀번호 |
| `OPENAI_API_KEY` | OpenAI API 키 |
| `GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 클라이언트 Secret |

### 3. OAuth 리디렉션 URI 업데이트

**Google Cloud Console**에서 승인된 리디렉션 URI 추가:
```
https://your-domain.vercel.app/auth/callback
https://[프로젝트ID].supabase.co/auth/v1/callback
```

**Supabase**에서 Site URL 업데이트:
- Authentication → URL Configuration
- Site URL: `https://your-domain.vercel.app`

📚 **자세한 내용**: [SETUP.md - Vercel 배포](./SETUP.md#6-vercel-배포)

---

## 📁 프로젝트 구조

```
unlooped-mvp/
├── app/
│   ├── (auth)/                    # 인증 관련 페이지
│   ├── (dashboard)/               # 대시보드 페이지
│   │   ├── invites/              # 초대 관리
│   │   └── teams/                # 팀 및 프로젝트
│   ├── api/                       # API Routes
│   │   ├── projects/             # 프로젝트 API
│   │   └── teams/                # 팀 API
│   ├── components/                # React 컴포넌트
│   ├── hooks/                     # 커스텀 훅
│   ├── lib/                       # 유틸리티 및 설정
│   │   ├── repositories/         # 데이터 레포지토리
│   │   ├── supabase.ts          # Supabase 클라이언트
│   │   └── queries.ts           # React Query 훅
│   └── providers/                 # Context Providers
├── supabase/
│   └── migrations/                # DB 마이그레이션
├── types/
│   └── supabase.ts               # DB 타입 정의
└── .env.local                     # 환경 변수 (로컬)
```

---

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 실행
npm run start

# 코드 린팅
npm run lint

# 코드 포맷팅
npm run format

# Supabase 타입 생성
npm run gen:types
```

---

## 🔑 주요 API 엔드포인트

### Teams API

- `POST /api/teams` - 팀 생성
- `GET /api/teams/[teamId]` - 팀 정보 조회
- `POST /api/teams/[teamId]/invite` - 팀원 초대

### Projects API

- `POST /api/projects` - 프로젝트 생성
- `GET /api/projects/[projectId]` - 프로젝트 조회
- `POST /api/projects/[projectId]/labels` - 라벨 생성
- `POST /api/projects/[projectId]/states` - 상태 생성

### Issues API

- `POST /api/projects/[projectId]/issues` - 이슈 생성
- `GET /api/projects/[projectId]/issues/[issueId]` - 이슈 조회
- `PATCH /api/projects/[projectId]/issues/[issueId]` - 이슈 수정

---

## 🐛 트러블슈팅

### Supabase 연결 오류

```bash
# 타입 재생성
npm run gen:types

# 개발 서버 재시작
npm run dev
```

### Google OAuth 로그인 실패

1. Google Cloud Console에서 리디렉션 URI 확인
2. Supabase Authentication 설정 확인
3. 환경 변수 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 확인

### Gmail 이메일 발송 실패

1. 2단계 인증 활성화 확인
2. 앱 비밀번호 재생성
3. 공백 없이 16자리 입력 확인

### OpenAI API 오류

1. API 키 유효성 확인
2. OpenAI 사용량 한도 확인
3. 결제 정보 등록 확인

📚 **자세한 내용**: [SETUP.md - 트러블슈팅](./SETUP.md#트러블슈팅)

---

## 📚 추가 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [TanStack Query 문서](https://tanstack.com/query/latest)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [OpenAI API 문서](https://platform.openai.com/docs)

---

## 🤝 기여

이슈 및 풀 리퀘스트는 언제나 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

This project is licensed under the MIT License.

---

## 👥 팀

Litmers Hackathon Team

---

**마지막 업데이트**: 2025-11-29
