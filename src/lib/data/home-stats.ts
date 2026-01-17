import { unstable_cache } from 'next/cache';
import type {
  UserStreakData,
  DailyQuizStats,
  CategoryQuizStats,
  HomeStats,
} from '@/types/home-stats';
import type { CategoryWithStats } from '@/types/database';
import { cookies } from 'next/headers';

/**
 * Fetch data from API Route
 */
async function fetchFromApi<T>(endpoint: string, cookieHeader?: string): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const url = `${baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    cache: 'no-store', // Always fetch fresh data, caching handled by unstable_cache
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { 'Cookie': cookieHeader } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(`API request failed (${response.status}): ${error.error || response.statusText}`);
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'API request failed');
  }

  return result.data;
}

// ============================================================================
// PUBLIC API FUNCTIONS (with caching)
// ============================================================================
// These functions fetch data from API Routes and use unstable_cache for caching.
// API Routes handle Supabase queries (which use cookies), and unstable_cache
// handles the caching layer without conflicts.

/**
 * Get user streak data (cached)
 * Revalidates every 60 seconds
 */
export async function getUserStreakData(userId: string): Promise<UserStreakData> {
  return unstable_cache(
    async () => fetchFromApi<UserStreakData>('/api/stats/user-streak'),
    [`user-streak-${userId}`],
    {
      revalidate: 60,
      tags: ['stats', 'user-streak', userId],
    }
  )();
}

/**
 * Get daily quiz statistics (cached)
 * Revalidates every 60 seconds
 */
export async function getDailyQuizStats(userId: string): Promise<DailyQuizStats> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
  return unstable_cache(
    async () => fetchFromApi<DailyQuizStats>('/api/stats/daily-quiz', cookieHeader),
    [`daily-quiz-${userId}`],
    {
      revalidate: 60,
      tags: ['stats', 'daily-quiz', userId],
    },
  )();
}

/**
 * Get category quiz statistics (cached)
 * Revalidates every 60 seconds
 */
export async function getCategoryQuizStats(userId: string): Promise<CategoryQuizStats> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
  return unstable_cache(
    async () => fetchFromApi<CategoryQuizStats>('/api/stats/category-quiz', cookieHeader),
    [`category-quiz-${userId}`],
    {
      revalidate: 60,
      tags: ['stats', 'category-quiz', userId],
    }
  )();
}

/**
 * Get categories with statistics (cached)
 * - If userId provided: revalidates every 60 seconds (user-specific data)
 * - If userId not provided: revalidates every 300 seconds (shared data)
 */
export async function getCategoriesWithStats(userId?: string): Promise<CategoryWithStats[]> {
  const cacheKey = userId ? `categories-${userId}` : 'categories';
  const revalidateTime = userId ? 60 : 300;
  const tags = userId ? ['stats', 'categories', userId] : ['stats', 'categories'];
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
  return unstable_cache(
    async () => {
      const endpoint = userId 
        ? `/api/stats/categories?userId=${userId}`
        : '/api/stats/categories';
      return fetchFromApi<CategoryWithStats[]>(endpoint, cookieHeader);
    },
    [cacheKey],
    {
      revalidate: revalidateTime,
      tags,
    }
  )();
}

/**
 * Get complete home page statistics (cached)
 * Combines all stats in parallel for optimal performance
 * Revalidates every 60 seconds
 */
export async function getHomeStats(userId: string): Promise<HomeStats> {
  // Use Promise.all for parallel execution
  // Each function is already cached, so duplicates are handled automatically
  const [ dailyStats, categoryStats, categories] = await Promise.all([
    getDailyQuizStats(userId),
    getCategoryQuizStats(userId),
    getCategoriesWithStats(userId),
  ]);

  return {
    streak: {
      current_streak: 0,
      total_quiz_days: 0,
    },
    dailyStats,
    categoryStats,
    categories,
  };
}

