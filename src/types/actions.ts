// ============================================================================
// SERVER ACTION RETURN TYPES
// ============================================================================

import type {
  WrongNoteWithQuestion,
  SavedQuestionWithQuestion,
  QuizAnswerWithQuestion,
} from './database';

/**
 * User statistics interface
 */
export interface MyStats {
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  currentStreak: number;
  longestStreak: number;
  totalQuizDays: number;
  savedCount: number;
  wrongNotesCount: number;
}

/**
 * Generic action result type
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Action result with optional data (for cases where data might be undefined)
 */
export type ActionResultOptional<T> =
  | { success: true; data?: T }
  | { success: false; error: string };

/**
 * Paginated action result
 */
export type PaginatedActionResult<T> =
  | { success: true; data: T[]; total: number; page: number; pageSize: number }
  | { success: false; error: string };

/**
 * Wrong notes action return types
 */
export type GetWrongNotesResult = {
  success: true;
  wrongNotes: WrongNoteWithQuestion[];
} | {
  success: false;
  error: string;
};

export type ResolveWrongNoteResult = ActionResult<null>;

/**
 * Saved questions action return types
 */
export type GetSavedQuestionsResult = {
  success: true;
  savedQuestions: SavedQuestionWithQuestion[];
} | {
  success: false;
  error: string;
};

export type ToggleSaveQuestionResult = {
  success: true;
  isSaved: boolean;
} | {
  success: false;
  error: string;
};

export type UpdateSavedMemoResult = ActionResult<null>;

/**
 * History action return types
 */
export type GetHistoryResult = PaginatedActionResult<QuizAnswerWithQuestion>;

/**
 * Stats action return types
 */
export type GetMyStatsResult = {
  success: true;
  stats: MyStats;
} | {
  success: false;
  error: string;
};

/**
 * Check question saved result
 */
export type CheckQuestionSavedResult = {
  success: true;
  isSaved: boolean;
} | {
  success: false;
  isSaved: false;
};

/**
 * Quiz action return types
 */
import type { DailyQuizQuestion, QuizSubmissionResult, QuizResult } from './quiz';

export type StartDailyQuizResult =
  | {
      attemptId: string;
      questions: DailyQuizQuestion[];
      isCompleted: false;
    }
  | {
      attemptId: string;
      isCompleted: true;
    };

export type SubmitAnswerResult = QuizSubmissionResult;

export type CompleteQuizResult = QuizResult;

export type SubmitReportResult =
  | { success: true }
  | { success: false; duplicate: true }
  | { success: false; error: string };

export type GetUserReportsResult = string[];

/**
 * Admin action return types
 */
import type { Question, Category, QuestionReport, Profile } from './database';

export interface QuestionWithCategory extends Question {
  categories: Category;
}

export interface ReportWithDetails extends QuestionReport {
  question: Question & {
    categories: Category | null;
  };
  user: Profile;
}

export type GetQuestionsResult = {
  success: true;
  questions: QuestionWithCategory[];
  total: number;
  page: number;
  totalPages: number;
} | {
  success: false;
  error: string;
};

export type GetQuestionByIdResult = {
  success: true;
  question: QuestionWithCategory;
} | {
  success: false;
  question: null;
  error: string;
};

export type CreateQuestionResult = {
  success: true;
  question: Question;
} | {
  success: false;
  error: string;
};

export type UpdateQuestionResult = ActionResult<null>;

export type DeleteQuestionResult = ActionResult<null>;

export type ToggleQuestionActiveResult = ActionResult<null>;

export type BulkDeleteQuestionsResult = {
  success: true;
  deletedCount: number;
} | {
  success: false;
  error: string;
};

export type BulkToggleActiveResult = {
  success: true;
  updatedCount: number;
} | {
  success: false;
  error: string;
};

export interface DashboardStats {
  totalQuestions: number;
  activeQuestions: number;
  inactiveQuestions: number;
  pendingReports: number;
  categoryCounts: Record<string, number>;
  recentQuestions: Array<{
    id: string;
    question: string;
    created_at: string;
    categories: { name: string; icon: string | null } | null;
  }>;
}

export type GetDashboardStatsResult = {
  success: true;
  stats: DashboardStats;
} | {
  success: false;
  error: string;
};

export type GetCategoriesResult = {
  success: true;
  categories: Category[];
} | {
  success: false;
  error: string;
};

export type GetReportsResult = {
  success: true;
  reports: ReportWithDetails[];
  total: number;
  page: number;
  totalPages: number;
} | {
  success: false;
  error: string;
};

export type GetReportByIdResult = {
  success: true;
  report: ReportWithDetails;
} | {
  success: false;
  error: string;
};

export type UpdateReportStatusResult = ActionResult<null>;

export interface ReportStats {
  total: number;
  pending: number;
  reviewed: number;
  resolved: number;
  rejected: number;
}

export type GetReportStatsResult = {
  success: true;
  stats: ReportStats;
} | {
  success: false;
  error: string;
};

/**
 * User quiz creation action return types
 */
import type { QuestionWithCreator } from './database';

export type CreateUserQuestionResult = {
  success: true;
  question: QuestionWithCreator;
} | {
  success: false;
  error: string;
};

export type GetUserQuestionsResult = {
  success: true;
  questions: QuestionWithCreator[];
  total: number;
  page: number;
  totalPages: number;
} | {
  success: false;
  error: string;
};

export type UpdateUserQuestionResult = ActionResult<null>;

export type DeleteUserQuestionResult = ActionResult<null>;

