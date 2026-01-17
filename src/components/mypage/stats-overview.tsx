import type { MypageStats } from '@/types/mypage-stats';
import { Progress } from '@/components/ui/progress';

interface StatsOverviewProps {
  stats: MypageStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            학습 진행률
          </span>
          <span className="text-sm font-semibold text-blue-600">
            {stats.progressPercentage}%
          </span>
        </div>
        <Progress value={stats.progressPercentage} className="h-3" />
        <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
          <span>
            총 푼 문제: <span className="font-semibold text-gray-900">{stats.solvedQuestions}</span>
          </span>
          <span>
            총 문제: <span className="font-semibold text-gray-900">{stats.totalQuestions}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
