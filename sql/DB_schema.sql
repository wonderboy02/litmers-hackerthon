-- 1. ENUMs: 상태값 표준화
CREATE TYPE user_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
CREATE TYPE priority_level AS ENUM ('HIGH', 'MEDIUM', 'LOW');
CREATE TYPE ai_feature_type AS ENUM ('SUMMARY', 'SUGGESTION', 'COMMENT_SUMMARY');

-- 2. Users: 사용자 (FR-001 ~ FR-007)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255), -- Google Login 시 NULL
    name VARCHAR(50) NOT NULL,
    profile_image TEXT,
    google_id VARCHAR(255) UNIQUE, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft Delete
);

-- 3. Password Reset Tokens (FR-003)
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- 유저 물리 삭제 시 토큰도 삭제
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Teams (FR-010 ~ FR-012)
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 5. Team Members (FR-013 ~ FR-018)
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id), -- 팀 물리 삭제는 거의 없으므로 제약 유지
    user_id UUID NOT NULL REFERENCES users(id),
    role user_role NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- 6. Team Invitations (FR-013)
CREATE TABLE team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    inviter_id UUID NOT NULL REFERENCES users(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Team Activity Logs (FR-019)
-- 팀 단위의 거시적인 이벤트(멤버 합류, 프로젝트 생성 등) 기록
CREATE TABLE team_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id),
    actor_id UUID REFERENCES users(id),
    target_type VARCHAR(50) NOT NULL, -- 'PROJECT', 'MEMBER'
    target_id UUID,
    action_type VARCHAR(50) NOT NULL, -- 'CREATED', 'DELETED', 'JOINED', 'LEFT'
    details JSONB, -- 스냅샷 데이터
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Projects (FR-020 ~ FR-026)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id),
    owner_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_archived BOOLEAN DEFAULT FALSE, -- FR-026
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 9. Favorite Projects (FR-027)
CREATE TABLE favorite_projects (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, project_id)
);

-- 10. Project States (FR-053, FR-054)
-- 커스텀 컬럼 정의
CREATE TABLE project_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(30) NOT NULL,
    position DOUBLE PRECISION NOT NULL, -- 순서
    wip_limit INTEGER, -- FR-054
    color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Project Labels (FR-038)
CREATE TABLE project_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(30) NOT NULL,
    color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Issues (FR-030 ~ FR-037)
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id),
    state_id UUID NOT NULL REFERENCES project_states(id),
    author_id UUID NOT NULL REFERENCES users(id),
    assignee_id UUID REFERENCES users(id),
    
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority priority_level DEFAULT 'MEDIUM', -- FR-037
    due_date TIMESTAMP WITH TIME ZONE,
    
    board_position DOUBLE PRECISION NOT NULL DEFAULT 0, -- FR-052
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 13. Issue Histories (FR-039) **[NEW]**
-- 이슈 변경 이력을 전용으로 관리 (팀 로그와 분리)
CREATE TABLE issue_histories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE, -- 이슈가 물리 삭제되면 히스토리도 의미 없음
    actor_id UUID REFERENCES users(id), -- 변경한 사람
    
    field_name VARCHAR(50) NOT NULL, -- 'STATUS', 'ASSIGNEE', 'PRIORITY', 'DUE_DATE'
    old_value TEXT, -- 이전 값 (문자열로 변환하여 저장)
    new_value TEXT, -- 새로운 값
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Issue Labels Mapping (FR-038)
CREATE TABLE issue_labels (
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    label_id UUID NOT NULL REFERENCES project_labels(id) ON DELETE CASCADE,
    PRIMARY KEY (issue_id, label_id)
);

-- 15. Subtasks (FR-039-2)
CREATE TABLE subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    position DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Comments (FR-060 ~ FR-063)
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 17. AI Caches (FR-040, FR-041, FR-045)
CREATE TABLE ai_caches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    feature_type ai_feature_type NOT NULL,
    input_hash VARCHAR(64) NOT NULL, -- 변경 감지용 Hash
    output_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(issue_id, feature_type, input_hash)
);

-- 18. AI Usage Logs (FR-042)
CREATE TABLE ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    feature_type ai_feature_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. Notifications (FR-090, FR-091)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'ASSIGNED', 'COMMENT', 'WARNING_DUE', etc.
    message VARCHAR(255) NOT NULL,
    reference_id UUID, -- 클릭 시 이동할 Target ID
    reference_type VARCHAR(50), -- 'ISSUE', 'PROJECT', 'TEAM'
    is_read BOOLEAN DEFAULT FALSE, -- 읽음 처리
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. Indexes for Performance (FR-036) **[Explicitly Added]**
CREATE INDEX idx_issues_search_title ON issues(title); -- 제목 검색
CREATE INDEX idx_issues_project_state ON issues(project_id, state_id); -- 칸반 보드 조회
CREATE INDEX idx_issues_assignee ON issues(assignee_id); -- 내 담당 이슈 조회
CREATE INDEX idx_issues_deleted_at ON issues(deleted_at) WHERE deleted_at IS NULL; -- Soft Delete 필터링 최적화
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = FALSE; -- 안 읽은 알림 조회
CREATE INDEX idx_issue_histories_issue ON issue_histories(issue_id); -- 히스토리 조회