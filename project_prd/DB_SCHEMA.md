## DB schema 문서

제공해드린 SQL 스키마에 대한 상세 문서입니다. 개발 팀(프론트엔드/백엔드)이 데이터 구조를 명확히 이해하고 개발에 착수할 수 있도록 정리했습니다.

---

# Jira Lite Extended - Database Schema Documentation

## 1. 개요 (Overview)

- **Database Engine**: PostgreSQL 14+
- **Naming Convention**: `snake_case` (테이블 및 컬럼명)
- **Key Strategy**:
    - **Soft Delete**: 주요 데이터 삭제 시 `deleted_at` 타임스탬프 기록 (물리 삭제 X)
    - **Rbac**: `team_members.role`을 통한 역할 기반 접근 제어
    - **Flexible Kanban**: 프로젝트별 커스텀 상태(`project_states`) 지원
    - **AI Caching**: 비용 절감을 위한 AI 응답 결과 해시 캐싱

---

## 2. ERD (Entity Relationship Diagram)

데이터 간의 주요 관계를 시각화한 구조도입니다.

코드 스니펫

# 

`erDiagram
    USERS ||--o{ TEAM_MEMBERS : "joins"
    USERS ||--o{ ISSUES : "authored/assigned"
    TEAMS ||--o{ TEAM_MEMBERS : "has"
    TEAMS ||--o{ PROJECTS : "owns"
    PROJECTS ||--o{ PROJECT_STATES : "defines columns"
    PROJECTS ||--o{ ISSUES : "contains"
    PROJECT_STATES ||--o{ ISSUES : "current status"
    ISSUES ||--o{ COMMENTS : "has"
    ISSUES ||--o{ SUBTASKS : "has"
    ISSUES ||--o{ AI_CACHES : "caches"
    ISSUES }|--|{ PROJECT_LABELS : "tagged with"

    USERS {
        uuid id PK
        string email
        string provider "google/email"
    }
    TEAMS {
        uuid id PK
        string name
    }
    PROJECTS {
        uuid id PK
        string name
        boolean is_archived
    }
    ISSUES {
        uuid id PK
        string title
        double position "LexoRank"
    }`

---

## 3. 테이블 상세 명세 (Table Details)

### 3.1 사용자 및 인증 (User & Auth)

### `users`

시스템의 모든 사용자 정보입니다. 이메일 가입자와 Google OAuth 가입자를 모두 수용합니다.

| **컬럼명** | **타입** | **설명** | **비고** |
| --- | --- | --- | --- |
| `id` | UUID | Primary Key |  |
| `email` | VARCHAR(255) | 사용자 이메일 | Unique |
| `password_hash` | VARCHAR(255) | 비밀번호 해시 | OAuth 유저는 NULL 가능 |
| `name` | VARCHAR(50) | 표시 이름 |  |
| `google_id` | VARCHAR(255) | Google OAuth 고유 ID | Unique, OAuth 연동 시 사용 |
| `deleted_at` | TIMESTAMP | Soft Delete 여부 | NULL이면 활성 사용자 |

### `password_reset_tokens`

비밀번호 찾기 시 발송되는 토큰 관리 테이블입니다.

| **컬럼명** | **타입** | **설명** | **비고** |
| --- | --- | --- | --- |
| `token` | VARCHAR(255) | 인증 토큰 |  |
| `expires_at` | TIMESTAMP | 만료 시간 | 생성 후 1시간 |

---

### 3.2 팀 관리 (Team Management)

### `teams`

사용자가 속한 그룹(조직)입니다.

| **컬럼명** | **타입** | **설명** | **비고** |
| --- | --- | --- | --- |
| `id` | UUID | Primary Key |  |
| `owner_id` | UUID | 팀 소유자 ID | `users.id` FK |

### `team_members`

사용자와 팀의 다대다 관계를 해소하며, 팀 내 역할을 정의합니다.

| **컬럼명** | **타입** | **설명** | **비고** |
| --- | --- | --- | --- |
| `team_id` | UUID | 팀 ID | FK |
| `user_id` | UUID | 사용자 ID | FK |
| `role` | ENUM | 역할 | `OWNER`, `ADMIN`, `MEMBER` |

### `team_invitations`

아직 가입하지 않거나 팀에 합류하지 않은 멤버를 위한 초대 정보입니다.

| **컬럼명** | **타입** | **설명** | **비고** |
| --- | --- | --- | --- |
| `email` | VARCHAR | 초대받은 이메일 |  |
| `token` | VARCHAR | 초대 수락용 토큰 |  |
| `expires_at` | TIMESTAMP | 만료 시간 | 7일 |

### `team_activity_logs`

팀 내에서 발생하는 주요 변경 사항(Audit Log)을 기록합니다.

| **컬럼명** | **타입** | **설명** | **비고** |
| --- | --- | --- | --- |
| `target_type` | VARCHAR | 대상 종류 | 예: 'ISSUE', 'MEMBER' |
| `action_type` | VARCHAR | 행위 종류 | 예: 'CREATE', 'UPDATE' |
| `details` | JSONB | 변경 상세 내용 | 이전 값/새로운 값 저장 |

---

### 3.3 프로젝트 및 칸반 (Project & Kanban)

### `projects`

이슈를 관리하는 작업 단위입니다.

| **컬럼명** | **타입** | **설명** | **비고** |
| --- | --- | --- | --- |
| `team_id` | UUID | 소속 팀 ID | FK |
| `is_archived` | BOOLEAN | 아카이브 여부 | True 시 읽기 전용 취급 |

### `project_states` (핵심)

**칸반 보드의 컬럼**을 정의합니다. 프로젝트마다 서로 다른 진행 상태를 가질 수 있습니다.

| **컬럼명** | **타입** | **설명** | **비고** |
| --- | --- | --- | --- |
| `project_id` | UUID | 프로젝트 ID | FK |
| `name` | VARCHAR(30) | 상태 이름 | 예: Backlog, Done |
| `position` | DOUBLE | 컬럼 표시 순서 |  |
| `wip_limit` | INT | Work In Progress 제한 | NULL이면 무제한 |

---

### 3.4 이슈 트래킹 (Issue Tracking)

### `issues`

가장 핵심적인 작업 단위(티켓)입니다.

| **컬럼명** | **타입** | **설명** | **비고** |
| --- | --- | --- | --- |
| `project_id` | UUID | 프로젝트 ID | FK |
| `state_id` | UUID | **현재 상태(컬럼)** | `project_states.id` FK |
| `author_id` | UUID | 작성자 | FK |
| `assignee_id` | UUID | 담당자 | FK (Nullable) |
| `priority` | ENUM | 우선순위 | `HIGH`, `MEDIUM`, `LOW` |
| `board_position` | DOUBLE | **컬럼 내 순서** | Drag & Drop 정렬용 |
| `description` | TEXT | 본문 | 마크다운 지원 권장 |

### `subtasks`

이슈 내부의 체크리스트 항목입니다.

| **컬럼명** | **타입** | **설명** | **비고** |
| --- | --- | --- | --- |
| `issue_id` | UUID | 부모 이슈 ID | FK |
| `is_completed` | BOOLEAN | 완료 여부 |  |

### `comments`

이슈에 달린 댓글입니다.

| **컬럼명** | **타입** | **설명** | **비고** |
| --- | --- | --- | --- |
| `content` | TEXT | 댓글 내용 | 1000자 제한 |

---

### 3.5 AI 기능 및 기타 (AI & Utils)

### `ai_caches`

LLM API 호출 비용 절감 및 속도 향상을 위한 캐시 테이블입니다.

| **컬럼명** | **타입** | **설명** | **비고** |
| --- | --- | --- | --- |
| `issue_id` | UUID | 대상 이슈 | FK |
| `feature_type` | ENUM | 기능 종류 | `SUMMARY`, `SUGGESTION` 등 |
| `input_hash` | VARCHAR | **입력 데이터 해시** | SHA256(Description) 등 |
| `output_text` | TEXT | AI 응답 결과 |  |
- **Logic**: `input_hash`가 변경되면 캐시 Miss로 간주하여 API를 재호출합니다.

### `ai_usage_logs`

Rate Limiting(사용량 제한) 구현을 위한 로그입니다.

| **컬럼명** | **타입** | **설명** | **비고** |
| --- | --- | --- | --- |
| `user_id` | UUID | 사용자 ID |  |
| `created_at` | TIMESTAMP | 요청 시간 |  |

---

## 4. 구현 가이드 (Implementation Guide)

개발 시 유의해야 할 주요 로직 및 패턴입니다.

### 4.1 상태 관리 (Status Management)

- **초기화**: 프로젝트 생성 시, 백엔드는 반드시 해당 프로젝트에 대해 기본 3개 상태(`Backlog`, `In Progress`, `Done`)를 `project_states` 테이블에 INSERT 해야 합니다.
- **이동**: 이슈의 상태 변경은 `issues.state_id`를 업데이트하는 것으로 처리합니다.

### 4.2 Drag & Drop 정렬 (Ordering)

- **Position 필드**: `issues.board_position`과 `project_states.position`은 `DOUBLE PRECISION` 타입입니다.
- **삽입 로직**:
    - 두 아이템 사이에 삽입 시: `(Prev_Item.pos + Next_Item.pos) / 2`
    - 충돌 또는 정밀도 한계 도달 시: 전체 재정렬(Rebalancing) 로직 수행 (가산점 요소).

### 4.3 데이터 조회 (Soft Delete)

- **기본 규칙**: 데이터를 조회하는 모든 쿼리(`SELECT`)에는 반드시 `WHERE deleted_at IS NULL` 조건이 포함되어야 합니다.
- **ORM 사용 시**: Prisma, TypeORM, Sequelize 등의 "Soft Delete Middleware" 기능을 활성화하여 자동화하는 것을 권장합니다.

### 4.4 AI 캐싱 전략

1. 사용자가 "요약하기" 버튼 클릭.
2. 서버는 현재 `issues.description`의 해시값(`sha256`) 생성.
3. DB `ai_caches`에서 `issue_id`와 `input_hash`가 일치하는 레코드 조회.
4. 존재하면 `output_text` 반환 (API 호출 X).
5. 없으면 LLM API 호출 -> 결과 반환 및 `ai_caches`에 저장.