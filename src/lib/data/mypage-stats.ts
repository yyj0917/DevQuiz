import { unstable_cache } from 'next/cache';
import type {
  MypageStats,
  SolvedQuestionsResult,
  WrongQuestionsResult,
  SolvedQuestionsFilters,
  WrongQuestionsFilters,
} from '@/types/mypage-stats';
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
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
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
 * Get mypage statistics (cached)
 * Revalidates every 60 seconds
 */
export async function getMypageStats(userId: string): Promise<MypageStats> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  return unstable_cache(
    async () => fetchFromApi<MypageStats>('/api/mypage/stats', cookieHeader),
    [`mypage-stats-${userId}`],
    {
      revalidate: 60,
      tags: ['mypage', 'stats', userId],
    }
  )();
}

/**
 * Get solved questions list (cached)
 * Revalidates every 60 seconds
 */
export async function getSolvedQuestions(
  userId: string,
  filters?: SolvedQuestionsFilters,
  page: number = 1,
  pageSize: number = 20
): Promise<SolvedQuestionsResult> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  // Build query string
  const params = new URLSearchParams();
  if (filters?.categoryId) {
    params.append('categoryId', filters.categoryId);
  }
  if (filters?.result && filters.result !== 'all') {
    params.append('result', filters.result);
  }
  params.append('page', page.toString());
  params.append('pageSize', pageSize.toString());

  const endpoint = `/api/mypage/solved-questions?${params.toString()}`;

  return unstable_cache(
    async () => fetchFromApi<SolvedQuestionsResult>(endpoint, cookieHeader),
    [`mypage-solved-${userId}`, JSON.stringify(filters), page.toString(), pageSize.toString()],
    {
      revalidate: 60,
      tags: ['mypage', 'solved-questions', userId],
    }
  )();
}

/**
 * Get wrong questions list (cached)
 * Revalidates every 60 seconds
 */
export async function getWrongQuestions(
  userId: string,
  filters?: WrongQuestionsFilters
): Promise<WrongQuestionsResult> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  // Build query string
  const params = new URLSearchParams();
  if (filters?.categoryId) {
    params.append('categoryId', filters.categoryId);
  }
  if (filters?.isReviewed !== undefined) {
    params.append('isReviewed', filters.isReviewed.toString());
  }

  const endpoint = `/api/mypage/wrong-questions${params.toString() ? `?${params.toString()}` : ''}`;

  return unstable_cache(
    async () => fetchFromApi<WrongQuestionsResult>(endpoint, cookieHeader),
    [`mypage-wrong-${userId}`, JSON.stringify(filters)],
    {
      revalidate: 60,
      tags: ['mypage', 'wrong-questions', userId],
    }
  )();
}

