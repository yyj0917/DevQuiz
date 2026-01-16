import { Suspense } from 'react';
import { getWrongNotesAction } from '../actions';
import { WrongNotesList } from '@/components/mypage/wrong-notes-list';
import { LoadingSpinner } from '@/components/common/loading-spinner';

interface WrongNotesPageProps {
  searchParams: Promise<{
    filter?: string;
  }>;
}

async function WrongNotesContent({ searchParams }: WrongNotesPageProps) {
  const filterParam =
    (await searchParams).filter === 'all'
      ? undefined
      : (await searchParams).filter === 'reviewed'
      ? { isReviewed: true }
      : { isReviewed: false };

  const result = await getWrongNotesAction(filterParam);

  if (!result.success) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center text-red-600">
          {result.error || '오답 노트를 불러오는데 실패했습니다.'}
        </div>
      </div>
    );
  }

  const initialFilter = (await searchParams).filter as 'all' | 'unreviewed' | 'reviewed' || 'unreviewed';

  return (
    <div className="space-y-6">
      <WrongNotesList
        initialWrongNotes={result.wrongNotes}
        initialFilter={initialFilter}
      />
    </div>
  );
}

export default function WrongNotesPage({ searchParams }: WrongNotesPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner />
        </div>
      }
    >
      <WrongNotesContent searchParams={searchParams} />
    </Suspense>
  );
}
