// ============================================================================
// DATABASE TYPES
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================================================
// TABLE ROW TYPES
// ============================================================================

/**
 * Question status type
 */
export type QuestionStatus = 'pending' | 'approved' | 'rejected';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface Question {
  id: string;
  category_id: string;
  type: 'multiple' | 'ox' | 'blank' | 'code';
  difficulty: number;
  question: string;
  options: string[] | null;
  answer: string;
  explanation: string | null;
  code_snippet: string | null;
  tags: string[] | null;
  source: string | null;
  is_active: boolean;
  stats: {
    attempts: number;
    correct: number;
  };
  created_by: string | null; // 제작자 ID (null이면 시스템 문제)
  is_user_created: boolean; // 유저가 생성한 문제 여부
  status: 'pending' | 'approved' | 'rejected'; // 승인 상태
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  nickname: string | null;
  avatar_url: string | null;
  is_onboarded: boolean;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface UserCategory {
  id: string;
  user_id: string;
  category_id: string;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  date: string;
  total_questions: number;
  correct_count: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface QuizAnswer {
  id: string;
  attempt_id: string | null;
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  answered_at: string;
  category_attempt_id: string | null;
}

export interface WrongNote {
  id: string;
  user_id: string;
  question_id: string;
  wrong_count: number;
  last_wrong_at: string;
  is_reviewed: boolean;
  reviewed_at: string | null;
  created_at: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_quiz_date: string | null;
  total_quiz_days: number;
  updated_at: string;
}

export interface SavedQuestion {
  id: string;
  user_id: string;
  question_id: string;
  memo: string | null;
  created_at: string;
}

export interface CategoryQuizAttempt {
  id: string;
  user_id: string;
  category_id: string | null;
  mode: 'random' | 'wrong_only';
  question_count: number;
  correct_count: number;
  completed_at: string | null;
  created_at: string;
}

export interface QuestionReport {
  id: string;
  question_id: string;
  user_id: string;
  type: 'question_error' | 'option_error' | 'answer_mismatch' | 'explanation_error';
  description: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'rejected';
  admin_note: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

// ============================================================================
// INSERT TYPES (for creating new records)
// ============================================================================

export type CategoryInsert = Omit<Category, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type QuestionInsert = Omit<Question, 'id' | 'created_at' | 'updated_at' | 'stats'> & {
  id?: string;
  stats?: Question['stats'];
  created_at?: string;
  updated_at?: string;
};

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

export type UserCategoryInsert = Omit<UserCategory, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type QuizAttemptInsert = Omit<QuizAttempt, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type QuizAnswerInsert = Omit<QuizAnswer, 'id' | 'answered_at'> & {
  id?: string;
  answered_at?: string;
};

export type WrongNoteInsert = Omit<WrongNote, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type UserStreakInsert = Omit<UserStreak, 'id' | 'updated_at'> & {
  id?: string;
  updated_at?: string;
};

export type QuestionReportInsert = Omit<QuestionReport, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type SavedQuestionInsert = Omit<SavedQuestion, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type CategoryQuizAttemptInsert = Omit<CategoryQuizAttempt, 'id' | 'created_at' | 'completed_at'> & {
  id?: string;
  created_at?: string;
  completed_at?: string | null;
};

// ============================================================================
// UPDATE TYPES (for updating existing records)
// ============================================================================

export type CategoryUpdate = Partial<Omit<Category, 'id' | 'created_at'>>;

export type QuestionUpdate = Partial<Omit<Question, 'id' | 'created_at'>>;

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>;

export type UserCategoryUpdate = Partial<Omit<UserCategory, 'id' | 'user_id' | 'category_id' | 'created_at'>>;

export type QuizAttemptUpdate = Partial<Omit<QuizAttempt, 'id' | 'user_id' | 'created_at'>>;

export type QuizAnswerUpdate = Partial<Omit<QuizAnswer, 'id' | 'attempt_id' | 'question_id'>>;

export type WrongNoteUpdate = Partial<Omit<WrongNote, 'id' | 'user_id' | 'question_id' | 'created_at'>>;

export type UserStreakUpdate = Partial<Omit<UserStreak, 'id' | 'user_id'>>;

export type QuestionReportUpdate = Partial<Omit<QuestionReport, 'id' | 'question_id' | 'user_id' | 'created_at'>>;

export type SavedQuestionUpdate = Partial<Omit<SavedQuestion, 'id' | 'user_id' | 'question_id' | 'created_at'>>;

export type CategoryQuizAttemptUpdate = Partial<Omit<CategoryQuizAttempt, 'id' | 'user_id' | 'created_at'>>;

// ============================================================================
// COMBINED/JOINED TYPES
// ============================================================================

export interface QuestionWithCategory extends Question {
  categories: Category;
}

/**
 * Question with creator information (for user-created questions)
 */
export interface QuestionWithCreator extends Question {
  categories: Category;
  creator?: {
    id: string;
    nickname: string;
    avatar_url: string | null;
  } | null;
}

export interface QuizAnswerWithQuestion extends QuizAnswer {
  questions: QuestionWithCategory;
}

export interface QuizAttemptWithAnswers extends QuizAttempt {
  quiz_answers: QuizAnswerWithQuestion[];
}

export interface WrongNoteWithQuestion extends WrongNote {
  questions: QuestionWithCategory;
}

export interface QuestionReportWithDetails extends QuestionReport {
  questions: Question;
  profiles: Profile;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface QuizQuestion extends Question {
  category_name: string;
  category_icon: string;
}

export interface DailyQuizResult {
  attempt: QuizAttempt;
  answers: QuizAnswerWithQuestion[];
  score: number;
  accuracy: number;
}

export interface UserStats {
  total_attempts: number;
  total_correct: number;
  accuracy: number;
  current_streak: number;
  longest_streak: number;
  total_quiz_days: number;
  wrong_notes_count: number;
}

export interface CategoryStats {
  category: Category;
  total_questions: number;
  attempted_questions: number;
  correct_count: number;
  accuracy: number;
}

export interface SavedQuestionWithQuestion extends SavedQuestion {
  questions: QuestionWithCategory;
}

export interface CategoryQuizAttemptWithAnswers extends CategoryQuizAttempt {
  quiz_answers: QuizAnswerWithQuestion[];
}

export interface CategoryWithStats extends Category {
  total_questions: number;
  user_correct_count?: number;
  user_total_count?: number;
  user_solved_count?: number; // 고유 문제 수 (중복 제거)
  accuracy?: number;
  progress_percentage?: number; // 진행률 (0-100)
}

// ============================================================================
// DATABASE SCHEMA TYPE (for Supabase client)
// ============================================================================

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
      };
      questions: {
        Row: Question;
        Insert: QuestionInsert;
        Update: QuestionUpdate;
      };
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      user_categories: {
        Row: UserCategory;
        Insert: UserCategoryInsert;
        Update: UserCategoryUpdate;
      };
      quiz_attempts: {
        Row: QuizAttempt;
        Insert: QuizAttemptInsert;
        Update: QuizAttemptUpdate;
      };
      quiz_answers: {
        Row: QuizAnswer;
        Insert: QuizAnswerInsert;
        Update: QuizAnswerUpdate;
      };
      wrong_notes: {
        Row: WrongNote;
        Insert: WrongNoteInsert;
        Update: WrongNoteUpdate;
      };
      user_streaks: {
        Row: UserStreak;
        Insert: UserStreakInsert;
        Update: UserStreakUpdate;
      };
      question_reports: {
        Row: QuestionReport;
        Insert: QuestionReportInsert;
        Update: QuestionReportUpdate;
      };
      saved_questions: {
        Row: SavedQuestion;
        Insert: SavedQuestionInsert;
        Update: SavedQuestionUpdate;
      };
      category_quiz_attempts: {
        Row: CategoryQuizAttempt;
        Insert: CategoryQuizAttemptInsert;
        Update: CategoryQuizAttemptUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
