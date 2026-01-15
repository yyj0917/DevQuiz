'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QuizModeSelector } from '@/components/quiz/quiz-mode-selector';
import { CategoryQuizClient } from '@/components/quiz/category-quiz-client';
import { startCategoryQuizAction } from '../actions';
import { getCategoryBySlug, getCategoryQuestionCount } from '@/lib/quiz/generate-category-quiz';
import type { Question, Category } from '@/types/database';
import { ChevronLeftIcon } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/loading-spinner';

export default function CategoryQuizPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quizState, setQuizState] = useState<{
    attemptId: string;
    questions: Question[];
  } | null>(null);

  useEffect(() => {
    async function loadCategory() {
      const cat = await getCategoryBySlug(slug);
      if (!cat) {
        router.push('/quiz/category');
        return;
      }

      setCategory(cat);

      const count = await getCategoryQuestionCount((cat as { id: string }).id);
      setTotalQuestions(count);
      setIsLoading(false);
    }

    loadCategory();
  }, [slug, router]);

  const handleStart = async (mode: 'random' | 'wrong_only', count: number) => {
    setIsLoading(true);

    const result = await startCategoryQuizAction(slug, mode, count);

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

  if (isLoading || !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner/>
      </div>
    );
  }

  // Quiz in progress
  if (quizState) {
    return (
      <CategoryQuizClient
        attemptId={quizState.attemptId}
        questions={quizState.questions}
        categoryName={category.name}
      />
    );
  }

  // Quiz setup
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Category Info */}
        <div className="relative bg-white rounded-lg shadow-md px-8 py-6 mb-4">
          <button onClick={() => router.back()} className="absolute top-6 left-8 text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeftIcon className="size-8" />
          </button>
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{category.icon || '📚'}</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-gray-600">{category.description}</p>
            )}
          </div>

          <div className="flex items-center justify-center gap-8 py-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalQuestions}
              </div>
              <div className="text-sm text-gray-600">총 문제 수</div>
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
      </div>
    </div>
  );
}
