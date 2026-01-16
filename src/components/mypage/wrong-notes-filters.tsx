'use client';

interface WrongNotesFiltersProps {
  filter: 'all' | 'unreviewed' | 'reviewed';
  onFilterChange: (filter: 'all' | 'unreviewed' | 'reviewed') => void;
}

export function WrongNotesFilters({
  filter,
  onFilterChange,
}: WrongNotesFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex gap-2">
        <button
          onClick={() => onFilterChange('unreviewed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'unreviewed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          복습 필요
        </button>
        <button
          onClick={() => onFilterChange('reviewed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'reviewed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          복습 완료
        </button>
        <button
          onClick={() => onFilterChange('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          전체
        </button>
      </div>
    </div>
  );
}

