import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { QuizHomeClient } from '@/components/quiz/quiz-home-client';
import { getCategoriesWithStatsAction } from '@/app/(pages)/quiz/category/actions';

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 프로필 온보딩 확인
  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', user.id)
    .maybeSingle() as { data: { nickname: string | null } | null };

  const nickname = profile?.nickname;
  const hasNickname = nickname !== null && nickname !== undefined && nickname.trim().length > 0;

  if (!hasNickname) {
    redirect('/onboarding');
  }

  // 통계 데이터 조회
  const { data: streak } = await supabase
    .from('user_streaks')
    .select('current_streak, total_quiz_days')
    .eq('user_id', user.id)
    .single() as { data: { current_streak: number; total_quiz_days: number } | null };

  // 데일리 퀴즈 총 푼 문제 수 계산 (기존 유지)
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('id')
    .eq('user_id', user.id) as { data: { id: string }[] | null };

  const attemptIds = attempts?.map((a) => a.id) || [] as string[];
  const { count: totalAnswers } = await supabase
    .from('quiz_answers')
    .select('*', { count: 'exact', head: true })
    .in('attempt_id', attemptIds);

  // 카테고리 퀴즈 통계 계산 (데일리 퀴즈 제외)
  // 1. 전체 카테고리 문제 수 합계
  const { count: totalCategoryQuestions } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);

  // 2. 사용자가 푼 카테고리 퀴즈 고유 문제 수
  // 먼저 사용자의 category_quiz_attempts 조회
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoryAttemptsQuery = supabase.from('category_quiz_attempts') as any;
  const { data: userCategoryAttempts } = await categoryAttemptsQuery
    .select('id')
    .eq('user_id', user.id);

  let uniqueSolvedQuestions = 0;

  if (userCategoryAttempts && userCategoryAttempts.length > 0) {
    const attemptIds = (userCategoryAttempts as Array<{ id: string }>).map((a) => a.id);

    // 해당 attempts의 quiz_answers에서 고유 question_id 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quizAnswersQuery = supabase.from('quiz_answers') as any;
    const { data: categoryAnswers } = await quizAnswersQuery
      .select('question_id')
      .in('category_attempt_id', attemptIds);

    // 고유 question_id 개수 계산
    uniqueSolvedQuestions = categoryAnswers
      ? new Set((categoryAnswers as Array<{ question_id: string }>).map((a) => a.question_id)).size
      : 0;
  }

  const totalCategoryQuestionsCount = totalCategoryQuestions || 0;
  const progressPercentage =
    totalCategoryQuestionsCount > 0
      ? Math.round((uniqueSolvedQuestions / totalCategoryQuestionsCount) * 100)
      : 0;

  // 카테고리별 통계 조회
  const categoriesResult = await getCategoriesWithStatsAction();
  const categories = categoriesResult.success ? categoriesResult.categories || [] : [];

  const stats = {
    currentStreak: streak?.current_streak || 0,
    totalAnswers: totalAnswers || 0, // 데일리 퀴즈용 (기존 유지)
    categoryQuizStats: {
      totalQuestions: totalCategoryQuestionsCount,
      solvedQuestions: uniqueSolvedQuestions,
      progressPercentage,
    },
  };

  return <QuizHomeClient stats={stats} categories={categories} />;
}
