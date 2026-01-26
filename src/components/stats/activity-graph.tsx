'use client';

import { useState, useMemo } from 'react';
import {
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  format,
  parseISO,
  isSameMonth,
  getYear,
  getMonth,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ActivityCell from './activity-cell';
import ActivityLegend from './activity-legend';
import ActivityDetail from './activity-detail';
import type { DailyActivity } from '@/types/stats';

interface ActivityGraphProps {
  activities: DailyActivity[];
}

export default function ActivityGraph({ activities }: ActivityGraphProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(getMonth(new Date()));

  // Create activity map for quick lookup
  const activityMap = useMemo(() => {
    const map = new Map<string, DailyActivity>();
    activities.forEach((activity) => {
      map.set(activity.date, activity);
    });
    return map;
  }, [activities]);

  // Get current year
  const currentYear = getYear(new Date());

  // Generate monthly grid data
  const monthlyData = useMemo(() => {
    const yearStart = startOfYear(new Date());
    const yearEnd = endOfYear(new Date());

    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return months.map((month) => {
      const monthStart = month;
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      // Get all weeks in this month (starting from Monday)
      const weeks = eachWeekOfInterval(
        { start: monthStart, end: monthEnd },
        { weekStartsOn: 1 }
      );

      const weekData = weeks.map((weekStart) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

        return days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          // Only show cells for current month
          if (isSameMonth(day, month)) {
            return {
              date: dateStr,
              activity: activityMap.get(dateStr) || null,
            };
          }
          return null; // Padding cell
        });
      });

      return {
        month: format(month, 'M월'),
        monthNum: month.getMonth() + 1,
        weeks: weekData,
      };
    });
  }, [activityMap]);

  const weekdays = ['월', '화', '수', '목', '금', '토', '일'];

  // Current month data
  const currentMonthData = monthlyData[currentMonthIndex];

  // Handle month navigation
  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => Math.min(monthlyData.length - 1, prev + 1));
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-2xl">📊 {currentYear}년 퀴즈 활동</CardTitle>
          <ActivityLegend />
        </div>
      </CardHeader>

      <CardContent>
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
            disabled={currentMonthIndex === 0}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {currentMonthData.month}
            </h3>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            disabled={currentMonthIndex === monthlyData.length - 1}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Single Month Calendar */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50/50 dark:bg-gray-800/30">
          {/* Calendar Grid */}
          <div className="space-y-1.5">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-3">
              {weekdays.map((day) => (
                <div
                  key={day}
                  className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Week Rows */}
            {currentMonthData.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1.5">
                {week.map((day, dayIndex) => (
                  <div key={dayIndex} className="flex justify-center">
                    <ActivityCell
                      date={day?.date || null}
                      activity={day?.activity || null}
                      onClick={setSelectedDate}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        {selectedDate && (
          <div className="mt-6">
            <ActivityDetail
              date={selectedDate}
              onClose={() => setSelectedDate(null)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
