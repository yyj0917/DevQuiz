import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CategoryWithStats } from '@/types/database';
import type { Category } from '@/types/database';

/**
 * GET /api/stats/categories
 * Get categories with statistics for authenticated user
 * Optional query parameter: userId (if not provided, uses current user)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    console.log('categories', user, authError);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // Get userId from query params or use current user
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');
    const currentUserId = userIdParam || user.id;

    // Get all active categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('order_index');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return NextResponse.json(
        {
          success: false,
          error: '카테고리를 가져오는데 실패했습니다.',
        },
        { status: 500 }
      );
    }

    // Get question counts and user stats for each category
    const categoriesWithStats = await Promise.all(
      (categories || []).map(async (category) => {
        // Count total questions
        const { count: totalCount } = await supabase
          .from('questions')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', (category as Category).id)
          .eq('is_active', true);

        let userStats = null;

        if (currentUserId) {
          // Get user's category quiz attempts for this category
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const categoryAttemptsQuery = supabase.from('category_quiz_attempts') as any;
          const { data: userAttempts } = await categoryAttemptsQuery
            .select('id')
            .eq('user_id', currentUserId)
            .eq('category_id', (category as Category).id);

          if (userAttempts && userAttempts.length > 0) {
            const attemptIds = (userAttempts as Array<{ id: string }>).map((a) => a.id);

            // Get quiz answers for these attempts
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const quizAnswersQuery = supabase.from('quiz_answers') as any;
            const { data: userAnswers } = await quizAnswersQuery
              .select('question_id, is_correct')
              .in('category_attempt_id', attemptIds);

            if (userAnswers && Array.isArray(userAnswers)) {
              // Count unique question IDs
              const uniqueQuestionIds = new Set(
                (userAnswers as Array<{ question_id: string }>).map((a) => a.question_id)
              );
              const solvedCount = uniqueQuestionIds.size;

              // Count correct answers
              const correctCount = (userAnswers as Array<{ is_correct: boolean }>).filter(
                (a) => a.is_correct === true
              ).length;

              // Total answered count (including duplicates)
              const totalAnswered = userAnswers.length;

              // Calculate progress
              const totalQuestions = totalCount || 0;
              const progressPercentage =
                totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 0;

              if (solvedCount > 0 || totalAnswered > 0) {
                userStats = {
                  user_total_count: totalAnswered,
                  user_correct_count: correctCount,
                  user_solved_count: solvedCount,
                  accuracy: totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0,
                  progress_percentage: progressPercentage,
                };
              }
            }
          }
        }

        const categoryObj = category as Category;
        return {
          ...categoryObj,
          total_questions: totalCount || 0,
          ...userStats,
        } as CategoryWithStats;
      })
    );

    return NextResponse.json({
      success: true,
      data: categoriesWithStats,
    });
  } catch (error) {
    console.error('Error fetching categories with stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: '카테고리 통계를 가져오는데 실패했습니다.',
      },
      { status: 500 }
    );
  }
}

