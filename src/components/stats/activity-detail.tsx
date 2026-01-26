'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDayActivityDetail } from '@/actions/stats';
import type { DayActivityDetail } from '@/types/stats';

interface ActivityDetailProps {
  date: string;
  onClose: () => void;
}

export default function ActivityDetail({ date, onClose }: ActivityDetailProps) {
  const [detail, setDetail] = useState<DayActivityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      setError(null);

      const result = await getDayActivityDetail(date);

      if (result.success) {
        setDetail(result.data);
      } else {
        setError(result.error);
      }

      setLoading(false);
    }

    fetchDetail();
  }, [date]);

  const dateObj = parseISO(date);
  const formattedDate = format(dateObj, 'yyyy년 M월 d일 (E)', { locale: ko });

  if (loading) {
    return (
      <Card className="mt-4 animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !detail) {
    return (
      <Card className="mt-4 border-red-200 dark:border-red-800">
        <CardContent className="pt-6">
          <p className="text-red-600 dark:text-red-400 text-center">
            {error || '데이터를 불러올 수 없습니다'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { summary, questions } = detail;

  return (
    <Card className="mt-4 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">📅 {formattedDate}</CardTitle>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            📊 요약
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-800">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {summary.totalQuestions}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                총 문제
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg p-4 text-center border border-emerald-200 dark:border-emerald-800">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {summary.correctCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">정답</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 text-center border border-purple-200 dark:border-purple-800">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {summary.accuracy}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                정답률
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        {summary.categories.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              📁 카테고리별
            </h3>
            <div className="space-y-2">
              {summary.categories.map((cat) => {
                const percentage = cat.count > 0 ? (cat.correctCount / cat.count) * 100 : 0;
                return (
                  <div
                    key={cat.categoryId}
                    className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {cat.categoryIcon && (
                          <span className="text-lg">{cat.categoryIcon}</span>
                        )}
                        <span className="font-medium text-sm">
                          {cat.categoryName}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {cat.correctCount}/{cat.count} ({Math.round(percentage)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Questions List */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            📝 푼 문제 목록
          </h3>
          <div className="h-[300px] rounded-md border dark:border-gray-700 overflow-y-auto">
            <div className="p-4 space-y-3">
              {questions.map((q, index) => (
                <div
                  key={q.question + index}
                  className={`p-3 rounded-lg border-l-4 ${
                    q.isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">
                      {q.isCorrect ? '✅' : '❌'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {q.categoryIcon} {q.categoryName}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs"
                        >
                          {'⭐'.repeat(q.difficulty)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                        {q.question}
                      </p>
                      {!q.isCorrect && (
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                          <div>
                            <span className="font-medium">내 답:</span>{' '}
                            <span className="text-red-600 dark:text-red-400">
                              {q.userAnswer}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">정답:</span>{' '}
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {q.correctAnswer}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
