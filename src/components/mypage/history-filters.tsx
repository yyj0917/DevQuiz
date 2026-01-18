'use client';

import type { HistoryFilters } from '@/app/(pages)/mypage/actions';
import type { Category } from '@/types/database';

interface HistoryFiltersProps {
  filters: HistoryFilters;
  onFilterChange: (key: keyof HistoryFilters, value: string) => void;
  categoryId?: string;
  categories?: Category[];
}

export function HistoryFilters({
  filters,
  onFilterChange,
  categoryId,
  categories,
}: HistoryFiltersProps) {
  const handleCategoryChange = (value: string) => {
    // categoryId를 처리하기 위해 onFilterChange에 전달
    // HistoryFilters 타입에 categoryId가 있으므로 직접 전달 가능
    onFilterChange('categoryId' as keyof HistoryFilters, value || '');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex gap-4">
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
            className="p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">전체</option>
            <option value="correct">정답만</option>
            <option value="wrong">오답만</option>
          </select>
        </div>

        {/* Category Filter */}
        {categories && categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <select
              value={categoryId || ''}
              onChange={(e) => handleCategoryChange(e.target.value || '')}
              className="p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">전체</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

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
            className="p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
          </select>
        </div>
      </div>
    </div>
  );
}

