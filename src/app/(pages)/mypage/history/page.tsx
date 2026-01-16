import { Suspense } from 'react';
import { getHistoryAction } from '../actions';
import type { HistoryFilters } from '../actions';
import { HistoryList } from '@/components/mypage/history-list';
import { LoadingSpinner } from '@/components/common/loading-spinner';

interface HistoryPageProps {
  searchParams: {
    result?: string;
    sortBy?: string;
    page?: string;
  };
}

async function HistoryContent({ searchParams }: HistoryPageProps) {
  const filters: HistoryFilters = {
    result: (searchParams.result as 'all' | 'correct' | 'wrong') || 'all',
    sortBy: (searchParams.sortBy as 'newest' | 'oldest') || 'newest',
  };
  
  const page = parseInt(searchParams.page || '1', 10);

  const result = await getHistoryAction(filters, page);

  if (!result.success) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center text-red-600">
          {result.error || '학습 기록을 불러오는데 실패했습니다.'}
        </div>
      </div>
    );
  }

  return (
    <HistoryList
      initialHistory={result.data}
      total={result.total}
      page={result.page}
      initialFilters={filters}
    />
  );
}

export default function HistoryPage({ searchParams }: HistoryPageProps) {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        }
      >
        <HistoryContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
