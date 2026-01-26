'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isAdminEmail } from '@/lib/constants/admin';
import { questionSchema } from '@/lib/validations/question';
import type { Category, Question, QuestionInsert, QuestionUpdate } from '@/types/database';
import type {
  GetQuestionsResult,
  GetQuestionByIdResult,
  CreateQuestionResult,
  UpdateQuestionResult,
  DeleteQuestionResult,
  ToggleQuestionActiveResult,
  BulkDeleteQuestionsResult,
  BulkToggleActiveResult,
  GetDashboardStatsResult,
  GetCategoriesResult,
} from '@/types/actions';
import { UUID } from 'crypto';

/**
 * Check admin authorization
 */
async function checkAdminAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || !isAdminEmail(user.email)) {
    throw new Error('Unauthorized');
  }

  return { supabase, user };
}

/**
 * Get questions with filters and pagination
 */
export async function getQuestionsAction(params: {
  page?: number;
  limit?: number;
  categoryId?: string;
  difficulty?: number;
  type?: string;
  isActive?: boolean;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'most_attempted';
}): Promise<GetQuestionsResult> {
  try {
    const { supabase } = await checkAdminAuth();

    const {
      page = 1,
      limit = 20,
      categoryId,
      difficulty,
      type,
      isActive,
      search,
      sortBy = 'newest',
    } = params;

    let query = supabase
      .from('questions')
      .select(
        `
        *,
        categories(id, name, slug, icon)
      `,
        { count: 'exact' }
      );

    // Apply filters
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (typeof isActive === 'boolean') {
      query = query.eq('is_active', isActive);
    }
    if (search) {
      query = query.ilike('question', `%${search}%`);
    }

    // Sorting
    switch (sortBy) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'most_attempted':
        query = query.order('stats->attempts', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching questions:', error);
      return { success: false, error: '문제를 가져오는데 실패했습니다.' };
    }

    type QuestionWithCategory = Question & { categories: Category };
    return {
      success: true,
      questions: (data || []) as QuestionWithCategory[],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error('getQuestionsAction error:', error);
    return { success: false, error: '권한이 없습니다.' };
  }
}

/**
 * Get question by ID
 */
export async function getQuestionByIdAction(id: string): Promise<GetQuestionByIdResult> {
  const uuid = id as UUID
  try {
    const { supabase } = await checkAdminAuth();

    const { data, error } = await supabase
      .from('questions')
      .select(
        `
        *,
        categories(id, name, slug, icon)
      `
      )
      .eq('id', uuid)
      .single();

    if (error) {
      console.error('Error fetching question:', error);
      return { success: false, question: null, error: '문제를 찾을 수 없습니다.' };
    }

    type QuestionWithCategory = Question & { categories: Category };
    return { success: true, question: data as QuestionWithCategory };
  } catch (error) {
    console.error('getQuestionByIdAction error:', error);
    return { success: false, question: null, error: '권한이 없습니다.' };
  }
}

/**
 * Create new question
 */
export async function createQuestionAction(data: QuestionFormInput): Promise<CreateQuestionResult> {
  try {
    const { supabase } = await checkAdminAuth();

    // Validate with Zod
    const validated = questionSchema.parse(data);

    const questionData: QuestionInsert = {
      category_id: validated.category_id,
      type: validated.type,
      difficulty: validated.difficulty,
      question: validated.question,
      options: validated.options || null,
      answer: validated.answer,
      explanation: validated.explanation,
      code_snippet: validated.code_snippet || null,
      tags: validated.tags || [],
      source: validated.source || null,
      is_active: validated.is_active,
      status: 'approved', // Admin-created questions are auto-approved
      created_by: null, // System/admin created, not user-created
      is_user_created: false, // Not user-created
    };

    const result = await (supabase
      .from('questions')
      .insert(questionData as any)
      .select()
      .single()) as { data: Question | null; error: unknown };
    
    const { data: newQuestion, error } = result;

    if (error || !newQuestion) {
      console.error('Error creating question:', error);
      return { success: false, error: '문제 생성에 실패했습니다.' };
    }

    revalidatePath('/admin/questions');
    return { success: true, question: newQuestion };
  } catch (error) {
    console.error('createQuestionAction error:', error);
    const errorMessage = error instanceof Error ? error.message : '문제 생성 중 오류가 발생했습니다.';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Update question
 */
export async function updateQuestionAction(
  id: string,
  data: QuestionFormInput
): Promise<UpdateQuestionResult> {
  try {
    const { supabase } = await checkAdminAuth();

    // Validate with Zod
    const validated = questionSchema.parse(data);

    const questionData: QuestionUpdate = {
      category_id: validated.category_id,
      type: validated.type,
      difficulty: validated.difficulty,
      question: validated.question,
      options: validated.options || null,
      answer: validated.answer,
      explanation: validated.explanation,
      code_snippet: validated.code_snippet || null,
      tags: validated.tags || [],
      source: validated.source || null,
      is_active: validated.is_active,
      updated_at: new Date().toISOString(),
    };

    const { error } = await ((supabase
      .from('questions') as any)
      .update(questionData)
      .eq('id', id));

    if (error) {
      console.error('Error updating question:', error);
      return { success: false, error: '문제 수정에 실패했습니다.' };
    }

    revalidatePath('/admin/questions');
    revalidatePath(`/admin/questions/${id}`);
    return { success: true, data: null };
  } catch (error) {
    console.error('updateQuestionAction error:', error);
    const errorMessage = error instanceof Error ? error.message : '문제 수정 중 오류가 발생했습니다.';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Delete question
 */
export async function deleteQuestionAction(id: string): Promise<DeleteQuestionResult> {
  try {
    const { supabase } = await checkAdminAuth();

    const { error } = await supabase.from('questions').delete().eq('id', id);

    if (error) {
      console.error('Error deleting question:', error);
      return { success: false, error: '문제 삭제에 실패했습니다.' };
    }

    revalidatePath('/admin/questions');
    return { success: true, data: null };
  } catch (error) {
    console.error('deleteQuestionAction error:', error);
    return { success: false, error: '권한이 없습니다.' };
  }
}

/**
 * Toggle question active status
 */
export async function toggleQuestionActiveAction(
  id: string,
  isActive: boolean
): Promise<ToggleQuestionActiveResult> {
  try {
    const { supabase } = await checkAdminAuth();

    const { error } = await ((supabase
      .from('questions') as any)
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id));

    if (error) {
      console.error('Error toggling question:', error);
      return { success: false, error: '문제 상태 변경에 실패했습니다.' };
    }

    revalidatePath('/admin/questions');
    return { success: true, data: null };
  } catch (error) {
    console.error('toggleQuestionActiveAction error:', error);
    return { success: false, error: '권한이 없습니다.' };
  }
}

/**
 * Bulk delete questions
 */
export async function bulkDeleteQuestionsAction(ids: string[]): Promise<BulkDeleteQuestionsResult> {
  try {
    const { supabase } = await checkAdminAuth();

    const { error } = await supabase.from('questions').delete().in('id', ids);

    if (error) {
      console.error('Error bulk deleting:', error);
      return { success: false, error: '일괄 삭제에 실패했습니다.' };
    }

    revalidatePath('/admin/questions');
    return { success: true, deletedCount: ids.length };
  } catch (error) {
    console.error('bulkDeleteQuestionsAction error:', error);
    return { success: false, error: '권한이 없습니다.' };
  }
}

/**
 * Bulk toggle active status
 */
export async function bulkToggleActiveAction(
  ids: string[],
  isActive: boolean
): Promise<BulkToggleActiveResult> {
  try {
    const { supabase } = await checkAdminAuth();

    const { error } = await ((supabase
      .from('questions') as any)
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .in('id', ids));

    if (error) {
      console.error('Error bulk toggling:', error);
      return { success: false, error: '일괄 상태 변경에 실패했습니다.' };
    }

    revalidatePath('/admin/questions');
    return { success: true, updatedCount: ids.length };
  } catch (error) {
    console.error('bulkToggleActiveAction error:', error);
    return { success: false, error: '권한이 없습니다.' };
  }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStatsAction(): Promise<GetDashboardStatsResult> {
  try {
    const { supabase } = await checkAdminAuth();

    // Total questions
    const { count: totalQuestions } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });

    // Active questions
    const { count: activeQuestions } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Pending reports
    const { count: pendingReports } = await supabase
      .from('question_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Category stats
    const { data: categoryStats } = await supabase
      .from('questions')
      .select(
        `
        category_id,
        categories(name)
      `
      )
      .eq('is_active', true);

    type CategoryStat = {
      category_id: string;
      categories: { name: string } | null;
    };
    const categoryCounts = (categoryStats as CategoryStat[] | null)?.reduce(
      (acc, q) => {
        const name = q.categories?.name || 'Unknown';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

    // Recent questions
    const { data: recentQuestions } = await supabase
      .from('questions')
      .select(
        `
        id,
        question,
        created_at,
        categories(name, icon)
      `
      )
      .order('created_at', { ascending: false })
      .limit(5);

    type RecentQuestion = {
      id: string;
      question: string;
      created_at: string;
      categories: { name: string; icon: string | null } | null;
    };

    return {
      success: true,
      stats: {
        totalQuestions: totalQuestions || 0,
        activeQuestions: activeQuestions || 0,
        inactiveQuestions: (totalQuestions || 0) - (activeQuestions || 0),
        pendingReports: pendingReports || 0,
        categoryCounts,
        recentQuestions: (recentQuestions || []) as RecentQuestion[],
      },
    };
  } catch (error) {
    console.error('getDashboardStatsAction error:', error);
    return { success: false, error: '통계를 가져오는데 실패했습니다.' };
  }
}

/**
 * Get all categories
 */
export async function getCategoriesAction(): Promise<GetCategoriesResult> {
  try {
    const { supabase } = await checkAdminAuth();

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return { success: false, error: '카테고리를 가져오는데 실패했습니다.' };
    }

    return { success: true, categories: data || [] };
  } catch (error) {
    console.error('getCategoriesAction error:', error);
    return { success: false, error: '권한이 없습니다.' };
  }
}

// Type for form input
export interface QuestionFormInput {
  category_id: string;
  type: 'multiple' | 'ox' | 'blank' | 'code';
  difficulty: number;
  question: string;
  options?: string[] | null;
  answer: string;
  explanation: string | null;
  code_snippet?: string | null;
  tags?: string[];
  source?: string | null;
  is_active: boolean;
}
