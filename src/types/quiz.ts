// ============================================================================
// QUIZ TYPES
// ============================================================================

export type QuizDifficulty = 1 | 2 | 3; // 1=Easy, 2=Medium, 3=Hard

export type QuizType = 'multiple' | 'ox' | 'blank' | 'code';

// Re-export QuestionStatus from database types
export type { QuestionStatus } from './database';

export interface DailyQuizQuestion {
  id: string;
  category: string;
  category_id: string;
  difficulty: QuizDifficulty;
  type: QuizType;
  question: string;
  code_snippet: string | null;
  options: string[] | null;
  answer: string; // 정답 (채점용)
  explanation: string | null;
}

export interface DailyQuiz {
  id?: string;
  date: string;
  questions: DailyQuizQuestion[];
}

export type QuizAnswerPayload =
  | { type: 'multiple'; selectedIndex: number }
  | { type: 'ox'; answer: boolean }
  | { type: 'blank'; answer: string }
  | { type: 'code'; answer: string };

export interface QuizSubmissionResult {
  isCorrect: boolean;
  explanation: string | null;
  correctAnswerDisplay: string;
}

export interface QuizResult {
  attemptId: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  streak: number;
}

// ============================================================================
// USER QUIZ CREATION TYPES
// ============================================================================

/**
 * Form data for creating a new question
 */
export interface QuestionFormInput {
  category: string; // category slug
  type: QuizType;
  difficulty: QuizDifficulty;
  question: string;
  options: string[] | null; // 4 options for multiple choice, null otherwise
  answer: string; // multiple: '1'~'4', ox: 'true'/'false', blank/code: text
  explanation: string;
  code_snippet?: string; // required for 'code' type
  tags: string[];
}
