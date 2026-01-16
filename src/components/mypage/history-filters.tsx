'use client';

import type { HistoryFilters } from '@/app/(pages)/mypage/actions';

interface HistoryFiltersProps {
  filters: HistoryFilters;
  onFilterChange: (key: keyof HistoryFilters, value: string) => void;
}

export function HistoryFilters({ filters, onFilterChange }: HistoryFiltersProps) {
  return (
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
              onFilterChange(
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
              onFilterChange(
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
  );
}

