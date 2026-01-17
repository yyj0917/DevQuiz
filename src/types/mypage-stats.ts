// ============================================================================
// MYPAGE STATS TYPES
// ============================================================================

import type { Question, Category } from './database';

/**
 * 마이페이지 통계
 */
export interface MypageStats {
  solvedQuestions: number; // 고유 문제 수
  totalQuestions: number; // 전체 활성화된 문제 수
  progressPercentage: number; // 진행률 (0-100)
}

/**
 * 내가 푼 문제 (고유 question_id 기준)
 */
export interface SolvedQuestion {
  questionId: string;
  question: Question;
  category: Category;
  answeredCount: number; // 해당 문제를 푼 횟수
  correctCount: number; // 정답 횟수
  lastAnsweredAt: string;
  isCorrect: boolean; // 마지막 답변이 정답인지
}

/**
 * 내가 틀린 문제 (wrong_notes 기반)
 */
export interface WrongQuestion {
  wrongNoteId: string; // wrong_notes 테이블의 ID
  questionId: string;
  question: Question;
  category: Category;
  wrongCount: number;
  lastWrongAt: string;
  isReviewed: boolean;
}

/**
 * Solved Questions 페이지네이션 결과
 */
export interface SolvedQuestionsResult {
  questions: SolvedQuestion[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Wrong Questions 결과 (페이지네이션 없음)
 */
export interface WrongQuestionsResult {
  questions: WrongQuestion[];
  total: number;
}

/**
 * Solved Questions 필터
 */
export interface SolvedQuestionsFilters {
  categoryId?: string;
  result?: 'all' | 'correct' | 'wrong'; // all: 전체, correct: 정답만, wrong: 오답만
}

/**
 * Wrong Questions 필터
 */
export interface WrongQuestionsFilters {
  categoryId?: string;
  isReviewed?: boolean; // undefined: 전체, true: 복습완료만, false: 미복습만
}

