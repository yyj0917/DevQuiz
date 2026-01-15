'use server';

import { createClient } from '@/lib/supabase/server';
import { generateCategoryQuiz, getCategoryBySlug } from '@/lib/quiz/generate-category-quiz';
import type {
  Question,
  CategoryQuizAttemptInsert,
  QuizAnswerInsert,
  Category,
} from '@/types/database';

export interface StartCategoryQuizResult {
  success: boolean;
  attemptId?: string;
  questions?: Question[];
  error?: string;
}

export interface SubmitAnswerResult {
  success: boolean;
  isCorrect?: boolean;
  error?: string;
}

export interface CompleteCategoryQuizResult {
  success: boolean;
  score?: number;
  accuracy?: number;
  error?: string;
}

/**
 * Start a new category quiz
 */
export async function startCategoryQuizAction(
  categorySlug: string | null,
  mode: 'random' | 'wrong_only',
  count: number
): Promise<StartCategoryQuizResult> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // Get category ID if categorySlug is provided
    let categoryId: string | null = null;
    if (categorySlug) {
      const category = await getCategoryBySlug(categorySlug);
      if (!category || !('id' in category)) {
        return { success: false, error: '카테고리를 찾을 수 없습니다.' };
      }
      categoryId = (category as { id: string }).id;
    }

    // Generate quiz questions
    const questions = await generateCategoryQuiz({
      userId: user.id,
      categoryId,
      mode,
      count,
    });

    if (questions.length === 0) {
      const errorMsg =
        mode === 'wrong_only'
          ? '오답 문제가 없습니다. 랜덤 모드를 선택해주세요.'
          : '문제를 찾을 수 없습니다.';
      return { success: false, error: errorMsg };
    }

    // Create category_quiz_attempts record
    const attemptData: CategoryQuizAttemptInsert = {
      user_id: user.id,
      category_id: categoryId,
      mode,
      question_count: questions.length,
      correct_count: 0,
      completed_at: null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categoryAttemptsQuery = supabase.from('category_quiz_attempts') as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: attempt, error: attemptError } = await categoryAttemptsQuery
      .insert(attemptData)
      .select()
      .single();

    if (attemptError || !attempt) {
      console.error('Error creating attempt:', attemptError);
      return { success: false, error: '퀴즈 시작에 실패했습니다.' };
    }

    return {
      success: true,
      attemptId: (attempt as { id: string }).id,
      questions,
    };
  } catch (error) {
    console.error('startCategoryQuizAction error:', error);
    return { success: false, error: '퀴즈 시작 중 오류가 발생했습니다.' };
  }
}

/**
 * Submit an answer for a category quiz question
 */
export async function submitCategoryAnswerAction(
  attemptId: string,
  questionId: string,
  userAnswer: string
): Promise<SubmitAnswerResult> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // Get the question to check the answer
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (questionError || !question) {
      return { success: false, error: '문제를 찾을 수 없습니다.' };
    }

    // Check if the answer is correct
    const questionData = question as Question;
    const isCorrect = questionData.answer === userAnswer;

    // Save the answer
    const answerData: QuizAnswerInsert = {
      category_attempt_id: attemptId,
      attempt_id: null,
      question_id: questionId,
      user_answer: userAnswer,
      is_correct: isCorrect,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quizAnswersQuery = supabase.from('quiz_answers') as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: answerError } = await quizAnswersQuery.insert(answerData);

    if (answerError) {
      console.error('Error saving answer:', answerError);
      return { success: false, error: '답안 저장에 실패했습니다.' };
    }

    // If wrong, add to wrong_notes or update existing
    if (!isCorrect) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wrongNotesQuery = supabase.from('wrong_notes') as any;
      const { data: existingNote } = await wrongNotesQuery
        .select('*')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .maybeSingle();

      if (existingNote && typeof existingNote === 'object' && 'id' in existingNote) {
        const note = existingNote as { id: string; wrong_count: number };
        // Update existing wrong note
        await wrongNotesQuery
          .update({
            wrong_count: note.wrong_count + 1,
            last_wrong_at: new Date().toISOString(),
            is_reviewed: false,
          })
          .eq('id', note.id);
      } else {
        // Create new wrong note
        await wrongNotesQuery.insert({
          user_id: user.id,
          question_id: questionId,
          wrong_count: 1,
        });
      }
    }

    return { success: true, isCorrect };
  } catch (error) {
    console.error('submitCategoryAnswerAction error:', error);
    return { success: false, error: '답안 제출 중 오류가 발생했습니다.' };
  }
}

/**
 * Complete category quiz and calculate score
 */
export async function completeCategoryQuizAction(
  attemptId: string
): Promise<CompleteCategoryQuizResult> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // Get all answers for this attempt
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quizAnswersQuery = supabase.from('quiz_answers') as any;
    const { data: answers, error: answersError } = await quizAnswersQuery
      .select('*')
      .eq('category_attempt_id', attemptId);

    if (answersError) {
      console.error('Error fetching answers:', answersError);
      return { success: false, error: '답안을 가져오는데 실패했습니다.' };
    }

    const answersArray = (answers as Array<{ is_correct: boolean }>) || [];
    const correctCount = answersArray.filter((a) => a.is_correct).length;
    const totalCount = answersArray.length;
    const accuracy = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

    // Update attempt with completion data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categoryAttemptsQuery = supabase.from('category_quiz_attempts') as any;
    const { error: updateError } = await categoryAttemptsQuery
      .update({
        correct_count: correctCount,
        completed_at: new Date().toISOString(),
      })
      .eq('id', attemptId);

    if (updateError) {
      console.error('Error updating attempt:', updateError);
      return { success: false, error: '퀴즈 완료 처리에 실패했습니다.' };
    }

    // Note: Category quiz does NOT affect user_streaks
    // Only daily quiz affects streaks

    return {
      success: true,
      score: correctCount,
      accuracy: Math.round(accuracy),
    };
  } catch (error) {
    console.error('completeCategoryQuizAction error:', error);
    return { success: false, error: '퀴즈 완료 중 오류가 발생했습니다.' };
  }
}

/**
 * Get all categories with stats
 */
export async function getCategoriesWithStatsAction() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get all active categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('order_index');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return { success: false, error: '카테고리를 가져오는데 실패했습니다.' };
    }

    // Get question counts for each category
    const categoriesWithStats = await Promise.all(
      (categories || []).map(async (category) => {
        // Count total questions
        const { count: totalCount } = await supabase
          .from('questions')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', (category as { id: string }).id)
          .eq('is_active', true);

        let userStats = null;

        if (user) {
          // 사용자의 카테고리별 퀴즈 답변 조회
          // 1. 사용자의 category_quiz_attempts 조회 (해당 카테고리)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const categoryAttemptsQuery = supabase.from('category_quiz_attempts') as any;
          const { data: userAttempts } = await categoryAttemptsQuery
            .select('id')
            .eq('user_id', user.id)
            .eq('category_id', (category as { id: string }).id);

          if (userAttempts && userAttempts.length > 0) {
            const attemptIds = (userAttempts as Array<{ id: string }>).map((a) => a.id);

            // 2. 해당 attempts의 quiz_answers 조회
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const quizAnswersQuery = supabase.from('quiz_answers') as any;
            const { data: userAnswers } = await quizAnswersQuery
              .select('question_id, is_correct')
              .in('category_attempt_id', attemptIds);

            if (userAnswers && Array.isArray(userAnswers)) {
              // 고유 question_id 개수 계산 (중복 제거)
              const uniqueQuestionIds = new Set(
                (userAnswers as Array<{ question_id: string }>).map((a) => a.question_id)
              );
              const solvedCount = uniqueQuestionIds.size;

              // 정답 수 계산
              const correctCount = (userAnswers as Array<{ is_correct: boolean }>).filter(
                (a) => a.is_correct === true
              ).length;

              // 총 답변 수 (중복 포함)
              const totalAnswered = userAnswers.length;

              // 진행률 계산
              const totalQuestions = totalCount || 0;
              const progressPercentage =
                totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 0;

              if (solvedCount > 0 || totalAnswered > 0) {
                userStats = {
                  user_total_count: totalAnswered,
                  user_correct_count: correctCount,
                  user_solved_count: solvedCount,
                  accuracy: totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0,
                  progress_percentage: progressPercentage,
                };
              }
            }
          }
        }

        const categoryObj = category as Category;
        return {
          ...categoryObj,
          total_questions: totalCount || 0,
          ...userStats,
        };
      })
    );

    return { success: true, categories: categoriesWithStats };
  } catch (error) {
    console.error('getCategoriesWithStatsAction error:', error);
    return { success: false, error: '카테고리 통계를 가져오는데 실패했습니다.' };
  }
}
