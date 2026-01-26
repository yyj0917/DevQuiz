// ============================================================================
// STATS TYPES - Activity Graph
// ============================================================================

/**
 * Activity level for color coding (GitHub-style grass)
 */
export type ActivityLevel = 0 | 1 | 2 | 3 | 4;
// 0: No activity (gray)
// 1: 1-2 questions (light green)
// 2: 3-4 questions (green)
// 3: 5-7 questions (dark green)
// 4: 8+ questions (darkest green)

/**
 * Category statistics for a specific day
 */
export interface CategoryStat {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  categoryIcon: string | null;
  count: number; // Total questions in this category
  correctCount: number; // Correct answers in this category
}

/**
 * Daily activity data
 */
export interface DailyActivity {
  date: string; // 'YYYY-MM-DD' format
  totalQuestions: number; // Total questions answered
  correctCount: number; // Total correct answers
  accuracy: number; // Accuracy percentage (0-100)
  categories: CategoryStat[]; // Category breakdown
}

/**
 * Week data for graph rendering
 */
export interface WeekData {
  weekStart: string; // ISO date string of Monday
  days: (DailyActivity | null)[]; // 7 days, null = no data for that date
}

/**
 * Question detail for activity detail panel
 */
export interface ActivityQuestion {
  id: string;
  question: string;
  categoryName: string;
  categoryIcon: string | null;
  type: 'multiple' | 'ox' | 'blank' | 'code';
  difficulty: number;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  timeSpent?: number | null; // seconds
}

/**
 * Detailed activity for a specific day
 */
export interface DayActivityDetail {
  summary: DailyActivity;
  questions: ActivityQuestion[];
}

/**
 * Activity graph summary statistics
 */
export interface ActivitySummary {
  totalQuestions: number; // Total questions in the period
  currentStreak: number; // Current consecutive days
  longestStreak: number; // Longest consecutive days
  activeDays: number; // Days with at least one question
  totalDays: number; // Total days in the period
}

/**
 * Category summary for stats overview
 */
export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  categoryIcon: string | null;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
}
