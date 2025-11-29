# Unlooped MVP 구현 체크리스트

> **최종 목표**: 8시간 내 전체 MVP 완성 및 배포
> **마지막 업데이트**: 2025-11-29

---

## 📊 전체 진행 현황

| Phase | 주제 | 예상 시간 | 상태 | 진행률 |
|-------|------|-----------|------|--------|
| Phase 0 | DB 스키마 적용 | 15분 | ⬜ 대기 | 0% |
| Phase 1 | 인증 시스템 | 1시간 | 🟢 진행중 | 85% |
| Phase 2 | 팀 관리 | 1시간 | 🟡 진행중 | 60% |
| Phase 3 | 프로젝트 관리 | 45분 | ⬜ 대기 | 0% |
| Phase 4 | 이슈 기본 CRUD | 1시간 | ⬜ 대기 | 0% |
| Phase 5 | 칸반 보드 | 1시간 | ⬜ 대기 | 0% |
| Phase 6 | AI 기능 | 45분 | ⬜ 대기 | 0% |
| Phase 7 | 댓글 시스템 | 30분 | ⬜ 대기 | 0% |
| Phase 8 | 대시보드/통계 | 45분 | ⬜ 대기 | 0% |
| Phase 9 | 알림 시스템 | 30분 | ⬜ 대기 | 0% |
| Phase 10 | 배포 | 30분 | ⬜ 대기 | 0% |

**전체 진행률**: 1.5/11 Phase 완료 (14%)

---

## 🚀 Phase 0: DB 스키마 적용 (15분)

### 목표
- Supabase에 전체 테이블 생성
- TypeScript 타입 파일 생성

### 체크리스트
- [ ] Supabase Dashboard → SQL Editor 접속
- [ ] `sql/DB_schema.sql` 파일 내용 복사
- [ ] SQL 실행 완료
- [ ] 모든 테이블 생성 확인 (20개)
- [ ] ENUM 타입 생성 확인 (user_role, priority_level, ai_feature_type)
- [ ] Index 생성 확인
- [ ] `npm run gen:types` 실행
- [ ] `types/supabase.ts` 파일 업데이트 확인

**완료 기준**: Supabase Table Editor에서 20개 테이블 확인 + 타입 파일 생성

---

## 🔐 Phase 1: 인증 시스템 (1시간)

### 목표
- FR-001~FR-007 구현 (회원가입, 로그인, OAuth, 프로필 관리)

### 1-1. Zod 스키마 작성 (10분) ✅
- [x] `app/lib/validators/` 폴더 생성
- [x] `app/lib/validators/auth.schema.ts` 작성
  - [x] signupSchema
  - [x] loginSchema
  - [x] resetPasswordRequestSchema
  - [x] resetPasswordSchema
  - [x] updateProfileSchema
  - [x] changePasswordSchema

### 1-2. Repository 레이어 (15분) ✅
- [x] `app/lib/repositories/` 폴더 생성
- [x] `app/lib/repositories/user.repository.ts` 작성
  - [x] findById
  - [x] findByEmail
  - [x] findByGoogleId
  - [x] create
  - [x] update
  - [x] softDelete
- [x] passwordResetRepository 작성
  - [x] create
  - [x] findValidToken
  - [x] deleteToken

### 1-3. Service 레이어 (20분) ✅
- [x] `app/lib/services/` 폴더 생성
- [x] `app/lib/services/auth.service.ts` 작성
  - [x] signup (FR-001)
  - [x] login (FR-002)
  - [x] logout (FR-002)
  - [x] requestPasswordReset (FR-003)
  - [x] resetPassword (FR-003)
  - [x] updateProfile (FR-005)
  - [x] changePassword (FR-006)
  - [x] deleteAccount (FR-007)
  - [x] getCurrentUser

### 1-4. API Routes (10분) ✅
- [x] `app/api/auth/signup/route.ts`
- [x] `app/api/auth/login/route.ts`
- [x] `app/api/auth/logout/route.ts`
- [x] `app/api/auth/reset-password/route.ts`
- [x] `app/api/auth/profile/route.ts`
- [x] `app/api/auth/me/route.ts`
- [x] `app/api/auth/change-password/route.ts`
- [x] `app/api/auth/delete-account/route.ts`

### 1-5. React Query Hooks (5분) ✅
- [x] `app/lib/hooks/` 폴더 생성
- [x] `app/lib/hooks/useAuth.ts` 작성
  - [x] useAuth hook
  - [x] loginMutation
  - [x] signupMutation
  - [x] logoutMutation
  - [x] requestPasswordResetMutation
  - [x] resetPasswordMutation
  - [x] updateProfileMutation
  - [x] changePasswordMutation
  - [x] deleteAccountMutation

### 1-6. UI 컴포넌트 (10분)
- [ ] `app/(auth)/` 라우트 그룹 생성
- [ ] `app/(auth)/login/page.tsx`
- [ ] `app/(auth)/signup/page.tsx`
- [ ] `app/(auth)/reset-password/page.tsx`
- [ ] `app/components/auth/LoginForm.tsx`
- [ ] `app/components/auth/SignupForm.tsx`
- [ ] `app/components/auth/GoogleLoginButton.tsx`

**완료 기준**: 회원가입 → 로그인 → 프로필 조회 flow 작동

---

## 👥 Phase 2: 팀 관리 (1시간)

### 목표
- FR-010~FR-019 구현 (팀 CRUD, 멤버 관리, 초대 시스템)

### 2-1. Zod 스키마 (5분) ✅
- [x] `app/lib/validators/team.schema.ts` 작성
  - [x] createTeamSchema
  - [x] updateTeamSchema
  - [x] inviteMemberSchema
  - [x] changeRoleSchema

### 2-2. Repository 레이어 (10분) ✅
- [x] `app/lib/repositories/team.repository.ts` 작성
  - [x] teamRepository (findById, findByUserId, create, update, softDelete)
  - [x] teamMemberRepository (findMember, findMembers, create, updateRole, remove)
  - [x] teamInvitationRepository (create, findValidToken, findPending, updateExpiry, delete)
  - [x] teamActivityLogRepository (create, findByTeam)

### 2-3. Service 레이어 (20분) ✅
- [x] `app/lib/services/team.service.ts` 작성
  - [x] createTeam (FR-010)
  - [x] updateTeam (FR-011)
  - [x] deleteTeam (FR-012)
  - [x] inviteMember (FR-013)
  - [x] getMembers (FR-014)
  - [x] kickMember (FR-015)
  - [x] leaveTeam (FR-016)
  - [x] changeRole (FR-018)
  - [x] getActivityLogs (FR-019)
  - [x] verifyPermission
  - [x] verifyMembership

### 2-4. API Routes (10분)
- [ ] `app/api/teams/route.ts` (POST, GET)
- [ ] `app/api/teams/[teamId]/route.ts` (GET, PATCH, DELETE)
- [ ] `app/api/teams/[teamId]/members/route.ts`
- [ ] `app/api/teams/[teamId]/invite/route.ts`
- [ ] `app/api/teams/[teamId]/activity-logs/route.ts`

### 2-5. React Query Hooks (5분)
- [ ] `app/lib/hooks/useTeams.ts` 작성

### 2-6. UI 컴포넌트 (10분)
- [ ] `app/(dashboard)/layout.tsx` (공통 레이아웃)
- [ ] `app/(dashboard)/teams/page.tsx`
- [ ] `app/(dashboard)/teams/[teamId]/page.tsx`
- [ ] `app/components/teams/TeamCard.tsx`
- [ ] `app/components/teams/TeamMemberList.tsx`
- [ ] `app/components/teams/InviteMemberModal.tsx`

**완료 기준**: 팀 생성 → 멤버 초대 → 역할 변경 flow 작동

---

## 📊 Phase 3: 프로젝트 관리 (45분)

### 목표
- FR-020~FR-027 구현 (프로젝트 CRUD, 기본 상태 자동 생성)

### 3-1. Zod 스키마 (5분)
- [ ] `app/lib/validators/project.schema.ts` 작성

### 3-2. Repository 레이어 (10분)
- [ ] `app/lib/repositories/project.repository.ts` 작성
  - [ ] projectRepository
  - [ ] projectStateRepository
  - [ ] projectLabelRepository
  - [ ] projectFavoriteRepository

### 3-3. Service 레이어 (15분)
- [ ] `app/lib/services/project.service.ts` 작성
  - [ ] **createProject (기본 상태 자동 생성 포함!)** ⭐
  - [ ] updateProject
  - [ ] deleteProject
  - [ ] archiveProject
  - [ ] toggleFavorite

### 3-4. API Routes (5분)
- [ ] `app/api/projects/route.ts`
- [ ] `app/api/projects/[projectId]/route.ts`
- [ ] `app/api/projects/[projectId]/states/route.ts`
- [ ] `app/api/projects/[projectId]/favorite/route.ts`

### 3-5. UI 컴포넌트 (10분)
- [ ] `app/(dashboard)/teams/[teamId]/projects/page.tsx`
- [ ] `app/components/projects/ProjectCard.tsx`
- [ ] `app/components/projects/ProjectForm.tsx`

**완료 기준**: 프로젝트 생성 시 Backlog, In Progress, Done 상태 자동 생성 확인

---

## 🎯 Phase 4: 이슈 기본 CRUD (1시간)

### 목표
- FR-030~FR-039-2 구현 (이슈 CRUD, 서브태스크)

### 4-1. Position 계산 유틸 (10분)
- [ ] `app/lib/utils/` 폴더 생성
- [ ] `app/lib/utils/position.ts` 작성
  - [ ] calculatePosition 함수
  - [ ] 정밀도 한계 체크 로직

### 4-2. Repository 레이어 (15분)
- [ ] `app/lib/repositories/issue.repository.ts` 작성
  - [ ] issueRepository
  - [ ] issueHistoryRepository
  - [ ] subtaskRepository

### 4-3. Service 레이어 (20분)
- [ ] `app/lib/services/issue.service.ts` 작성
  - [ ] createIssue
  - [ ] updateIssue
  - [ ] deleteIssue
  - [ ] moveIssue (상태 변경)
  - [ ] assignIssue
  - [ ] searchIssues

### 4-4. API Routes (10분)
- [ ] `app/api/projects/[projectId]/issues/route.ts`
- [ ] `app/api/projects/[projectId]/issues/[issueId]/route.ts`
- [ ] `app/api/projects/[projectId]/issues/[issueId]/move/route.ts`
- [ ] `app/api/projects/[projectId]/issues/[issueId]/subtasks/route.ts`

### 4-5. UI 컴포넌트 (5분)
- [ ] `app/components/issues/IssueForm.tsx`
- [ ] `app/components/issues/IssueFilters.tsx`
- [ ] `app/components/issues/SubtaskList.tsx`

**완료 기준**: 이슈 생성 → 수정 → 삭제 → 검색 flow 작동

---

## 🗂️ Phase 5: 칸반 보드 (1시간)

### 목표
- FR-050~FR-054 구현 (Drag & Drop, WIP Limit)

### 5-1. Drag & Drop 설정 (10분)
- [ ] `@hello-pangea/dnd` 패키지 설치
- [ ] `app/lib/hooks/useKanbanData.ts` 작성
- [ ] `app/lib/hooks/useMoveIssue.ts` 작성

### 5-2. Kanban 컴포넌트 (30분)
- [ ] `app/components/kanban/KanbanBoard.tsx`
- [ ] `app/components/kanban/KanbanColumn.tsx`
- [ ] `app/components/kanban/IssueCard.tsx`
- [ ] `app/components/kanban/IssueDetailModal.tsx`

### 5-3. 칸반 페이지 (10분)
- [ ] `app/(dashboard)/teams/[teamId]/projects/[projectId]/page.tsx`

### 5-4. 고급 기능 (10분)
- [ ] Optimistic Update 적용
- [ ] WIP Limit 경고 UI
- [ ] 커스텀 상태 관리 UI

**완료 기준**: 이슈를 드래그하여 다른 컬럼으로 이동 시 상태 변경 및 순서 저장

---

## 🤖 Phase 6: AI 기능 (45분)

### 목표
- FR-040~FR-045 구현 (AI 요약, 제안, 자동 분류)

### 6-1. AI Service (20분)
- [ ] `app/lib/services/ai.service.ts` 작성
  - [ ] generateSummary (FR-040)
  - [ ] generateSuggestion (FR-041)
  - [ ] classifyIssue (FR-043)
  - [ ] detectDuplicates (FR-044)
  - [ ] summarizeComments (FR-045)
  - [ ] AI 캐싱 로직 (input_hash 기반)

### 6-2. API Routes (10분)
- [ ] `app/api/projects/[projectId]/issues/[issueId]/ai/summary/route.ts`
- [ ] `app/api/projects/[projectId]/issues/[issueId]/ai/suggestion/route.ts`
- [ ] `app/api/projects/[projectId]/issues/[issueId]/ai/labels/route.ts`

### 6-3. UI 컴포넌트 (15분)
- [ ] `app/components/ai/AISummaryButton.tsx`
- [ ] `app/components/ai/AISuggestionButton.tsx`
- [ ] `app/components/ai/AILabelRecommendation.tsx`

**완료 기준**: 이슈 상세 페이지에서 AI 요약/제안 버튼 클릭 시 작동

---

## 💬 Phase 7: 댓글 시스템 (30분)

### 목표
- FR-060~FR-063 구현 (댓글 CRUD)

### 체크리스트
- [ ] `app/lib/repositories/comment.repository.ts` 작성
- [ ] `app/lib/services/comment.service.ts` 작성
- [ ] `app/api/projects/[projectId]/issues/[issueId]/comments/route.ts`
- [ ] `app/components/issues/CommentList.tsx`
- [ ] `app/components/issues/CommentForm.tsx`

**완료 기준**: 이슈 상세 페이지에서 댓글 작성 → 수정 → 삭제

---

## 📈 Phase 8: 대시보드/통계 (45분)

### 목표
- FR-080~FR-082 구현 (대시보드, 차트)

### 8-1. 대시보드 API (20분)
- [ ] `app/api/dashboard/personal/route.ts`
- [ ] `app/api/dashboard/team/[teamId]/route.ts`
- [ ] `app/lib/services/dashboard.service.ts`

### 8-2. 차트 컴포넌트 (15분)
- [ ] `recharts` 패키지 설치
- [ ] `app/components/dashboard/charts/IssueStatusChart.tsx`
- [ ] `app/components/dashboard/charts/IssueTimelineChart.tsx`

### 8-3. 대시보드 페이지 (10분)
- [ ] `app/(dashboard)/personal/page.tsx`
- [ ] `app/components/dashboard/PersonalDashboard.tsx`
- [ ] `app/components/dashboard/TeamStatistics.tsx`

**완료 기준**: 개인 대시보드에서 나의 이슈 현황 차트 표시

---

## 🔔 Phase 9: 알림 시스템 (30분)

### 목표
- FR-090~FR-091 구현 (인앱 알림)

### 체크리스트
- [ ] `app/lib/repositories/notification.repository.ts` 작성
- [ ] `app/lib/services/notification.service.ts` 작성
  - [ ] createNotification
  - [ ] markAsRead
  - [ ] getUnreadNotifications
- [ ] `app/api/notifications/route.ts`
- [ ] `app/api/notifications/mark-read/route.ts`
- [ ] `app/lib/hooks/useNotifications.ts`
- [ ] `app/components/layout/Header.tsx` (알림 아이콘)
- [ ] `app/components/layout/NotificationDropdown.tsx`

**완료 기준**: 헤더에 알림 아이콘 + 드롭다운에서 알림 목록 확인

---

## 🚀 Phase 10: 배포 (30분)

### 목표
- Vercel 배포 및 실제 도메인 접속 가능

### 체크리스트
- [ ] `vercel` CLI 설치 (`npm i -g vercel`)
- [ ] `vercel` 명령어로 배포
- [ ] Vercel Dashboard → Settings → Environment Variables 설정
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] (기타 환경 변수)
- [ ] Google OAuth Redirect URI 업데이트
  - [ ] Google Cloud Console에서 배포 URL 추가
- [ ] `vercel --prod` 프로덕션 배포
- [ ] 실제 도메인 접속 확인
- [ ] 전체 flow 테스트
  - [ ] 회원가입
  - [ ] 팀 생성
  - [ ] 프로젝트 생성
  - [ ] 이슈 생성
  - [ ] 칸반 보드 드래그
  - [ ] AI 기능
  - [ ] 댓글 작성
  - [ ] 알림 확인

**완료 기준**: 실제 URL에서 모든 기능 정상 작동

---

## ✅ 최종 완료 조건

### 필수 기능 (P0)
- [ ] 인증 (회원가입, 로그인, OAuth)
- [ ] 팀 관리 (생성, 멤버 초대)
- [ ] 프로젝트 관리 (생성 시 기본 상태 자동 생성)
- [ ] 이슈 CRUD
- [ ] 칸반 보드 Drag & Drop
- [ ] 배포 완료

### 중요 기능 (P1)
- [ ] AI 요약/제안
- [ ] 댓글 시스템
- [ ] 대시보드

### 추가 기능 (P2)
- [ ] 알림 시스템
- [ ] 이메일 발송

---

## 🎯 성공 기준 체크

- [ ] 모든 필수 FR 구현 완료
- [ ] 배포 완료 및 접근 가능한 URL
- [ ] 실제 이메일 발송 작동
- [ ] AI 기능 작동
- [ ] Google OAuth 작동
- [ ] Drag & Drop 작동
- [ ] 대시보드 차트 표시

---

**작업 시작일**: 2025-11-29
**예상 완료일**: 2025-11-29 (8시간 내)
**실제 완료일**: _______
