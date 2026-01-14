# DevDaily PRD (Phase 1)

> 개발자를 위한 데일리 학습 플랫폼

---

## 1. 개요

### 서비스 소개
- **한 줄 설명**: 매일 5분, 개발 지식을 퀴즈로 복습하는 학습 플랫폼
- **타겟 유저**: 취준생, 주니어 개발자, CS 공부하는 사람
- **핵심 가치**: 꾸준한 학습 습관 형성 + 약점 파악

### 기술 스택
- Frontend: Next.js 15, TypeScript, TailwindCSS v4
- UI: Shadcn/ui
- Backend: Supabase (Auth, Database)
- 배포: Vercel

### Phase 1 목표
```
"데일리 퀴즈로 유저 습관 형성"

- 매일 방문하는 이유 만들기
- 스트릭으로 이탈 방지
- 오답 노트로 개인화 시작
```

---

## 2. 콘텐츠 전략 (핵심)

### 2.1 콘텐츠 구조

#### 카테고리 체계
```
Level 1 (대분류)
├── CS 기초
│   ├── 자료구조
│   ├── 알고리즘
│   ├── 운영체제
│   ├── 네트워크
│   ├── 데이터베이스
│   └── 컴퓨터구조
├── 프로그래밍 언어
│   ├── JavaScript
│   ├── TypeScript
│   ├── Python
│   └── Java
├── 프레임워크/라이브러리
│   ├── React
│   ├── Next.js
│   └── Node.js
└── 개발 상식
    ├── Git
    ├── 디자인 패턴
    └── 개발 용어
```

#### 퀴즈 유형
| 유형 | 설명 | 예시 |
|------|------|------|
| 객관식 (4지선다) | 가장 기본 | "시간복잡도 O(n log n)인 정렬은?" |
| O/X | 빠른 판단 | "HTTP는 stateless 프로토콜이다" |
| 빈칸 채우기 | 정확한 용어 | "SOLID 원칙 중 ___는 단일 책임을 의미한다" |
| 코드 결과 | 코드 이해 | "다음 코드의 출력값은?" |

#### 난이도 체계
```
⭐ Easy      - 기본 개념, 암기
⭐⭐ Medium   - 응용, 비교
⭐⭐⭐ Hard    - 심화, 함정 문제
```

### 2.2 콘텐츠 수집 전략

#### Phase 1-A: 초기 데이터 확보 (런칭 전)

**방법 1: AI 생성 + 수동 검수**
```
1. ChatGPT/Claude로 카테고리별 퀴즈 벌크 생성
2. 프롬프트 예시:
   "CS 자료구조 관련 4지선다 퀴즈 20개 만들어줘.
    포맷: { question, options[], answer, explanation, difficulty }"
3. 개발자 직접 검수 (정확성 확인)
4. 최소 500문제 확보 후 런칭
```

**방법 2: 기존 자료 정리**
```
- 기술 면접 질문 모음 → 퀴즈화
- CS 전공서적 핵심 개념 → 퀴즈화
- 유명 블로그 포스트 → 퀴즈화 (출처 명시)
```

**초기 목표 콘텐츠량**
| 카테고리 | 문제 수 | 우선순위 |
|----------|---------|----------|
| 자료구조 | 50 | 필수 |
| 알고리즘 | 50 | 필수 |
| 운영체제 | 40 | 필수 |
| 네트워크 | 40 | 필수 |
| 데이터베이스 | 30 | 필수 |
| JavaScript | 50 | 필수 |
| React | 30 | 선택 |
| 개발 용어 | 50 | 필수 |
| **총계** | **340+** | - |

#### Phase 1-B: 운영 중 확장

**방법 1: 관리자 직접 추가**
```
- 주 1회 신규 문제 10-20개 추가
- 시즌/트렌드 반영 (신기술 등)
- 유저 요청 카테고리 추가
```

**방법 2: 유저 기여 (Phase 2 이후)**
```
- 문제 제안 기능
- 제안 → 검수 → 채택 플로우
- 채택 시 포인트/배지 보상
```

**방법 3: 오답 기반 자동 확장**
```
- 많이 틀리는 문제 분석
- 해당 영역 문제 자동 추가 제안
- 난이도 자동 조정
```

### 2.3 콘텐츠 관리 전략

#### 품질 관리
```
1. 오류 신고 시스템
   - 유저가 "오류 신고" 버튼 클릭
   - 신고 유형: 정답 오류 / 오타 / 설명 부족 / 기타
   - 관리자 대시보드에서 확인 & 수정

2. 난이도 자동 조정
   - 정답률 80% 이상 → 난이도 하향 검토
   - 정답률 30% 이하 → 난이도 상향 or 문제 수정 검토

3. 문제 은퇴 시스템
   - 오래된 기술 (jQuery 등) → 아카이브
   - 신고 많은 문제 → 비활성화 후 검토
```

#### 데이터 구조 (Supabase)
```sql
-- 카테고리
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  parent_id uuid references categories(id),
  icon text,
  order_index int default 0,
  created_at timestamptz default now()
);

-- 퀴즈 문제
create table questions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) not null,
  type text not null check (type in ('multiple', 'ox', 'blank', 'code')),
  difficulty int not null check (difficulty between 1 and 3),
  question text not null,
  options jsonb, -- 객관식: ["옵션1", "옵션2", "옵션3", "옵션4"]
  answer text not null, -- 정답 (인덱스 or 텍스트)
  explanation text, -- 해설
  code_snippet text, -- 코드 문제용
  tags text[], -- 추가 태그
  source text, -- 출처
  is_active boolean default true,
  stats jsonb default '{"attempts": 0, "correct": 0}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 문제 신고
create table question_reports (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references questions(id) not null,
  user_id uuid references profiles(id) not null,
  type text not null check (type in ('wrong_answer', 'typo', 'unclear', 'other')),
  description text,
  status text default 'pending' check (status in ('pending', 'resolved', 'rejected')),
  created_at timestamptz default now()
);
```

### 2.4 콘텐츠 확장 로드맵

```
MVP (런칭)
└── 340+ 문제, 8개 카테고리

1개월 후
└── 500+ 문제, 유저 신고 반영

3개월 후
└── 1000+ 문제, 유저 기여 시스템

6개월 후
└── 2000+ 문제, 공유 덱, 기업 문제
```

---

## 3. 핵심 기능 (Phase 1)

### 3.1 데일리 퀴즈

**기능 상세**
- [ ] 매일 자정 기준 5문제 출제
- [ ] 유저 설정 카테고리에서 출제
- [ ] 난이도 믹스 (Easy 2 / Medium 2 / Hard 1)
- [ ] 풀이 시간 제한 없음 (부담 최소화)
- [ ] 문제별 즉시 정답/해설 확인
- [ ] 하루에 한 번만 풀 수 있음

**출제 로직**
```typescript
// 의사 코드
function generateDailyQuiz(userId: string) {
  const userCategories = getUserCategories(userId)
  const solvedQuestions = getUserSolvedQuestions(userId)
  
  const questions = selectQuestions({
    categories: userCategories,
    exclude: solvedQuestions, // 이미 푼 문제 제외
    difficulty: {
      easy: 2,
      medium: 2,
      hard: 1
    },
    total: 5
  })
  
  return shuffle(questions)
}
```

### 3.2 오답 노트

**기능 상세**
- [ ] 틀린 문제 자동 저장
- [ ] 카테고리/난이도별 필터
- [ ] 해설 다시 보기
- [ ] "다시 풀기" 기능
- [ ] 복습 완료 체크

**복습 알고리즘 (간단 버전)**
```
1회 틀림 → 1일 후 복습 권장
2회 틀림 → 3일 후 복습 권장  
3회 틀림 → 7일 후 복습 권장
```

### 3.3 스트릭 & 통계

**스트릭**
- [ ] 연속 출석일 표시
- [ ] 스트릭 캘린더 (GitHub 잔디 스타일)
- [ ] 스트릭 끊기기 전 푸시 알림 (선택)

**통계**
- [ ] 총 푼 문제 수
- [ ] 카테고리별 정답률
- [ ] 약점 카테고리 하이라이트
- [ ] 주간/월간 추이

### 3.4 카테고리 설정

**기능 상세**
- [ ] 관심 카테고리 선택 (최소 3개)
- [ ] 카테고리별 난이도 선호 설정
- [ ] 온보딩에서 초기 설정
- [ ] 언제든 수정 가능

---

## 4. 데이터 모델

### 전체 ERD

```
[profiles] 1 ──── N [quiz_attempts]
     │                    │
     │                    N
     │              [quiz_answers]
     │                    │
     │                    1
     │              [questions] N ──── 1 [categories]
     │                    │
     │                    N
     └──── N [wrong_notes]
     │
     └──── N [user_categories]
     │
     └──── 1 [user_streaks]
```

### 테이블 스키마

```sql
-- 프로필 (auth.users 확장)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  nickname text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 유저 선택 카테고리
create table user_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  category_id uuid references categories(id) not null,
  difficulty_preference int default 2, -- 1-3
  created_at timestamptz default now(),
  unique(user_id, category_id)
);

-- 퀴즈 시도 (일별)
create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null default current_date,
  total_questions int not null default 5,
  correct_count int not null default 0,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- 퀴즈 답변 (문제별)
create table quiz_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references quiz_attempts(id) on delete cascade not null,
  question_id uuid references questions(id) not null,
  user_answer text not null,
  is_correct boolean not null,
  time_spent int, -- 초 단위
  created_at timestamptz default now()
);

-- 오답 노트
create table wrong_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  question_id uuid references questions(id) not null,
  wrong_count int default 1,
  last_wrong_at timestamptz default now(),
  next_review_at timestamptz,
  is_resolved boolean default false,
  created_at timestamptz default now(),
  unique(user_id, question_id)
);

-- 스트릭
create table user_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade unique not null,
  current_streak int default 0,
  longest_streak int default 0,
  last_quiz_date date,
  total_quiz_days int default 0,
  updated_at timestamptz default now()
);
```

---

## 5. 페이지 구조

```
/ (랜딩)
├── /login (로그인)
├── /onboarding (카테고리 선택)
├── /quiz
│   ├── / (오늘의 퀴즈)
│   └── /result (결과)
├── /wrong-notes (오답 노트)
├── /stats (통계)
├── /settings (설정)
│   └── /categories (카테고리 관리)
└── /admin (관리자)
    ├── /questions (문제 관리)
    └── /reports (신고 관리)
```

---

## 6. 화면 명세

### 6.1 랜딩 페이지 (/)
```
- 히어로 섹션: 서비스 소개 + CTA
- 기능 소개: 데일리 퀴즈, 오답 노트, 스트릭
- 카테고리 미리보기
- 로그인/시작하기 버튼
```

### 6.2 온보딩 (/onboarding)
```
Step 1: 닉네임 설정
Step 2: 관심 카테고리 선택 (최소 3개)
Step 3: 난이도 선호 설정
→ 완료 후 첫 퀴즈로 이동
```

### 6.3 데일리 퀴즈 (/quiz)
```
- 상단: 진행률 (1/5, 2/5...)
- 중앙: 문제 카드
  - 카테고리 태그
  - 난이도 표시
  - 문제 텍스트
  - 코드 블록 (해당 시)
  - 선택지 버튼들
- 하단: 다음 버튼

[정답 확인 모달]
- O/X 표시
- 정답 표시
- 해설
- "오류 신고" 버튼
- 다음 문제 버튼
```

### 6.4 결과 페이지 (/quiz/result)
```
- 점수: 4/5
- 소요 시간
- 스트릭 업데이트 (+1일!)
- 문제별 요약 (O/X 리스트)
- 틀린 문제 → 오답 노트 저장됨
- CTA: 오답 노트 보기 / 내일 또 만나요
```

### 6.5 오답 노트 (/wrong-notes)
```
- 필터: 카테고리 / 난이도 / 복습 필요
- 문제 카드 리스트
  - 문제 미리보기
  - 틀린 횟수
  - 마지막으로 틀린 날
  - "다시 풀기" 버튼
  - "복습 완료" 체크
```

### 6.6 통계 (/stats)
```
- 스트릭 캘린더 (잔디)
- 숫자 요약
  - 총 문제 / 정답률 / 현재 스트릭
- 카테고리별 정답률 차트
- 약점 카테고리 하이라이트
- 주간 추이 그래프
```

---

## 7. 관리자 기능

### 7.1 문제 관리 (/admin/questions)
```
- 문제 목록 (페이지네이션)
- 필터: 카테고리 / 난이도 / 활성화 상태
- 문제 추가/수정/삭제
- 벌크 업로드 (CSV/JSON)
- 문제 통계 (정답률, 시도 수)
```

### 7.2 신고 관리 (/admin/reports)
```
- 신고 목록
- 상태별 필터 (대기/처리/반려)
- 신고 상세 보기
- 문제 바로 수정
- 처리 완료/반려
```

---

## 8. 비기능 요구사항

### 성능
- 퀴즈 로딩 2초 이내
- 문제 전환 즉시 (프리로드)

### 보안
- RLS 필수
- 관리자 권한 분리
- 문제 답안 클라이언트 노출 방지

### UX
- 모바일 최적화 (출퇴근 풀이)
- 오프라인 지원 (Phase 2)
- 다크 모드

---

## 9. 마일스톤

### Week 1: 기반 구축
- [ ] 프로젝트 세팅 (Next.js, Supabase, Shadcn)
- [ ] 인증 (카카오 OAuth)
- [ ] DB 스키마 생성
- [ ] 기본 레이아웃

### Week 2: 퀴즈 코어
- [ ] 문제 데이터 시드 (최소 100문제)
- [ ] 데일리 퀴즈 로직
- [ ] 퀴즈 UI
- [ ] 결과 페이지

### Week 3: 오답 & 스트릭
- [ ] 오답 노트 CRUD
- [ ] 스트릭 시스템
- [ ] 통계 페이지
- [ ] 온보딩 플로우

### Week 4: 관리 & 배포
- [ ] 관리자 페이지 (문제 추가)
- [ ] 신고 시스템
- [ ] 문제 추가 (300문제 목표)
- [ ] 배포 & 버그 수정

---

## 10. 성공 지표

### 런칭 후 1개월
- DAU: 100명
- 평균 스트릭: 5일
- 리텐션 (D7): 30%

### 런칭 후 3개월
- DAU: 500명
- 총 문제 수: 1000개
- 유저 신고 처리율: 90%

---

## 부록: 콘텐츠 생성 프롬프트 예시

### AI 문제 생성 프롬프트

```
당신은 CS 전공 교수입니다. 
다음 조건으로 퀴즈 문제를 생성해주세요.

카테고리: 자료구조
난이도: Medium
문제 유형: 4지선다

요구사항:
1. 실제 면접에서 나올 법한 실용적인 문제
2. 오답 선택지도 그럴듯해야 함
3. 해설은 간결하지만 핵심을 포함

출력 포맷 (JSON):
{
  "question": "문제 텍스트",
  "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
  "answer": "정답 인덱스 (0-3)",
  "explanation": "해설",
  "tags": ["관련 태그"]
}

10문제 생성해주세요.
```

### 코드 문제 생성 프롬프트

```
다음 조건으로 코드 출력 예측 문제를 생성해주세요.

언어: JavaScript
난이도: Medium
주제: 클로저, 호이스팅, this 바인딩

요구사항:
1. 코드는 10줄 이내
2. 흔히 틀리는 함정 포함
3. 실무에서 볼 수 있는 패턴

출력 포맷 (JSON):
{
  "question": "다음 코드의 출력 결과는?",
  "code_snippet": "코드",
  "options": ["출력1", "출력2", "출력3", "출력4"],
  "answer": "정답 인덱스",
  "explanation": "해설"
}
```