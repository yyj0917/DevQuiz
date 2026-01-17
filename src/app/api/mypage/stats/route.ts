import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { MypageStats } from '@/types/mypage-stats';

/**
 * GET /api/mypage/stats
 * Get mypage statistics for authenticated user
 * Returns: solved questions count, total questions count, progress percentage
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

    // Get all user's quiz attempts (daily + category)
    const { data: dailyAttempts } = await supabase
      .from('quiz_attempts')
      .select('id')
      .eq('user_id', user.id);

    const { data: categoryAttempts } = await supabase
      .from('category_quiz_attempts')
      .select('id')
      .eq('user_id', user.id);

    const dailyAttemptIds = ((dailyAttempts || []) as Array<{ id: string }>).map((a) => a.id);
    const categoryAttemptIds = ((categoryAttempts || []) as Array<{ id: string }>).map((a) => a.id);

    // Get unique question IDs from quiz_answers
    const uniqueQuestionIds = new Set<string>();

    if (dailyAttemptIds.length > 0) {
      const { data: dailyAnswers } = await supabase
        .from('quiz_answers')
        .select('question_id')
        .in('attempt_id', dailyAttemptIds);

      (dailyAnswers || []).forEach((answer) => {
        uniqueQuestionIds.add((answer as { question_id: string }).question_id);
      });
    }

    if (categoryAttemptIds.length > 0) {
      const { data: categoryAnswers } = await supabase
        .from('quiz_answers')
        .select('question_id')
        .in('category_attempt_id', categoryAttemptIds);

      (categoryAnswers || []).forEach((answer) => {
        uniqueQuestionIds.add((answer as { question_id: string }).question_id);
      });
    }

    const solvedQuestions = uniqueQuestionIds.size;

    // Get total active questions count
    const { count: totalQuestions } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    const progressPercentage =
      totalQuestions && totalQuestions > 0
        ? Math.round((solvedQuestions / totalQuestions) * 100)
        : 0;

    const stats: MypageStats = {
      solvedQuestions,
      totalQuestions: totalQuestions || 0,
      progressPercentage,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching mypage stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: '통계를 가져오는데 실패했습니다.',
      },
      { status: 500 }
    );
  }
}

