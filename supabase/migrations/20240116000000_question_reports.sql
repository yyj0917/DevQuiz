-- ================================================
-- 문제 신고 테이블
-- ================================================

create table if not exists question_reports (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references questions(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,

  -- 신고 유형 (4가지)
  type text not null check (type in (
    'question_error',    -- 문제에 오류가 있다
    'option_error',      -- 선택지에 오류가 있다
    'answer_mismatch',   -- 정답과 설명이 다르다
    'explanation_error'  -- 설명이 틀렸다
  )),

  -- 추가 설명 (선택)
  description text,

  -- 처리 상태
  status text not null default 'pending' check (status in (
    'pending',   -- 대기 중
    'reviewed',  -- 검토 중
    'resolved',  -- 해결됨
    'rejected'   -- 반려됨
  )),

  -- 어드민 메모 (처리 시 작성)
  admin_note text,
  resolved_at timestamptz,
  resolved_by uuid references profiles(id),

  created_at timestamptz default now(),

  -- 동일 유저가 같은 문제에 같은 유형으로 중복 신고 방지
  unique(question_id, user_id, type)
);

-- RLS 정책
alter table question_reports enable row level security;

-- 사용자: 자신의 신고만 조회/생성 가능
create policy "Users can view own reports"
  on question_reports for select
  using (auth.uid() = user_id);

create policy "Users can create reports"
  on question_reports for insert
  with check (auth.uid() = user_id);

-- 인덱스
create index idx_question_reports_question on question_reports(question_id);
create index idx_question_reports_status on question_reports(status);
create index idx_question_reports_created on question_reports(created_at desc);
create index idx_question_reports_user on question_reports(user_id);
