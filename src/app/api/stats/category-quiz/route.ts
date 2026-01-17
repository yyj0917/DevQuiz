import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CategoryQuizStats } from '@/types/home-stats';

/**
 * GET /api/stats/category-quiz
 * Get category quiz statistics for authenticated user
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 1. Get total category questions count
    const { count: totalCategoryQuestions } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    // 2. Get user's category quiz attempts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categoryAttemptsQuery = supabase.from('category_quiz_attempts') as any;
    const { data: userCategoryAttempts } = await categoryAttemptsQuery
      .select('id')
      .eq('user_id', user.id);

    let uniqueSolvedQuestions = 0;

    if (userCategoryAttempts && userCategoryAttempts.length > 0) {
      const attemptIds = (userCategoryAttempts as Array<{ id: string }>).map((a) => a.id);

      // Get unique question IDs from quiz_answers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const quizAnswersQuery = supabase.from('quiz_answers') as any;
      const { data: categoryAnswers } = await quizAnswersQuery
        .select('question_id')
        .in('category_attempt_id', attemptIds);

      // Count unique question IDs
      uniqueSolvedQuestions = categoryAnswers
        ? new Set((categoryAnswers as Array<{ question_id: string }>).map((a) => a.question_id)).size
        : 0;
    }

    const totalCategoryQuestionsCount = totalCategoryQuestions || 0;
    const progressPercentage =
      totalCategoryQuestionsCount > 0
        ? Math.round((uniqueSolvedQuestions / totalCategoryQuestionsCount) * 100)
        : 0;

    const data: CategoryQuizStats = {
      totalQuestions: totalCategoryQuestionsCount,
      solvedQuestions: uniqueSolvedQuestions,
      progressPercentage,
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching category quiz stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: '카테고리 퀴즈 통계를 가져오는데 실패했습니다.',
      },
      { status: 500 }
    );
  }
}

