import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getHomeStats } from '@/lib/data/home-stats';

/**
 * GET /api/home/stats
 * Get complete home page statistics for authenticated user
 * 
 * Caching: Uses Next.js fetch caching (default: cache: 'force-cache')
 * For dynamic data, use 'no-store' or revalidate option
 */
export const revalidate = 60; // Revalidate every 60 seconds

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

    // Get home stats
    // Uses Next.js Request Memoization for deduplication within the same request
    const stats = await getHomeStats(user.id);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching home stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: '통계 데이터를 가져오는데 실패했습니다.',
      },
      { status: 500 }
    );
  }
}

