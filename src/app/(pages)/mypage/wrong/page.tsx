import { Suspense } from 'react';
import { getWrongQuestions } from '@/lib/data/mypage-stats';
import type { WrongQuestionsFilters } from '@/types/mypage-stats';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { WrongQuestionsList } from '@/components/mypage/wrong-questions-list';
import { LoadingSpinner } from '@/components/common/loading-spinner';

interface WrongPageProps {
  searchParams: Promise<{
    filter?: string;
  }>;
}

async function WrongContent({ searchParams }: WrongPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const filter = (await searchParams).filter as 'all' | 'unreviewed' | 'reviewed' | undefined;

  const filters: WrongQuestionsFilters = {
    isReviewed:
      filter === 'reviewed'
        ? true
        : filter === 'unreviewed'
        ? false
        : undefined,
  };

  const result = await getWrongQuestions(user.id, filters);

  return <WrongQuestionsList initialQuestions={result.questions} />;
}

export default function WrongPage({ searchParams }: WrongPageProps) {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        }
      >
        <WrongContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

