'use server';

import { createClient } from '@/lib/supabase/server';
import type { SavedQuestionInsert } from '@/types/database';

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

export interface HistoryFilters {
  result?: 'all' | 'correct' | 'wrong';
  categoryId?: string;
  sortBy?: 'newest' | 'oldest';
}

/**
 * Get user statistics for mypage dashboard
 */
export async function getMyStatsAction() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // Get streak data
    const { data: streak } = await supabase
      .from('user_streaks')
      .select('current_streak, longest_streak, total_quiz_days')
      .eq('user_id', user.id)
      .single();

    // Get all quiz answers (daily + category quizzes)
    const { data: answers } = await supabase
      .from('quiz_answers')
      .select(
        `
        is_correct,
        quiz_attempts!inner(user_id),
        category_quiz_attempts(user_id)
      `
      )
      .or(`quiz_attempts.user_id.eq.${user.id},category_quiz_attempts.user_id.eq.${user.id}`);

    const totalQuestions = answers?.length || 0;
    const correctCount = answers?.filter((a) => a.is_correct).length || 0;
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // Get saved questions count
    const { count: savedCount } = await supabase
      .from('saved_questions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get wrong notes count
    const { count: wrongNotesCount } = await supabase
      .from('wrong_notes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_reviewed', false);

    const stats: MyStats = {
      totalQuestions,
      correctCount,
      accuracy,
      currentStreak: streak?.current_streak || 0,
      longestStreak: streak?.longest_streak || 0,
      totalQuizDays: streak?.total_quiz_days || 0,
      savedCount: savedCount || 0,
      wrongNotesCount: wrongNotesCount || 0,
    };

    return { success: true, stats };
  } catch (error) {
    console.error('getMyStatsAction error:', error);
    return { success: false, error: '통계를 가져오는데 실패했습니다.' };
  }
}

/**
 * Get learning history with filters and pagination
 */
export async function getHistoryAction(
  filters: HistoryFilters = {},
  page: number = 1,
  pageSize: number = 20
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    let query = supabase
      .from('quiz_answers')
      .select(
        `
        *,
        questions(
          *,
          categories(name, slug, icon)
        ),
        quiz_attempts(user_id),
        category_quiz_attempts(user_id)
      `,
        { count: 'exact' }
      )
      .or(`quiz_attempts.user_id.eq.${user.id},category_quiz_attempts.user_id.eq.${user.id}`);

    // Apply filters
    if (filters.result === 'correct') {
      query = query.eq('is_correct', true);
    } else if (filters.result === 'wrong') {
      query = query.eq('is_correct', false);
    }

    if (filters.categoryId) {
      query = query.eq('questions.category_id', filters.categoryId);
    }

    // Sort by date
    query = query.order('answered_at', {
      ascending: filters.sortBy === 'oldest',
    });

    // Pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    query = query.range(start, end);

    const { data, count, error } = await query;

    if (error) {
      console.error('getHistoryAction error:', error);
      return { success: false, error: '히스토리를 가져오는데 실패했습니다.' };
    }

    return {
      success: true,
      history: data || [],
      total: count || 0,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('getHistoryAction error:', error);
    return { success: false, error: '히스토리를 가져오는데 실패했습니다.' };
  }
}

/**
 * Toggle save/unsave a question (bookmark)
 */
export async function toggleSaveQuestionAction(questionId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_questions')
      .select('id')
      .eq('user_id', user.id)
      .eq('question_id', questionId)
      .maybeSingle();

    if (existing) {
      // Unsave (delete)
      const { error: deleteError } = await supabase
        .from('saved_questions')
        .delete()
        .eq('id', existing.id);

      if (deleteError) {
        console.error('Error unsaving question:', deleteError);
        return { success: false, error: '저장 해제에 실패했습니다.' };
      }

      return { success: true, isSaved: false };
    } else {
      // Save (insert)
      const saveData: SavedQuestionInsert = {
        user_id: user.id,
        question_id: questionId,
      };

      const { error: insertError } = await supabase
        .from('saved_questions')
        .insert(saveData);

      if (insertError) {
        console.error('Error saving question:', insertError);
        return { success: false, error: '저장에 실패했습니다.' };
      }

      return { success: true, isSaved: true };
    }
  } catch (error) {
    console.error('toggleSaveQuestionAction error:', error);
    return { success: false, error: '저장 처리 중 오류가 발생했습니다.' };
  }
}

/**
 * Update memo for a saved question
 */
export async function updateSavedMemoAction(savedId: string, memo: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const { error } = await supabase
      .from('saved_questions')
      .update({ memo })
      .eq('id', savedId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating memo:', error);
      return { success: false, error: '메모 수정에 실패했습니다.' };
    }

    return { success: true };
  } catch (error) {
    console.error('updateSavedMemoAction error:', error);
    return { success: false, error: '메모 수정 중 오류가 발생했습니다.' };
  }
}

/**
 * Get saved questions
 */
export async function getSavedQuestionsAction(categoryId?: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    let query = supabase
      .from('saved_questions')
      .select(
        `
        *,
        questions(
          *,
          categories(name, slug, icon)
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (categoryId) {
      query = query.eq('questions.category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('getSavedQuestionsAction error:', error);
      return { success: false, error: '저장한 문제를 가져오는데 실패했습니다.' };
    }

    return { success: true, savedQuestions: data || [] };
  } catch (error) {
    console.error('getSavedQuestionsAction error:', error);
    return { success: false, error: '저장한 문제를 가져오는데 실패했습니다.' };
  }
}

/**
 * Mark wrong note as reviewed
 */
export async function resolveWrongNoteAction(wrongNoteId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const { error } = await supabase
      .from('wrong_notes')
      .update({
        is_reviewed: true,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', wrongNoteId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error resolving wrong note:', error);
      return { success: false, error: '복습 완료 처리에 실패했습니다.' };
    }

    return { success: true };
  } catch (error) {
    console.error('resolveWrongNoteAction error:', error);
    return { success: false, error: '복습 완료 처리 중 오류가 발생했습니다.' };
  }
}

/**
 * Get wrong notes
 */
export async function getWrongNotesAction(filters?: {
  categoryId?: string;
  isReviewed?: boolean;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    let query = supabase
      .from('wrong_notes')
      .select(
        `
        *,
        questions(
          *,
          categories(name, slug, icon)
        )
      `
      )
      .eq('user_id', user.id)
      .order('last_wrong_at', { ascending: false });

    if (filters?.categoryId) {
      query = query.eq('questions.category_id', filters.categoryId);
    }

    if (filters?.isReviewed !== undefined) {
      query = query.eq('is_reviewed', filters.isReviewed);
    }

    const { data, error } = await query;

    if (error) {
      console.error('getWrongNotesAction error:', error);
      return { success: false, error: '오답노트를 가져오는데 실패했습니다.' };
    }

    return { success: true, wrongNotes: data || [] };
  } catch (error) {
    console.error('getWrongNotesAction error:', error);
    return { success: false, error: '오답노트를 가져오는데 실패했습니다.' };
  }
}

/**
 * Check if a question is saved
 */
export async function checkQuestionSavedAction(questionId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, isSaved: false };
    }

    const { data } = await supabase
      .from('saved_questions')
      .select('id')
      .eq('user_id', user.id)
      .eq('question_id', questionId)
      .maybeSingle();

    return { success: true, isSaved: !!data };
  } catch (error) {
    console.error('checkQuestionSavedAction error:', error);
    return { success: false, isSaved: false };
  }
}
