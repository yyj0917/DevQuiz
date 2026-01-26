'use client';

import { useState } from 'react';
import { format, parseISO, isToday as checkIsToday } from 'date-fns';
import type { DailyActivity, ActivityLevel } from '@/types/stats';
import ActivityTooltip from './activity-tooltip';

interface ActivityCellProps {
  date: string | null; // null = empty padding cell
  activity: DailyActivity | null;
  onClick?: (date: string) => void;
}

/**
 * Calculate activity level based on total questions
 */
function getActivityLevel(totalQuestions: number): ActivityLevel {
  if (totalQuestions === 0) return 0;
  if (totalQuestions <= 2) return 1;
  if (totalQuestions <= 4) return 2;
  if (totalQuestions <= 7) return 3;
  return 4;
}

/**
 * Get color class for activity level
 */
function getLevelColor(level: ActivityLevel): string {
  const colors = {
    0: 'bg-zinc-100 dark:bg-zinc-800',
    1: 'bg-blue-200 dark:bg-blue-900',
    2: 'bg-blue-400 dark:bg-blue-700',
    3: 'bg-blue-600 dark:bg-blue-400',
    4: 'bg-blue-800 dark:bg-blue-300',
  };
  return colors[level];
}

export default function ActivityCell({ date, activity, onClick }: ActivityCellProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Empty padding cell
  if (!date) {
    return <div className="w-[14px] h-[14px]" />;
  }

  const level = getActivityLevel(activity?.totalQuestions || 0);
  const colorClass = getLevelColor(level);
  const isToday = checkIsToday(parseISO(date));

  const handleClick = () => {
    if (activity && activity.totalQuestions > 0 && onClick) {
      onClick(date);
    }
  };

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          w-[14px] h-[14px] rounded-sm
          ${colorClass}
          ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
          ${activity && activity.totalQuestions > 0 ? 'cursor-pointer hover:ring-2 hover:ring-gray-400 hover:scale-110' : 'cursor-default'}
          transition-all duration-150
        `}
        aria-label={`${date} - ${activity?.totalQuestions || 0}문제`}
      />

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none">
          <ActivityTooltip date={date} activity={activity} />
        </div>
      )}
    </div>
  );
}
