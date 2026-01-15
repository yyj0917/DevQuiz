'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuizModeSelector } from '@/components/quiz/quiz-mode-selector';
import { CategoryQuizClient } from '@/components/quiz/category-quiz-client';
import { startCategoryQuizAction } from '../category/actions';
import type { Question } from '@/types/database';

export default function RandomQuizPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [quizState, setQuizState] = useState<{
    attemptId: string;
    questions: Question[];
  } | null>(null);

  const handleStart = async (mode: 'random' | 'wrong_only', count: number) => {
    setIsLoading(true);

    // Pass null as categorySlug for random quiz
    const result = await startCategoryQuizAction(null, mode, count);

    if (result.success && result.attemptId && result.questions) {
      setQuizState({
        attemptId: result.attemptId,
        questions: result.questions,
      });
    } else {
      alert(result.error || '퀴즈 시작에 실패했습니다.');
    }

    setIsLoading(false);
  };

  // Quiz in progress
  if (quizState) {
    return (
      <CategoryQuizClient
        attemptId={quizState.attemptId}
        questions={quizState.questions}
        categoryName={null}
      />
    );
  }

  // Quiz setup
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Random Quiz Info */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-md p-8 mb-6 border-2 border-purple-200">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🎲</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              랜덤 퀴즈
            </h1>
            <p className="text-gray-600">
              모든 카테고리에서 랜덤으로 문제를 출제합니다
            </p>
          </div>

          <div className="flex items-center justify-center py-4 border-t border-purple-200">
            <div className="text-center">
              <div className="text-sm text-purple-600 font-medium">
                전체 카테고리 ✨
              </div>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            퀴즈 설정
          </h2>
          <QuizModeSelector onStart={handleStart} isLoading={isLoading} />
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mt-6 w-full py-3 text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← 뒤로 가기
        </button>
      </div>
    </div>
  );
}
