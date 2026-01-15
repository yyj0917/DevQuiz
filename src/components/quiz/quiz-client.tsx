'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { QuestionCard } from './question-card';
import { AnswerModal } from './answer-modal';
import { submitAnswerAction, completeQuizAction } from '@/app/(pages)/quiz/actions';
import type { DailyQuizQuestion, QuizAnswerPayload, QuizSubmissionResult } from '@/types/quiz';

type QuizClientProps = {
  attemptId: string;
  questions: DailyQuizQuestion[];
};

export function QuizClient({ attemptId, questions }: QuizClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, QuizAnswerPayload>>(new Map());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalResult, setModalResult] = useState<QuizSubmissionResult | null>(null);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers.get(currentIndex) || null;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;
  const canSubmit = currentAnswer !== null;

  const handleAnswerChange = (payload: QuizAnswerPayload) => {
    setAnswers((prev) => {
      const newMap = new Map(prev);
      newMap.set(currentIndex, payload);
      return newMap;
    });
  };

  const handleSubmit = () => {
    if (!currentAnswer || !currentQuestion) return;

    startTransition(async () => {
      try {
        const result = await submitAnswerAction({
          attemptId,
          questionId: currentQuestion.id,
          payload: currentAnswer,
        });

        setModalResult(result);
        setModalOpen(true);
      } catch (error) {
        console.error('Answer submission error:', error);
        alert(error instanceof Error ? error.message : '답변 제출 중 오류가 발생했습니다');
      }
    });
  };

  const handleNext = () => {
    setModalOpen(false);
    setModalResult(null);

    if (isLastQuestion) {
      // 마지막 문제면 완료 처리
      handleComplete();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleComplete = () => {
    startTransition(async () => {
      try {
        const result = await completeQuizAction({ attemptId });
        router.push(`/quiz/result?attempt=${attemptId}`);
      } catch (error) {
        console.error('Quiz completion error:', error);
        alert(error instanceof Error ? error.message : '퀴즈 완료 처리 중 오류가 발생했습니다');
      }
    });
  };

  const handleViewResults = () => {
    setModalOpen(false);
    handleComplete();
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">
              Question {currentIndex + 1} of {questions.length}
            </h1>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <QuestionCard
          question={currentQuestion}
          currentAnswer={currentAnswer}
          onAnswerChange={handleAnswerChange}
        />

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isPending}
          className="w-full h-12 text-base rounded-2xl bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-50"
        >
          {isPending ? '제출 중...' : '정답 확인'}
        </Button>

        {/* Answer Modal */}
        <AnswerModal
          open={modalOpen}
          result={modalResult}
          isLastQuestion={isLastQuestion}
          onNext={handleNext}
          onViewResults={handleViewResults}
        />
      </div>
    </div>
  );
}
