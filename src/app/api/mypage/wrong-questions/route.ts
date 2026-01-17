import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type {
  WrongQuestionsResult,
  WrongQuestionsFilters,
  WrongQuestion,
} from '@/types/mypage-stats';
import type { WrongNoteWithQuestion } from '@/types/database';

/**
 * GET /api/mypage/wrong-questions
 * Get wrong questions list for authenticated user (from wrong_notes table)
 * Query params: categoryId?, isReviewed? (true|false)
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
    const isReviewedParam = searchParams.get('isReviewed');
    const isReviewed = isReviewedParam ? isReviewedParam === 'true' : undefined;

    // Build query
    let query = supabase
      .from('wrong_notes')
      .select(
        `
        *,
        questions(
          *,
          categories(*)
        )
      `
      )
      .eq('user_id', user.id)
      .order('last_wrong_at', { ascending: false });

    // Apply filters
    if (isReviewed !== undefined) {
      query = query.eq('is_reviewed', isReviewed);
    }

    const { data: wrongNotes, error } = await query;

    if (error) {
      console.error('Error fetching wrong notes:', error);
      return NextResponse.json(
        {
          success: false,
          error: '오답 목록을 가져오는데 실패했습니다.',
        },
        { status: 500 }
      );
    }

    // Transform to WrongQuestion format
    let wrongQuestions: WrongQuestion[] = (wrongNotes || []).map((note) => {
      const wrongNote = note as WrongNoteWithQuestion;
      return {
        wrongNoteId: wrongNote.id,
        questionId: wrongNote.question_id,
        question: wrongNote.questions,
        category: wrongNote.questions.categories,
        wrongCount: wrongNote.wrong_count,
        lastWrongAt: wrongNote.last_wrong_at,
        isReviewed: wrongNote.is_reviewed,
      };
    });

    // Apply category filter if needed
    if (categoryId) {
      wrongQuestions = wrongQuestions.filter(
        (wq) => wq.question.category_id === categoryId
      );
    }

    const result: WrongQuestionsResult = {
      questions: wrongQuestions,
      total: wrongQuestions.length,
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching wrong questions:', error);
    return NextResponse.json(
      {
        success: false,
        error: '오답 목록을 가져오는데 실패했습니다.',
      },
      { status: 500 }
    );
  }
}

