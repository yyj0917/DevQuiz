import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { DailyQuizStats } from '@/types/home-stats';

/**
 * GET /api/stats/daily-quiz
 * Get daily quiz statistics for authenticated user
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

    // Get quiz attempts for user
    const { data: attempts } = (await supabase
      .from('quiz_attempts')
      .select('id')
      .eq('user_id', user.id)) as { data: { id: string }[] | null };

    const attemptIds = attempts?.map((a) => a.id) || [];

    // Count total answers
    const { count: totalAnswers } = await supabase
      .from('quiz_answers')
      .select('*', { count: 'exact', head: true })
      .in('attempt_id', attemptIds);

    const data: DailyQuizStats = {
      totalAnswers: totalAnswers || 0,
      totalAttempts: attempts?.length || 0,
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching daily quiz stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: '데일리 퀴즈 통계를 가져오는데 실패했습니다.',
      },
      { status: 500 }
    );
  }
}

