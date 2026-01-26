'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { userQuestionSchema } from '@/lib/validations/question';
import type { QuestionInsert, Question, Category, Profile } from '@/types/database';
import type { QuestionStatus } from '@/types/quiz';
import type {
  CreateUserQuestionResult,
  GetUserQuestionsResult,
  UpdateUserQuestionResult,
  DeleteUserQuestionResult,
} from '@/types/actions';
import type { QuestionWithCreator } from '@/types/database';

/**
 * User question form input type
 */
export interface CreateQuestionInput {
  category_id: string;
  type: 'multiple' | 'ox' | 'blank' | 'code';
  difficulty: number;
  question: string;
  options?: string[] | null;
  answer: string;
  explanation: string | null;
  code_snippet?: string | null;
  tags?: string[];
}

/**
 * Check user authentication
 */
async function checkAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('로그인이 필요합니다');
  }

  return { supabase, user };
}

/**
 * Create a new user question
 */
export async function createQuestion(formData: CreateQuestionInput): Promise<CreateUserQuestionResult> {
  try {
    // 사용자 인증 확인
    const { supabase, user } = await checkAuth();

    // Zod 스키마로 입력 검증
    const validated = userQuestionSchema.parse(formData);

    // category_id가 유효한지 확인
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', validated.category_id)
      .single();

    if (categoryError || !category) {
      return { success: false, error: '유효하지 않은 카테고리입니다' };
    }

    // questions 테이블에 INSERT
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
      source: null,
      is_active: false, // 승인 전까지 비활성
      created_by: user.id, // 현재 유저 ID
      is_user_created: true, // 유저 생성 문제
      status: 'pending', // 승인 대기 상태
    };

    const result = await (supabase
      .from('questions')
      .insert(questionData as any)
      .select(
        `
        *,
        categories(id, name, slug, icon, description, order_index, is_active, created_at)
      `
      )
      .single()) as {
      data: (Question & { categories: Category }) | null;
      error: unknown;
    };

    const { data: newQuestion, error } = result;

    if (error || !newQuestion) {
      console.error('Error creating question:', error);
      return { success: false, error: '문제 생성에 실패했습니다. 다시 시도해주세요' };
    }

    // 제작자 정보 조회
    type CreatorData = {
      id: string;
      nickname: string | null;
      avatar_url: string | null;
    };

    const { data: creator } = (await supabase
      .from('profiles')
      .select('id, nickname, avatar_url')
      .eq('id', user.id)
      .single()) as { data: CreatorData | null; error: unknown };

    const questionWithCreator: QuestionWithCreator = {
      ...newQuestion,
      creator: creator
        ? {
            id: creator.id,
            nickname: creator.nickname || '익명',
            avatar_url: creator.avatar_url,
          }
        : null,
    };

    // 캐시 무효화
    revalidatePath('/my-quizzes');

    return { success: true, question: questionWithCreator };
  } catch (error) {
    console.error('createQuestion error:', error);

    // Zod 검증 에러 처리
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as { issues: Array<{ message: string }> };
      const firstError = zodError.issues[0];
      return { success: false, error: firstError.message };
    }

    const errorMessage = error instanceof Error ? error.message : '문제가 발생했습니다. 다시 시도해주세요';
    return { success: false, error: errorMessage };
  }
}

/**
 * Get my questions with filters and pagination
 */
export async function getMyQuestions(options?: {
  status?: QuestionStatus;
  page?: number;
  limit?: number;
}): Promise<GetUserQuestionsResult> {
  try {
    // 사용자 인증 확인
    const { supabase, user } = await checkAuth();

    const { status, page = 1, limit = 20 } = options || {};

    // 본인 문제만 조회
    let query = supabase
      .from('questions')
      .select(
        `
        *,
        categories(id, name, slug, icon, description, order_index, is_active, created_at)
      `,
        { count: 'exact' }
      )
      .eq('created_by', user.id)
      .eq('is_user_created', true);

    // status 필터 (선택)
    if (status) {
      query = query.eq('status', status);
    }

    // 정렬: 최신순
    query = query.order('created_at', { ascending: false });

    // 페이지네이션
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching my questions:', error);
      return { success: false, error: '문제를 가져오는데 실패했습니다' };
    }

    // 제작자 정보 추가
    type CreatorData = {
      id: string;
      nickname: string | null;
      avatar_url: string | null;
    };

    const { data: creator } = (await supabase
      .from('profiles')
      .select('id, nickname, avatar_url')
      .eq('id', user.id)
      .single()) as { data: CreatorData | null; error: unknown };

    type QuestionWithCategory = Question & { categories: Category };
    const questionsWithCreator: QuestionWithCreator[] = (data || []).map(
      (q: QuestionWithCategory) => ({
        ...q,
        creator: creator
          ? {
              id: creator.id,
              nickname: creator.nickname || '익명',
              avatar_url: creator.avatar_url,
            }
          : null,
      })
    );

    return {
      success: true,
      questions: questionsWithCreator,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error('getMyQuestions error:', error);
    const errorMessage = error instanceof Error ? error.message : '문제가 발생했습니다. 다시 시도해주세요';
    return { success: false, error: errorMessage };
  }
}

/**
 * Get my question by ID (for edit page)
 */
export async function getMyQuestionById(id: string): Promise<CreateUserQuestionResult> {
  try {
    // 사용자 인증 확인
    const { supabase, user } = await checkAuth();

    // 본인 문제만 조회
    const { data, error } = await supabase
      .from('questions')
      .select(
        `
        *,
        categories(id, name, slug, icon, description, order_index, is_active, created_at)
      `
      )
      .eq('id', id)
      .eq('created_by', user.id)
      .eq('is_user_created', true)
      .single();

    if (error) {
      console.error('Error fetching question:', error);
      return { success: false, error: '문제를 찾을 수 없습니다' };
    }

    if (!data) {
      return { success: false, error: '권한이 없습니다' };
    }

    // 제작자 정보 조회
    type CreatorData = {
      id: string;
      nickname: string | null;
      avatar_url: string | null;
    };

    const { data: creator } = (await supabase
      .from('profiles')
      .select('id, nickname, avatar_url')
      .eq('id', user.id)
      .single()) as { data: CreatorData | null; error: unknown };

    type QuestionWithCategory = Question & { categories: Category };
    const questionWithCreator: QuestionWithCreator = {
      ...(data as QuestionWithCategory),
      creator: creator
        ? {
            id: creator.id,
            nickname: creator.nickname || '익명',
            avatar_url: creator.avatar_url,
          }
        : null,
    };

    return { success: true, question: questionWithCreator };
  } catch (error) {
    console.error('getMyQuestionById error:', error);
    const errorMessage = error instanceof Error ? error.message : '문제가 발생했습니다. 다시 시도해주세요';
    return { success: false, error: errorMessage };
  }
}

/**
 * Update my question
 */
export async function updateMyQuestion(
  id: string,
  formData: CreateQuestionInput
): Promise<UpdateUserQuestionResult> {
  try {
    // 사용자 인증 확인
    const { supabase, user } = await checkAuth();

    // 본인 문제인지 확인
    type QuestionCheck = Pick<Question, 'id' | 'created_by' | 'is_user_created' | 'status'>;
    const { data: existingQuestion, error: fetchError } = (await supabase
      .from('questions')
      .select('id, created_by, is_user_created, status')
      .eq('id', id)
      .single()) as { data: QuestionCheck | null; error: unknown };

    if (fetchError || !existingQuestion) {
      return { success: false, error: '문제를 찾을 수 없습니다' };
    }

    // 본인 문제인지 확인
    if (existingQuestion.created_by !== user.id || !existingQuestion.is_user_created) {
      return { success: false, error: '권한이 없습니다' };
    }

    // pending 상태인지 확인
    if (existingQuestion.status !== 'pending') {
      return { success: false, error: '이미 검토된 문제는 수정할 수 없습니다' };
    }

    // Zod 검증
    const validated = userQuestionSchema.parse(formData);

    // category_id가 유효한지 확인
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', validated.category_id)
      .single();

    if (categoryError || !category) {
      return { success: false, error: '유효하지 않은 카테고리입니다' };
    }

    // UPDATE
    const { error: updateError } = await (supabase.from('questions') as any).update({
      category_id: validated.category_id,
      type: validated.type,
      difficulty: validated.difficulty,
      question: validated.question,
      options: validated.options || null,
      answer: validated.answer,
      explanation: validated.explanation,
      code_snippet: validated.code_snippet || null,
      tags: validated.tags || [],
      updated_at: new Date().toISOString(),
    }).eq('id', id);

    if (updateError) {
      console.error('Error updating question:', updateError);
      return { success: false, error: '문제 수정에 실패했습니다. 다시 시도해주세요' };
    }

    // 캐시 무효화
    revalidatePath('/my-quizzes');
    revalidatePath(`/my-quizzes/${id}`);

    return { success: true, data: null };
  } catch (error) {
    console.error('updateMyQuestion error:', error);

    // Zod 검증 에러 처리
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as { issues: Array<{ message: string }> };
      const firstError = zodError.issues[0];
      return { success: false, error: firstError.message };
    }

    const errorMessage = error instanceof Error ? error.message : '문제가 발생했습니다. 다시 시도해주세요';
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete my question
 */
export async function deleteMyQuestion(id: string): Promise<DeleteUserQuestionResult> {
  try {
    // 사용자 인증 확인
    const { supabase, user } = await checkAuth();

    // 본인 문제인지 확인
    type QuestionCheck = Pick<Question, 'id' | 'created_by' | 'is_user_created'>;
    const { data: existingQuestion, error: fetchError } = (await supabase
      .from('questions')
      .select('id, created_by, is_user_created')
      .eq('id', id)
      .single()) as { data: QuestionCheck | null; error: unknown };

    if (fetchError || !existingQuestion) {
      return { success: false, error: '문제를 찾을 수 없습니다' };
    }

    // 본인 문제인지 확인
    if (existingQuestion.created_by !== user.id || !existingQuestion.is_user_created) {
      return { success: false, error: '권한이 없습니다' };
    }

    // DELETE
    const { error: deleteError } = await supabase.from('questions').delete().eq('id', id);

    if (deleteError) {
      console.error('Error deleting question:', deleteError);
      return { success: false, error: '문제 삭제에 실패했습니다. 다시 시도해주세요' };
    }

    // 캐시 무효화
    revalidatePath('/my-quizzes');

    return { success: true, data: null };
  } catch (error) {
    console.error('deleteMyQuestion error:', error);
    const errorMessage = error instanceof Error ? error.message : '문제가 발생했습니다. 다시 시도해주세요';
    return { success: false, error: errorMessage };
  }
}
