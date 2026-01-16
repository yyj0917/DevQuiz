// ============================================================================
// DAILY QUIZ GENERATION LOGIC
// ============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { DailyQuiz, DailyQuizQuestion } from '@/types/quiz';
import { QuizGenerationError } from '@/lib/errors';
import { shuffleArray } from './utils';
import { getTodayDateKey } from './utils';

type SupabaseClientType = SupabaseClient<Database>;

interface QuizGenerationOptions {
  userId: string;
  quizDate: string;
  supabase: SupabaseClientType;
}

/**
 * 유저의 관심 카테고리 목록 조회
 */
async function getUserCategories(
  userId: string,
  supabase: SupabaseClientType
): Promise<string[]> {
  type UserCategoryWithCategory = {
    categories: { id: string; slug: string } | null;
  };
  
  const { data: userCategories, error } = await supabase
    .from('user_categories')
    .select('categories(id, slug)')
    .eq('user_id', userId) as { data: UserCategoryWithCategory[] | null; error: unknown };

  if (error) {
    throw new QuizGenerationError('유저 카테고리 조회 실패', 'CATEGORY_FETCH_ERROR');
  }

  if (!userCategories || userCategories.length === 0) {
    throw new QuizGenerationError('관심 카테고리가 설정되지 않았습니다', 'NO_CATEGORIES');
  }

  // 중첩된 카테고리 구조에서 category_id 추출
  const categoryIds = userCategories
    .map((uc) => {
      const category = uc.categories;
      return category?.id;
    })
    .filter((id): id is string => id !== undefined);

  return categoryIds;
}

/**
 * 이미 푼 문제 ID 목록 조회
 * (quiz_answers는 attempt_id를 통해 연결되므로, user의 모든 attempt를 통해 조회)
 */
async function getAnsweredQuestionIds(
  userId: string,
  supabase: SupabaseClientType
): Promise<string[]> {
  // 사용자의 모든 attempt 조회
  type AttemptId = { id: string };
  const { data: attempts, error: attemptsError } = await supabase
    .from('quiz_attempts')
    .select('id')
    .eq('user_id', userId) as { data: AttemptId[] | null; error: unknown };

  if (attemptsError || !attempts || attempts.length === 0) {
    return [];
  }

  const attemptIds = attempts.map((a) => a.id);

  // 해당 attempt들의 모든 답변 조회
  type AnswerQuestionId = { question_id: string };
  const { data: answers, error } = await supabase
    .from('quiz_answers')
    .select('question_id')
    .in('attempt_id', attemptIds)
    .order('answered_at', { ascending: false }) as { data: AnswerQuestionId[] | null; error: unknown };

  if (error) {
    // 에러가 발생해도 빈 배열 반환 (문제 없음)
    return [];
  }

  // 중복 제거
  const uniqueQuestionIds = Array.from(new Set(answers?.map((a) => a.question_id) || []));
  return uniqueQuestionIds;
}

/**
 * 난이도별 문제 샘플링
 */
async function sampleQuestionsByDifficulty(
  categoryIds: string[],
  answeredQuestionIds: string[],
  difficulty: 1 | 2 | 3,
  count: number,
  supabase: SupabaseClientType
): Promise<DailyQuizQuestion[]> {
  let query = supabase
    .from('questions')
    .select('*, categories(slug, name)')
    .in('category_id', categoryIds)
    .eq('difficulty', difficulty)
    .eq('is_active', true);

    // 이미 푼 문제 제외
    if (answeredQuestionIds.length > 0) {
      // 각 ID를 개별적으로 .neq() 체이닝하거나, 배열을 사용
      // Supabase에서는 길이가 긴 배열의 경우 여러 번 필터링하거나
      // 일단 필터링된 결과를 가져온 후 JavaScript에서 필터링
      // 간단한 방법: 각 ID에 대해 .neq() 체이닝 (성능은 낮지만 정확함)
      for (const id of answeredQuestionIds) {
        query = query.neq('id', id);
      }
    }

  type QuestionWithCategory = {
    id: string;
    category_id: string;
    difficulty: number;
    type: string;
    question: string;
    code_snippet: string | null;
    options: string[] | null;
    answer: string;
    explanation: string | null;
    categories: { slug: string; name: string } | null;
  };
  
  const { data: questions, error } = await query as { data: QuestionWithCategory[] | null; error: unknown };

  if (error) {
    throw new QuizGenerationError(
      `난이도 ${difficulty} 문제 조회 실패`,
      'QUESTION_FETCH_ERROR'
    );
  }

  if (!questions || questions.length === 0) {
    return [];
  }

  // 랜덤 셔플 후 요청 개수만큼 선택
  const shuffled = shuffleArray(questions);
  const selected = shuffled.slice(0, count);

  return selected.map((q) => {
    const category = q.categories;
    return {
      id: q.id,
      category: category?.name || 'Unknown',
      category_id: q.category_id,
      difficulty: q.difficulty as 1 | 2 | 3,
      type: q.type as 'multiple' | 'ox' | 'blank' | 'code',
      question: q.question,
      code_snippet: q.code_snippet,
      options: q.options as string[] | null,
      answer: q.answer,
      explanation: q.explanation,
    };
  });
}

/**
 * 데일리 퀴즈 생성
 * - 유저가 선택한 카테고리에서만 출제
 * - 이미 푼 문제 제외
 * - 난이도 배분: Easy 2, Medium 2, Hard 1
 * - 오늘 이미 풀었으면 해당 퀴즈 반환
 */
export async function generateDailyQuiz({
  userId,
  quizDate,
  supabase,
}: QuizGenerationOptions): Promise<DailyQuiz> {
  // 1) 기존 오늘 퀴즈 존재 여부 확인
  type ExistingAttempt = { id: string; date: string };
  const { data: existingAttempt } = await supabase
    .from('quiz_attempts')
    .select('id, date')
    .eq('user_id', userId)
    .eq('date', quizDate)
    .maybeSingle() as { data: ExistingAttempt | null };

  if (existingAttempt) {
    // 기존 attempt가 있으면 해당 attempt의 질문들을 조회
    type AnswerWithQuestion = {
      questions: {
        id: string;
        category_id: string;
        difficulty: number;
        type: string;
        question: string;
        code_snippet: string | null;
        options: string[] | null;
        answer: string;
        explanation: string | null;
        categories: { slug: string; name: string } | null;
      };
    };
    const { data: answers } = await supabase
      .from('quiz_answers')
      .select('questions(*, categories(slug, name))')
      .eq('attempt_id', existingAttempt.id) as { data: AnswerWithQuestion[] | null };

    if (answers && answers.length > 0) {
      const questions = answers.map((a) => {
        const q = a.questions;
        const category = q.categories;
        return {
          id: q.id,
          category: category?.name || 'Unknown',
          category_id: q.category_id,
          difficulty: q.difficulty as 1 | 2 | 3,
          type: q.type as 'multiple' | 'ox' | 'blank' | 'code',
          question: q.question,
          code_snippet: q.code_snippet,
          options: q.options as string[] | null,
          answer: q.answer,
          explanation: q.explanation,
        };
      });

      return {
        id: existingAttempt.id,
        date: quizDate,
        questions,
      };
    }
  }

  // 2) 유저 관심 카테고리 조회
  const categoryIds = await getUserCategories(userId, supabase);

  // 3) 이미 푼 문제 제외 목록 조회
  const answeredQuestionIds = await getAnsweredQuestionIds(userId, supabase);

  // 4) 난이도별 문제 샘플링
  const [easyQuestions, mediumQuestions, hardQuestions] = await Promise.all([
    sampleQuestionsByDifficulty(categoryIds, answeredQuestionIds, 1, 2, supabase),
    sampleQuestionsByDifficulty(categoryIds, answeredQuestionIds, 2, 2, supabase),
    sampleQuestionsByDifficulty(categoryIds, answeredQuestionIds, 3, 1, supabase),
  ]);

  // 5) 전체 문제 수 확인 및 부족 시 fallback
  const allQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];

  if (allQuestions.length < 5) {
    // 부족한 개수만큼 전체 카테고리에서 추가로 샘플링 (난이도 무시)
    const needed = 5 - allQuestions.length;
    const existingIds = allQuestions.map((q) => q.id);
    const allAnsweredIds = [...answeredQuestionIds, ...existingIds];

    const fallbackQuery = supabase
      .from('questions')
      .select('*, categories(slug, name)')
      .in('category_id', categoryIds)
      .eq('is_active', true)
      .limit(needed * 2); // 충분히 가져온 후 필터링

    const { data: fallbackQuestionsRaw } = await fallbackQuery;

    // JavaScript에서 필터링 (ID 제외)
    type FallbackQuestion = {
      id: string;
      category_id: string;
      difficulty: number;
      type: string;
      question: string;
      code_snippet: string | null;
      options: string[] | null;
      answer: string;
      explanation: string | null;
      categories: { slug: string; name: string } | null;
    };
    const fallbackQuestions = (fallbackQuestionsRaw as FallbackQuestion[] | null)?.filter(
      (q) => !allAnsweredIds.includes(q.id)
    ).slice(0, needed);

    if (fallbackQuestions && fallbackQuestions.length > 0) {
      const fallback = fallbackQuestions.map((q) => {
        const category = q.categories;
        return {
          id: q.id,
          category: category?.name || 'Unknown',
          category_id: q.category_id,
          difficulty: q.difficulty as 1 | 2 | 3,
          type: q.type as 'multiple' | 'ox' | 'blank' | 'code',
          question: q.question,
          code_snippet: q.code_snippet,
          options: q.options as string[] | null,
          answer: q.answer,
          explanation: q.explanation,
        };
      });
      allQuestions.push(...fallback);
    }
  }

  // 최종 개수 확인
  if (allQuestions.length < 5) {
    throw new QuizGenerationError(
      '선택한 카테고리에 충분한 문제가 없습니다',
      'INSUFFICIENT_QUESTIONS'
    );
  }

  // 6) 질문 셔플
  const shuffledQuestions = shuffleArray(allQuestions).slice(0, 5);

  return {
    date: quizDate,
    questions: shuffledQuestions,
  };
}

/**
 * 편의 함수: 오늘 날짜로 퀴즈 생성
 */
export async function generateTodayQuiz(
  userId: string,
  supabase: SupabaseClientType
): Promise<DailyQuiz> {
  const todayDate = getTodayDateKey();
  return generateDailyQuiz({ userId, quizDate: todayDate, supabase });
}
