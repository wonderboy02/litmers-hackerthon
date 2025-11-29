# 🚀 배포 가이드 (Phase 10)

> **목표**: Vercel에 프로덕션 배포 및 전체 기능 테스트
> **예상 소요 시간**: 30분

---

## 📋 사전 준비 체크리스트

배포 전 반드시 확인해야 할 사항:

### 1. 환경 변수 확인
- [ ] `.env.local` 파일에 모든 환경 변수 설정 완료
- [ ] Supabase URL 및 Anon Key 확인
- [ ] AI API Key 설정 (Claude, GPT, Gemini 등)
- [ ] 이메일 서비스 설정 (SendGrid, AWS SES 등)
- [ ] Google OAuth Client ID/Secret 확인

### 2. 코드 상태 확인
- [ ] 모든 TypeScript 에러 해결
- [ ] Lint 에러 해결 (`npm run lint`)
- [ ] Build 성공 확인 (`npm run build`)

### 3. DB 스키마 적용
- [ ] Supabase Dashboard에서 모든 테이블 생성 완료
- [ ] 타입 파일 생성 완료 (`npm run gen:types`)

---

## 🔧 1단계: 로컬 빌드 테스트

배포 전 로컬에서 프로덕션 빌드를 테스트합니다.

```bash
# 1. 빌드
npm run build

# 2. 프로덕션 모드로 실행
npm run start

# 3. 브라우저에서 http://localhost:3000 접속 확인
```

**확인 사항**:
- [ ] 빌드 에러 없이 완료
- [ ] 프로덕션 모드에서 정상 작동
- [ ] 모든 페이지 접근 가능

---

## ☁️ 2단계: Vercel 배포

### 2-1. Vercel CLI 설치 (선택)

```bash
npm i -g vercel
```

### 2-2. GitHub 연동 배포 (권장)

**방법 1: Vercel Dashboard 사용**

1. https://vercel.com 접속 및 로그인
2. "New Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (자동 감지)
   - **Output Directory**: `.next` (자동 감지)

5. "Deploy" 클릭

**방법 2: Vercel CLI 사용**

```bash
# 프로젝트 디렉토리에서 실행
vercel

# 질문에 답변
# - Set up and deploy? Yes
# - Which scope? (팀 선택 또는 개인)
# - Link to existing project? No
# - What's your project's name? (프로젝트명 입력)
# - In which directory is your code located? ./
# - Want to override the settings? No

# 프로덕션 배포
vercel --prod
```

---

## 🔐 3단계: 환경 변수 설정

Vercel Dashboard → Settings → Environment Variables에서 다음 환경 변수를 추가합니다.

### 필수 환경 변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xlovwwdppjfsbuzibctk.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (서버용) | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` |
| `ANTHROPIC_API_KEY` | Claude AI API Key | `sk-ant-api03-...` |
| `OPENAI_API_KEY` | OpenAI API Key (대안) | `sk-...` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123456789-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-...` |
| `SENDGRID_API_KEY` | SendGrid API Key (이메일) | `SG.abc123...` |
| `SENDGRID_FROM_EMAIL` | 발신 이메일 주소 | `noreply@yourdomain.com` |
| `NEXT_PUBLIC_APP_URL` | 배포된 앱 URL | `https://your-app.vercel.app` |

**환경 변수 추가 방법**:
1. Vercel Dashboard → 프로젝트 선택
2. Settings → Environment Variables
3. 각 변수를 "Production", "Preview", "Development" 모두에 추가
4. "Save" 클릭

**⚠️ 중요**: 환경 변수 추가 후 반드시 **재배포** 필요!

```bash
# Vercel CLI를 사용하는 경우
vercel --prod

# 또는 Vercel Dashboard에서 "Redeploy" 클릭
```

---

## 🔑 4단계: Google OAuth 설정

Google Cloud Console에서 Redirect URI를 업데이트합니다.

### 4-1. Google Cloud Console 접속

1. https://console.cloud.google.com 접속
2. 프로젝트 선택
3. "APIs & Services" → "Credentials" 이동

### 4-2. OAuth 2.0 Client ID 설정

1. 기존 OAuth 2.0 Client ID 클릭
2. "Authorized redirect URIs" 섹션에서 배포 URL 추가:

```
https://your-app.vercel.app/api/auth/callback/google
```

3. "Save" 클릭

**⚠️ 주의**: Vercel 배포 URL로 반드시 변경해야 합니다!

---

## 📧 5단계: 이메일 서비스 설정

### SendGrid 사용 시

1. https://sendgrid.com 접속 및 로그인
2. Settings → API Keys → Create API Key
3. Full Access 권한으로 생성
4. 생성된 Key를 Vercel 환경 변수에 추가 (`SENDGRID_API_KEY`)

### 발신자 인증

1. SendGrid → Settings → Sender Authentication
2. "Single Sender Verification" 선택
3. 발신 이메일 주소 입력 및 인증 완료
4. `SENDGRID_FROM_EMAIL` 환경 변수에 설정

---

## ✅ 6단계: 배포 후 테스트

배포가 완료되면 다음 기능들을 순서대로 테스트합니다.

### 6-1. 인증 시스템 (Phase 1)

- [ ] 회원가입 (이메일/비밀번호)
  - 테스트 계정: `test@example.com`
  - 비밀번호: `test1234`
- [ ] 로그인
- [ ] Google OAuth 로그인
- [ ] 비밀번호 재설정 이메일 발송 확인
- [ ] 프로필 수정

### 6-2. 팀 관리 (Phase 2)

- [ ] 팀 생성
- [ ] 팀 멤버 초대 (이메일 발송 확인)
- [ ] 역할 변경 (OWNER → ADMIN → MEMBER)
- [ ] 멤버 강제 퇴장
- [ ] 팀 활동 로그 확인

### 6-3. 프로젝트 관리 (Phase 3)

- [ ] 프로젝트 생성
- [ ] **기본 상태 3개 자동 생성 확인** (Backlog, In Progress, Done)
- [ ] 프로젝트 수정
- [ ] 프로젝트 즐겨찾기
- [ ] 프로젝트 아카이브

### 6-4. 이슈 관리 (Phase 4)

- [ ] 이슈 생성
- [ ] 이슈 수정
- [ ] 담당자 지정
- [ ] 서브태스크 추가
- [ ] 라벨 추가
- [ ] 이슈 검색/필터링
- [ ] 변경 히스토리 확인

### 6-5. 칸반 보드 (Phase 5)

- [ ] 칸반 보드 렌더링
- [ ] Drag & Drop으로 이슈 이동
- [ ] 상태 변경 확인
- [ ] WIP Limit 경고 표시
- [ ] Optimistic Update 작동

### 6-6. AI 기능 (Phase 6)

- [ ] 이슈 설명 요약
- [ ] 해결 전략 제안
- [ ] 라벨 자동 추천
- [ ] 중복 이슈 탐지
- [ ] 댓글 요약 (5개 이상 댓글 작성 후)
- [ ] AI Rate Limiting 확인

### 6-7. 댓글 시스템 (Phase 7)

- [ ] 댓글 작성
- [ ] 댓글 수정
- [ ] 댓글 삭제
- [ ] 댓글 작성 시 알림 발송

### 6-8. 대시보드 (Phase 8)

- [ ] 개인 대시보드 표시
- [ ] 프로젝트 대시보드 표시
- [ ] 팀 통계 차트 렌더링

### 6-9. 알림 시스템 (Phase 9)

- [ ] 헤더에 알림 아이콘 표시
- [ ] 미읽은 알림 개수 표시
- [ ] 알림 드롭다운 작동
- [ ] 개별 읽음 처리
- [ ] 전체 읽음 처리

---

## 🐛 배포 후 문제 해결

### 1. 환경 변수 관련 에러

**증상**: `NEXT_PUBLIC_SUPABASE_URL is not defined`

**해결**:
1. Vercel Dashboard → Settings → Environment Variables 확인
2. 모든 환경 변수가 "Production"에 체크되어 있는지 확인
3. 재배포 (`vercel --prod` 또는 Dashboard에서 Redeploy)

### 2. Google OAuth 에러

**증상**: `redirect_uri_mismatch` 에러

**해결**:
1. Google Cloud Console → Credentials 확인
2. Authorized redirect URIs에 정확한 Vercel URL 추가
3. 형식: `https://your-app.vercel.app/api/auth/callback/google`

### 3. 이메일 발송 실패

**증상**: 비밀번호 재설정 이메일이 도착하지 않음

**해결**:
1. SendGrid API Key 확인
2. 발신자 인증 완료 확인
3. SendGrid Dashboard에서 Activity 로그 확인
4. 스팸 폴더 확인

### 4. AI 기능 에러

**증상**: AI 요약/제안이 작동하지 않음

**해결**:
1. `ANTHROPIC_API_KEY` 또는 `OPENAI_API_KEY` 확인
2. API Key가 유효한지 확인 (잔액 확인)
3. Rate Limiting 초과 여부 확인

### 5. 빌드 에러

**증상**: Vercel 빌드가 실패함

**해결**:
```bash
# 로컬에서 빌드 테스트
npm run build

# 에러 메시지 확인 후 수정
# TypeScript 에러, 누락된 모듈 등 확인
```

### 6. Database 연결 에러

**증상**: `Failed to connect to Supabase`

**해결**:
1. Supabase Dashboard에서 프로젝트 일시 중지 여부 확인
2. `NEXT_PUBLIC_SUPABASE_URL` 정확성 확인
3. `NEXT_PUBLIC_SUPABASE_ANON_KEY` 유효성 확인

---

## 📊 배포 완료 확인

모든 테스트가 통과하면 배포 완료!

**최종 체크리스트**:
- [ ] 실제 URL 접속 가능
- [ ] 회원가입/로그인 작동
- [ ] 팀 생성 작동
- [ ] 프로젝트 생성 작동 (기본 상태 3개 자동 생성 확인)
- [ ] 이슈 생성 작동
- [ ] 칸반 보드 Drag & Drop 작동
- [ ] AI 기능 작동
- [ ] 댓글 작성 작동
- [ ] 알림 수신 작동
- [ ] 이메일 발송 작동
- [ ] Google OAuth 작동

---

## 🎉 축하합니다!

Unlooped MVP가 성공적으로 배포되었습니다!

**배포된 URL을 README.md에 추가하세요**:

```markdown
## 🚀 Demo

배포 URL: https://your-app.vercel.app

테스트 계정:
- Email: test@example.com
- Password: test1234
```

---

## 📞 추가 지원

배포 중 문제가 발생하면:
1. Vercel 로그 확인 (Deployment → Logs)
2. Supabase 로그 확인 (Logs & Analytics)
3. 브라우저 개발자 도구 콘솔 확인
4. `project_prd/HANDOFF_TO_TEAM.md` 참고

**Happy Deploying! 🚀**
