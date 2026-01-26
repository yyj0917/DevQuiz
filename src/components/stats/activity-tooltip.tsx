'use client';

import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { DailyActivity } from '@/types/stats';

interface ActivityTooltipProps {
  date: string;
  activity: DailyActivity | null;
}

export default function ActivityTooltip({ date, activity }: ActivityTooltipProps) {
  const dateObj = parseISO(date);
  const formattedDate = format(dateObj, 'yyyy년 M월 d일 (E)', { locale: ko });

  if (!activity || activity.totalQuestions === 0) {
    return (
      <div className="bg-gray-900 text-white text-xs rounded-md px-3 py-2 shadow-lg">
        <div className="font-medium">{formattedDate}</div>
        <div className="text-gray-400 mt-1">활동 없음</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white text-xs rounded-md px-3 py-2 shadow-lg min-w-[180px]">
      <div className="font-medium mb-2 border-b border-gray-700 pb-1">
        {formattedDate}
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">📝 문제 풀이</span>
          <span className="font-semibold">{activity.totalQuestions}문제</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">✅ 정답</span>
          <span className="font-semibold text-emerald-400">
            {activity.correctCount}문제 ({activity.accuracy}%)
          </span>
        </div>
      </div>
    </div>
  );
}
