// ============================================================================
// HOME STATS TYPES
// ============================================================================

import type { CategoryWithStats } from './database';

/**
 * User streak data
 */
export interface UserStreakData {
  current_streak: number;
  total_quiz_days: number;
}

/**
 * Daily quiz statistics
 */
export interface DailyQuizStats {
  totalAnswers: number;
  totalAttempts: number;
}

/**
 * Category quiz statistics
 */
export interface CategoryQuizStats {
  totalQuestions: number;
  solvedQuestions: number; // 고유 문제 수 (중복 제거)
  progressPercentage: number;
}

/**
 * Complete home page statistics
 */
export interface HomeStats {
  streak: UserStreakData;
  dailyStats: DailyQuizStats;
  categoryStats: CategoryQuizStats;
  categories: CategoryWithStats[];
}

