'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ActivitySummary, CategorySummary } from '@/types/stats';

interface StatsOverviewProps {
  summary: ActivitySummary;
  categorySummaries: CategorySummary[];
}

export default function StatsOverview({
  summary,
  categorySummaries,
}: StatsOverviewProps) {
  return (
    <div className="space-y-4">
      {/* Total Questions Card */}
      <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <span>총 푼 문제</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            {summary.totalQuestions}
            <span className="text-lg font-normal text-gray-500 ml-2">문제</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">활동일</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {summary.activeDays}일
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">현재 스트릭</span>
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                {summary.currentStreak}일 🔥
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">최장 스트릭</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {summary.longestStreak}일 ⭐
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">📁</span>
            <span>주제별 푼 문제</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categorySummaries.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              아직 푼 문제가 없습니다
            </p>
          ) : (
            categorySummaries.map((cat) => (
              <div
                key={cat.categoryId}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {cat.categoryIcon && (
                      <span className="text-xl">{cat.categoryIcon}</span>
                    )}
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {cat.categoryName}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                  >
                    {cat.totalQuestions}문제
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    정답: {cat.correctCount}문제
                  </span>
                  <span
                    className={`font-semibold ${
                      cat.accuracy >= 80
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : cat.accuracy >= 60
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {cat.accuracy}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      cat.accuracy >= 80
                        ? 'bg-emerald-500'
                        : cat.accuracy >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${cat.accuracy}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
