'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { SolvedQuestion, SolvedQuestionsFilters } from '@/types/mypage-stats';
import { HistoryFilters } from './history-filters';

interface SolvedQuestionsListProps {
  initialQuestions: SolvedQuestion[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  initialFilters: SolvedQuestionsFilters;
}

export function SolvedQuestionsList({
  initialQuestions,
  total,
  page,
  pageSize,
  totalPages,
  initialFilters,
}: SolvedQuestionsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: keyof SolvedQuestionsFilters, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (key === 'result') {
      if (value === 'all') {
        params.delete('result');
      } else {
        params.set('result', value);
      }
    } else if (key === 'categoryId') {
      if (value) {
        params.set('categoryId', value);
      } else {
        params.delete('categoryId');
      }
    }

    params.set('page', '1'); // Reset to first page
    router.push(`?${params.toString()}`);
  };

  const filters: SolvedQuestionsFilters = {
    result:
      (searchParams.get('result') as 'all' | 'correct' | 'wrong') ||
      initialFilters.result ||
      'all',
    categoryId: searchParams.get('categoryId') || initialFilters.categoryId,
  };

  if (initialQuestions.length === 0) {
    return (
      <>
        <HistoryFilters
          filters={{
            result: filters.result || 'all',
            sortBy: 'newest',
          }}
          onFilterChange={(key, value) => {
            if (key === 'result') {
              handleFilterChange('result', value);
            }
          }}
        />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center text-gray-600">푼 문제가 없습니다.</div>
        </div>
      </>
    );
  }

  return (
    <>
      <HistoryFilters
        filters={{
          result: filters.result || 'all',
          sortBy: 'newest',
        }}
        onFilterChange={(key, value) => {
          if (key === 'result') {
            handleFilterChange('result', value);
          }
        }}
      />

      <div className="space-y-4">
        {initialQuestions.map((item) => {
          const question = item.question;
          const category = item.category;

          return (
            <div
              key={item.questionId}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {category && (
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {category.icon} {category.name}
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      item.isCorrect
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.isCorrect ? '✓ 정답' : '✗ 오답'}
                  </span>
                  {/* <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {item.answeredCount}회 품
                  </span>
                  {item.correctCount > 0 && (
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      {item.correctCount}회 정답
                    </span>
                  )} */}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(item.lastAnsweredAt).toLocaleDateString('ko-KR')}
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

              {question?.options && (
                <div className="space-y-2 mb-3">
                  {question.options.map((option: string, index: number) => {
                    const isCorrect = question.answer === (index + 1).toString();
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              isCorrect ? 'text-green-600' : 'text-gray-600'
                            }`}
                          >
                            {index + 1}.
                          </span>
                          <span>{option}</span>
                          {isCorrect && (
                            <span className="ml-auto text-green-600">✓ 정답</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            총 {total}개의 문제를 풀었습니다
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', (page - 1).toString());
                  router.push(`?${params.toString()}`);
                }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                이전
              </button>
            )}
            <span className="px-4 py-2 text-sm text-gray-700">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', (page + 1).toString());
                  router.push(`?${params.toString()}`);
                }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                다음
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

