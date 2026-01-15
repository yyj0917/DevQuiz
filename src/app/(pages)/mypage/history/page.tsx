'use client';

import { useState, useEffect } from 'react';
import { getHistoryAction } from '../actions';
import type { HistoryFilters } from '../actions';
import { LoadingSpinner } from '@/components/common/loading-spinner';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<HistoryFilters>({
    result: 'all',
    sortBy: 'newest',
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadHistory();
  }, [filters, page]);

  const loadHistory = async () => {
    setIsLoading(true);
    const result = await getHistoryAction(filters, page);

    if (result.success) {
      setHistory(result.history || []);
      setTotal(result.total || 0);
    }

    setIsLoading(false);
  };

  const handleFilterChange = (key: keyof HistoryFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner/>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4">
          {/* Result Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              결과
            </label>
            <select
              value={filters.result}
              onChange={(e) =>
                handleFilterChange(
                  'result',
                  e.target.value as 'all' | 'correct' | 'wrong'
                )
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="correct">정답만</option>
              <option value="wrong">오답만</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              정렬
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                handleFilterChange(
                  'sortBy',
                  e.target.value as 'newest' | 'oldest'
                )
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="newest">최신순</option>
              <option value="oldest">오래된순</option>
            </select>
          </div>
        </div>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center text-gray-600">
            학습 기록이 없습니다.
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item: any) => {
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
      )}

      {/* Pagination Info */}
      {total > 0 && (
        <div className="text-center text-sm text-gray-600">
          총 {total}개의 문제를 풀었습니다
        </div>
      )}
    </div>
  );
}
