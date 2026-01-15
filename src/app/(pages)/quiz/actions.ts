'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { generateTodayQuiz } from '@/lib/quiz/generate-daily-quiz';
import { quizAnswerSchema } from '@/lib/validations/quiz';
import { QuizGenerationError, QuizSubmissionError } from '@/lib/errors';
import { getTodayDateKey } from '@/lib/quiz/utils';
import { calculateStreak } from '@/lib/quiz/utils';
import type { QuizAnswerPayload, QuizSubmissionResult, QuizResult } from '@/types/quiz';

/**
 * 데일리 퀴즈 시작 서버 액션
 */
export async function startDailyQuizAction() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new QuizGenerationError('인증되지 않은 사용자입니다', 'UNAUTHORIZED');
  }

  const todayDate = getTodayDateKey();

  // 오늘자 진행 중/완료된 attempt 조회
  const { data: existingAttempt } = (await supabase
    .from('quiz_attempts')
    .select('id, is_completed, date')
    .eq('user_id', user.id)
    .eq('date', todayDate)
    .maybeSingle()) as any;

  // 이미 완료된 attempt가 있으면 해당 attempt 반환
  if (existingAttempt && existingAttempt.is_completed) {
    return {
      attemptId: existingAttempt.id,
      isCompleted: true,
    };
  }

  // 기존 attempt가 있으면 재사용
  if (existingAttempt) {
    // 해당 attempt의 질문들 조회
    const { data: answers } = (await supabase
      .from('quiz_answers')
      .select('questions(*, categories(slug, name))')
      .eq('attempt_id', existingAttempt.id)
      .order('answered_at', { ascending: true })) as any;

    if (answers && answers.length > 0) {
      const questions = answers.map((a: any) => {
        const q = a.questions as any;
        const category = q.categories as { slug: string; name: string } | null;
        return {
          id: q.id,
          category: category?.name || 'Unknown',
          category_id: q.category_id,
          difficulty: q.difficulty as 1 | 2 | 3,
          type: q.type as 'multiple' | 'ox' | 'blank' | 'code',
          question: q.question,
          code_snippet: q.code_snippet,
          options: q.options as string[] | null,
          answer: q.answer,
          explanation: q.explanation,
        };
      });

      return {
        attemptId: existingAttempt.id,
        questions,
        isCompleted: false,
      };
    }
  }

  // 새로운 퀴즈 생성
  const dailyQuiz = await generateTodayQuiz(user.id, supabase);

  // quiz_attempts 생성
  const { data: attempt, error: attemptError } = await (supabase as any)
    .from('quiz_attempts')
    .insert({
      user_id: user.id,
      date: todayDate,
      total_questions: dailyQuiz.questions.length,
      correct_count: 0,
      is_completed: false,
    })
    .select()
    .single();

  if (attemptError || !attempt) {
    throw new QuizGenerationError('퀴즈 시작에 실패했습니다', 'ATTEMPT_CREATE_ERROR');
  }

  return {
    attemptId: attempt.id,
    questions: dailyQuiz.questions,
    isCompleted: false,
  };
}

/**
 * 답변 제출 서버 액션
 */
export async function submitAnswerAction({
  attemptId,
  questionId,
  payload,
}: {
  attemptId: string;
  questionId: string;
  payload: QuizAnswerPayload;
}): Promise<QuizSubmissionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new QuizSubmissionError('인증되지 않은 사용자입니다', 'UNAUTHORIZED');
  }

  // Zod 검증
  const validationResult = quizAnswerSchema.safeParse(payload);

  if (!validationResult.success) {
    const firstError = (validationResult.error as any).errors[0];
    throw new QuizSubmissionError(firstError.message, 'VALIDATION_ERROR');
  }

  // attempt 소유권 확인
  const { data: attempt, error: attemptError } = (await supabase
    .from('quiz_attempts')
    .select('id, user_id, is_completed')
    .eq('id', attemptId)
    .single()) as any;

  if (attemptError || !attempt) {
    throw new QuizSubmissionError('퀴즈 시도를 찾을 수 없습니다', 'ATTEMPT_NOT_FOUND');
  }

  if (attempt.user_id !== user.id) {
    throw new QuizSubmissionError('권한이 없습니다', 'UNAUTHORIZED');
  }

  if (attempt.is_completed) {
    throw new QuizSubmissionError('이미 완료된 퀴즈입니다', 'QUIZ_ALREADY_COMPLETED');
  }

  // 문제 정보 조회
  const { data: question, error: questionError } = await supabase
    .from('questions')
    .select('*')
    .eq('id', questionId)
    .single();

  if (questionError || !question) {
    throw new QuizSubmissionError('문제를 찾을 수 없습니다', 'QUESTION_NOT_FOUND');
  }

  // 답변 형식에 따라 정답 비교
  let userAnswerText: string;
  let isCorrect: boolean;

  switch (payload.type) {
    case 'multiple':
      // 객관식: 선택한 인덱스와 정답 비교
      const options = (question.options as string[]) || [];
      userAnswerText = options[payload.selectedIndex] || '';
      isCorrect = question.answer === userAnswerText;
      break;

    case 'ox':
      // O/X: boolean을 문자열로 변환 후 비교
      userAnswerText = payload.answer ? 'O' : 'X';
      const correctBool = question.answer.toLowerCase() === 'o' || question.answer === 'true';
      isCorrect = payload.answer === correctBool;
      break;

    case 'blank':
    case 'code':
      // 빈칸/코드: 문자열 정확히 비교 (대소문자 무시 가능하게 하려면 .toLowerCase() 사용)
      userAnswerText = payload.answer.trim();
      isCorrect = question.answer.toLowerCase().trim() === userAnswerText.toLowerCase().trim();
      break;

    default:
      throw new QuizSubmissionError('지원하지 않는 문제 유형입니다', 'INVALID_QUESTION_TYPE');
  }

  // 기존 답변 확인
  const { data: existingAnswer } = await supabase
    .from('quiz_answers')
    .select('id')
    .eq('attempt_id', attemptId)
    .eq('question_id', questionId)
    .maybeSingle();

  // 기존 답변이 있으면 업데이트, 없으면 삽입
  if (existingAnswer) {
    const { error: answerError } = await supabase
      .from('quiz_answers')
      .update({
        user_answer: userAnswerText,
        is_correct: isCorrect,
        answered_at: new Date().toISOString(),
      })
      .eq('id', existingAnswer.id);

    if (answerError) {
      throw new QuizSubmissionError('답변 저장에 실패했습니다', 'ANSWER_SAVE_ERROR');
    }
  } else {
    const { error: answerError } = await supabase
      .from('quiz_answers')
      .insert({
        attempt_id: attemptId,
        question_id: questionId,
        user_answer: userAnswerText,
        is_correct: isCorrect,
        answered_at: new Date().toISOString(),
      });

    if (answerError) {
      throw new QuizSubmissionError('답변 저장에 실패했습니다', 'ANSWER_SAVE_ERROR');
    }
  }

  // 정답 표시용 텍스트 준비
  let correctAnswerDisplay = question.answer;
  if (payload.type === 'multiple' && question.options) {
    const options = question.options as string[];
    const correctIndex = options.indexOf(question.answer);
    if (correctIndex >= 0) {
      correctAnswerDisplay = options[correctIndex];
    }
  } else if (payload.type === 'ox') {
    correctAnswerDisplay = question.answer.toLowerCase() === 'o' || question.answer === 'true' ? 'O' : 'X';
  }

  return {
    isCorrect,
    explanation: question.explanation,
    correctAnswerDisplay,
  };
}

/**
 * 퀴즈 완료 서버 액션
 */
export async function completeQuizAction({
  attemptId,
}: {
  attemptId: string;
}): Promise<QuizResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new QuizSubmissionError('인증되지 않은 사용자입니다', 'UNAUTHORIZED');
  }

  // attempt 소유권 확인
  const { data: attempt, error: attemptError } = await supabase
    .from('quiz_attempts')
    .select('id, user_id, date, is_completed, total_questions')
    .eq('id', attemptId)
    .single();

  if (attemptError || !attempt) {
    throw new QuizSubmissionError('퀴즈 시도를 찾을 수 없습니다', 'ATTEMPT_NOT_FOUND');
  }

  if (attempt.user_id !== user.id) {
    throw new QuizSubmissionError('권한이 없습니다', 'UNAUTHORIZED');
  }

  if (attempt.is_completed) {
    // 이미 완료된 경우 기존 결과 반환
    const { data: answers } = await supabase
      .from('quiz_answers')
      .select('is_correct')
      .eq('attempt_id', attemptId);

    const correctCount = answers?.filter((a) => a.is_correct).length || 0;
    const score = correctCount;

    // 스트릭 조회
    const { data: streak } = await supabase
      .from('user_streaks')
      .select('current_streak')
      .eq('user_id', user.id)
      .single();

    return {
      attemptId,
      score,
      totalQuestions: attempt.total_questions,
      correctCount,
      streak: streak?.current_streak || 0,
    };
  }

  // 모든 답변 조회하여 점수 계산
  const { data: answers, error: answersError } = await supabase
    .from('quiz_answers')
    .select('question_id, is_correct')
    .eq('attempt_id', attemptId);

  if (answersError) {
    throw new QuizSubmissionError('답변 조회에 실패했습니다', 'ANSWERS_FETCH_ERROR');
  }

  const correctCount = answers?.filter((a) => a.is_correct).length || 0;
  const score = correctCount;

  // quiz_attempts 업데이트
  const { error: updateError } = await supabase
    .from('quiz_attempts')
    .update({
      correct_count: correctCount,
      is_completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('id', attemptId);

  if (updateError) {
    throw new QuizSubmissionError('퀴즈 완료 처리에 실패했습니다', 'COMPLETE_ERROR');
  }

  // 오답 노트 저장 (틀린 문제만)
  const wrongQuestionIds = answers?.filter((a) => !a.is_correct).map((a) => a.question_id) || [];

  if (wrongQuestionIds.length > 0) {
    // 각 오답에 대해 wrong_notes 업데이트/삽입
    const { data: questions } = await supabase
      .from('questions')
      .select('id, explanation')
      .in('id', wrongQuestionIds);

    if (questions) {
      const wrongNotesToUpsert = wrongQuestionIds.map((questionId) => ({
        user_id: user.id,
        question_id: questionId,
        wrong_count: 1, // upsert로 증가 처리 필요하지만 일단 1로 설정
        last_wrong_at: new Date().toISOString(),
        is_reviewed: false,
      }));

      // upsert (UNIQUE 제약 조건으로 중복 방지)
      for (const note of wrongNotesToUpsert) {
        // 기존 노트 확인
        const { data: existingNote } = await supabase
          .from('wrong_notes')
          .select('wrong_count')
          .eq('user_id', note.user_id)
          .eq('question_id', note.question_id)
          .maybeSingle();

        if (existingNote) {
          // 기존 노트 업데이트 (wrong_count 증가)
          await supabase
            .from('wrong_notes')
            .update({
              wrong_count: existingNote.wrong_count + 1,
              last_wrong_at: note.last_wrong_at,
              is_reviewed: false,
            })
            .eq('user_id', note.user_id)
            .eq('question_id', note.question_id);
        } else {
          // 새 노트 삽입
          await supabase.from('wrong_notes').insert(note);
        }
      }
    }
  }

  // 스트릭 업데이트
  const todayDate = attempt.date || getTodayDateKey();
  const { data: existingStreak } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const { newStreak, shouldIncrement } = calculateStreak(
    existingStreak?.last_quiz_date || null,
    todayDate
  );

  if (shouldIncrement) {
    const newTotalDays = (existingStreak?.total_quiz_days || 0) + 1;
    let newCurrentStreak: number;

    if (existingStreak?.last_quiz_date) {
      const lastDate = new Date(existingStreak.last_quiz_date);
      const today = new Date(todayDate);
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // 연속일
        newCurrentStreak = (existingStreak.current_streak || 0) + 1;
      } else {
        // 연속이 끊어짐
        newCurrentStreak = 1;
      }
    } else {
      // 첫 퀴즈
      newCurrentStreak = 1;
    }

    const newLongestStreak = Math.max(existingStreak?.longest_streak || 0, newCurrentStreak);

    await supabase
      .from('user_streaks')
      .upsert(
        {
          user_id: user.id,
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_quiz_date: todayDate,
          total_quiz_days: newTotalDays,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      );

    return {
      attemptId,
      score,
      totalQuestions: attempt.total_questions,
      correctCount,
      streak: newCurrentStreak,
    };
  }

  // 스트릭이 증가하지 않는 경우 (오늘 이미 퀴즈를 풀었거나 연속이 끊어짐)
  const finalStreak = existingStreak?.current_streak || 0;

  return {
    attemptId,
    score,
    totalQuestions: attempt.total_questions,
    correctCount,
    streak: finalStreak,
  };
}
