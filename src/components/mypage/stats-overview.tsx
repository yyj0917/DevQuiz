import type { MyStats } from '@/types/actions';

interface StatsOverviewProps {
  stats: MyStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Questions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="text-sm text-gray-600 mb-1">총 푼 문제</div>
        <div className="text-2xl font-bold text-gray-900">
          {stats.totalQuestions}
        </div>
      </div>

      {/* Accuracy */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="text-sm text-gray-600 mb-1">정답률</div>
        <div className="text-2xl font-bold text-blue-600">
          {stats.accuracy}%
        </div>
      </div>

      {/* Current Streak */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="text-sm text-gray-600 mb-1">현재 스트릭</div>
        <div className="text-2xl font-bold text-orange-600">
          {stats.currentStreak}일
        </div>
      </div>

      {/* Saved Count */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="text-sm text-gray-600 mb-1">저장한 문제</div>
        <div className="text-2xl font-bold text-purple-600">
          {stats.savedCount}
        </div>
      </div>
    </div>
  );
}
