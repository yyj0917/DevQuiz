import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type {
  SolvedQuestionsResult,
  SolvedQuestionsFilters,
  SolvedQuestion,
} from '@/types/mypage-stats';
import type { QuestionWithCategory } from '@/types/database';

/**
 * GET /api/mypage/solved-questions
 * Get solved questions list for authenticated user (unique question_id)
 * Query params: categoryId?, result? (all|correct|wrong), page? (default: 1), pageSize? (default: 20)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const result = (searchParams.get('result') as 'all' | 'correct' | 'wrong') || 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    // Get all user's quiz attempts
    const { data: dailyAttempts } = await supabase
      .from('quiz_attempts')
      .select('id')
      .eq('user_id', user.id);

    const { data: categoryAttempts } = await supabase
      .from('category_quiz_attempts')
      .select('id')
      .eq('user_id', user.id);

    const dailyAttemptIds = ((dailyAttempts || []) as Array<{ id: string }>).map((a) => a.id);
    const categoryAttemptIds = ((categoryAttempts || []) as Array<{ id: string }>).map((a) => a.id);

    // Get all quiz answers grouped by question_id
    let allAnswers: Array<{
      question_id: string;
      is_correct: boolean;
      answered_at: string;
    }> = [];

    if (dailyAttemptIds.length > 0) {
      const { data: dailyAnswers } = await supabase
        .from('quiz_answers')
        .select('question_id, is_correct, answered_at')
        .in('attempt_id', dailyAttemptIds);

      if (dailyAnswers) {
        allAnswers = allAnswers.concat(dailyAnswers);
      }
    }

    if (categoryAttemptIds.length > 0) {
      const { data: categoryAnswers } = await supabase
        .from('quiz_answers')
        .select('question_id, is_correct, answered_at')
        .in('category_attempt_id', categoryAttemptIds);

      if (categoryAnswers) {
        allAnswers = allAnswers.concat(categoryAnswers);
      }
    }

    // Group by question_id and calculate stats
    const questionStatsMap = new Map<
      string,
      {
        answeredCount: number;
        correctCount: number;
        lastAnsweredAt: string;
        isCorrect: boolean;
      }
    >();

    allAnswers.forEach((answer) => {
      const existing = questionStatsMap.get(answer.question_id);

      if (!existing) {
        questionStatsMap.set(answer.question_id, {
          answeredCount: 1,
          correctCount: answer.is_correct ? 1 : 0,
          lastAnsweredAt: answer.answered_at,
          isCorrect: answer.is_correct,
        });
      } else {
        existing.answeredCount += 1;
        if (answer.is_correct) {
          existing.correctCount += 1;
        }
        // Update last answered at if newer
        if (new Date(answer.answered_at) > new Date(existing.lastAnsweredAt)) {
          existing.lastAnsweredAt = answer.answered_at;
          existing.isCorrect = answer.is_correct;
        }
      }
    });

    // Apply filters
    let filteredQuestionIds = Array.from(questionStatsMap.keys());

    if (result === 'correct') {
      filteredQuestionIds = filteredQuestionIds.filter(
        (id) => questionStatsMap.get(id)?.isCorrect === true
      );
    } else if (result === 'wrong') {
      filteredQuestionIds = filteredQuestionIds.filter(
        (id) => questionStatsMap.get(id)?.isCorrect === false
      );
    }

    // Get question details for filtered questions
    let questionsQuery = supabase
      .from('questions')
      .select(
        `
        *,
        categories(*)
      `
      )
      .in('id', filteredQuestionIds)
      .eq('is_active', true);

    if (categoryId) {
      questionsQuery = questionsQuery.eq('category_id', categoryId);
    }

    const { data: questionsData, count } = await questionsQuery;

    // Sort by last answered at (newest first)
    const questionsWithStats = ((questionsData || []) as QuestionWithCategory[])
      .map((q) => {
        const stats = questionStatsMap.get(q.id);
        if (!stats) return null;

        return {
          questionId: q.id,
          question: q,
          category: q.categories,
          answeredCount: stats.answeredCount,
          correctCount: stats.correctCount,
          lastAnsweredAt: stats.lastAnsweredAt,
          isCorrect: stats.isCorrect,
        } as SolvedQuestion;
      })
      .filter((q): q is SolvedQuestion => q !== null)
      .sort((a, b) => {
        const dateA = new Date(a.lastAnsweredAt).getTime();
        const dateB = new Date(b.lastAnsweredAt).getTime();
        return dateB - dateA; // newest first
      });

    // Apply pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    const paginatedQuestions = questionsWithStats.slice(start, end);

    const total = questionsWithStats.length;
    const totalPages = Math.ceil(total / pageSize);

    const result_data: SolvedQuestionsResult = {
      questions: paginatedQuestions,
      total,
      page,
      pageSize,
      totalPages,
    };

    return NextResponse.json({
      success: true,
      data: result_data,
    });
  } catch (error) {
    console.error('Error fetching solved questions:', error);
    return NextResponse.json(
      {
        success: false,
        error: '푼 문제 목록을 가져오는데 실패했습니다.',
      },
      { status: 500 }
    );
  }
}

