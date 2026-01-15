-- ============================================================================
-- Phase 4: Category Quiz & Mypage Extension
-- ============================================================================

-- ============================================================================
-- 1. SAVED_QUESTIONS TABLE (Bookmark)
-- ============================================================================
CREATE TABLE saved_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- ============================================================================
-- 2. CATEGORY_QUIZ_ATTEMPTS TABLE
-- ============================================================================
CREATE TABLE category_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'random' CHECK (mode IN ('random', 'wrong_only')),
  question_count INTEGER NOT NULL DEFAULT 10,
  correct_count INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. ALTER QUIZ_ANSWERS TABLE
-- ============================================================================
ALTER TABLE quiz_answers
ADD COLUMN category_attempt_id UUID REFERENCES category_quiz_attempts(id) ON DELETE CASCADE;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Saved questions indexes
CREATE INDEX idx_saved_questions_user ON saved_questions(user_id);
CREATE INDEX idx_saved_questions_question ON saved_questions(question_id);
CREATE INDEX idx_saved_questions_created ON saved_questions(created_at DESC);

-- Category quiz attempts indexes
CREATE INDEX idx_category_attempts_user ON category_quiz_attempts(user_id);
CREATE INDEX idx_category_attempts_category ON category_quiz_attempts(category_id);
CREATE INDEX idx_category_attempts_created ON category_quiz_attempts(created_at DESC);
CREATE INDEX idx_category_attempts_user_category ON category_quiz_attempts(user_id, category_id);

-- Quiz answers indexes
CREATE INDEX idx_quiz_answers_question ON quiz_answers(question_id);
CREATE INDEX idx_quiz_answers_is_correct ON quiz_answers(is_correct);
CREATE INDEX idx_quiz_answers_category_attempt ON quiz_answers(category_attempt_id);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE saved_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SAVED_QUESTIONS POLICIES
-- ============================================================================
CREATE POLICY "Users can view own saved questions"
  ON saved_questions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved questions"
  ON saved_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved questions"
  ON saved_questions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own saved questions"
  ON saved_questions FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- CATEGORY_QUIZ_ATTEMPTS POLICIES
-- ============================================================================
CREATE POLICY "Users can view own category attempts"
  ON category_quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own category attempts"
  ON category_quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own category attempts"
  ON category_quiz_attempts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own category attempts"
  ON category_quiz_attempts FOR DELETE
  USING (auth.uid() = user_id);
