'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { HistoryFilters } from './history-filters';
import type { HistoryFilters as HistoryFiltersType } from '@/app/(pages)/mypage/actions';
import type { QuizAnswerWithQuestion } from '@/types/database';

interface HistoryListProps {
  initialHistory: QuizAnswerWithQuestion[];
  total: number;
  page: number;
  initialFilters: HistoryFiltersType;
}

export function HistoryList({
  initialHistory,
  total,
  page,
  initialFilters,
}: HistoryListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: keyof HistoryFiltersType, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (key === 'result') {
      if (value === 'all') {
        params.delete('result');
      } else {
        params.set('result', value);
      }
    } else if (key === 'sortBy') {
      params.set('sortBy', value);
    }
    
    params.set('page', '1'); // Reset to first page
    router.push(`?${params.toString()}`);
  };

  const filters: HistoryFiltersType = {
    result: (searchParams.get('result') as 'all' | 'correct' | 'wrong') || initialFilters.result || 'all',
    sortBy: (searchParams.get('sortBy') as 'newest' | 'oldest') || initialFilters.sortBy || 'newest',
  };

  if (initialHistory.length === 0) {
    return (
      <>
        <HistoryFilters filters={filters} onFilterChange={handleFilterChange} />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center text-gray-600">
            학습 기록이 없습니다.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HistoryFilters filters={filters} onFilterChange={handleFilterChange} />
      
      <div className="space-y-4">
        {initialHistory.map((item) => {
          const question = item.questions;
          const category = question?.categories;

          return (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {category && (
                    <span className="text-sm px-2 py-1 bg-gray-100 rounded">
                      {category.icon} {category.name}
                    </span>
                  )}
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      item.is_correct
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.is_correct ? '✓ 정답' : '✗ 오답'}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(item.answered_at).toLocaleDateString('ko-KR')}
                </span>
              </div>

              <div className="mb-3">
                <h3 className="font-medium text-gray-900 mb-2">
                  {question?.question}
                </h3>
                {question?.code_snippet && (
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto mb-3">
                    <code>{question.code_snippet}</code>
                  </pre>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">내 답변:</span>
                <span
                  className={`font-medium ${
                    item.is_correct ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {question?.options?.[parseInt(item.user_answer) - 1] ||
                    item.user_answer}
                </span>
                {!item.is_correct && question?.answer && (
                  <>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-600">정답:</span>
                    <span className="font-medium text-green-600">
                      {question.options?.[parseInt(question.answer) - 1] ||
                        question.answer}
                    </span>
                  </>
                )}
              </div>

              {question?.explanation && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    💡 {question.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Info */}
      {total > 0 && (
        <div className="text-center text-sm text-gray-600">
          총 {total}개의 문제를 풀었습니다
        </div>
      )}
    </>
  );
}

