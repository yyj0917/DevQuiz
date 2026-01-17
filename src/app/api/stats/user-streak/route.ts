import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { UserStreakData } from '@/types/home-stats';

/**
 * GET /api/stats/user-streak
 * Get user streak data for authenticated user
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

    // Fetch user streak data
    const { data: streak } = (await supabase
      .from('user_streaks')
      .select('current_streak, total_quiz_days')
      .eq('user_id', user.id)
      .single()) as { data: { current_streak: number; total_quiz_days: number } | null };

    const data: UserStreakData = {
      current_streak: streak?.current_streak || 0,
      total_quiz_days: streak?.total_quiz_days || 0,
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching user streak data:', error);
    return NextResponse.json(
      {
        success: false,
        error: '스트릭 데이터를 가져오는데 실패했습니다.',
      },
      { status: 500 }
    );
  }
}

