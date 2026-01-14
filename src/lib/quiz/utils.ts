// ============================================================================
// QUIZ UTILITY FUNCTIONS
// ============================================================================

import type { QuizDifficulty } from '@/types/quiz';

/**
 * 난이도별 별 표시 텍스트 생성
 */
export function getDifficultyStars(difficulty: QuizDifficulty): string {
  switch (difficulty) {
    case 1:
      return '⭐';
    case 2:
      return '⭐⭐';
    case 3:
      return '⭐⭐⭐';
    default:
      return '';
  }
}

/**
 * Fisher-Yates 셔플 알고리즘
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 스트릭 계산: 마지막 퀴즈 날짜를 기준으로 연속일 계산
 */
export function calculateStreak(lastQuizDate: string | null, todayDate: string): {
  newStreak: number;
  shouldIncrement: boolean;
} {
  if (!lastQuizDate) {
    return { newStreak: 1, shouldIncrement: true };
  }

  const lastDate = new Date(lastQuizDate);
  const today = new Date(todayDate);
  const diffTime = today.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // 오늘 이미 퀴즈를 풀었음
    return { newStreak: 0, shouldIncrement: false };
  } else if (diffDays === 1) {
    // 연속일
    return { newStreak: 1, shouldIncrement: true };
  } else {
    // 연속이 끊어짐
    return { newStreak: 1, shouldIncrement: true };
  }
}
