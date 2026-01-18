import { Suspense } from 'react';
import { getSolvedQuestions } from '@/lib/data/mypage-stats';
import type { SolvedQuestionsFilters } from '@/types/mypage-stats';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SolvedQuestionsList } from '@/components/mypage/solved-questions-list';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import type { Category } from '@/types/database';

interface SolvedPageProps {
  searchParams: Promise<{
    result?: string;
    categoryId?: string;
    page?: string;
  }>;
}

async function SolvedContent({ searchParams }: SolvedPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const filters: SolvedQuestionsFilters = {
    result: (await searchParams).result as 'all' | 'correct' | 'wrong' || 'all',
    categoryId: (await searchParams).categoryId || undefined,
  };

  const page = parseInt((await searchParams).page || '1', 10);
  const pageSize = 20;

  // Get active categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, icon')
    .eq('is_active', true)
    .order('order_index');

  const result = await getSolvedQuestions(user.id, filters, page, pageSize);

  return (
    <SolvedQuestionsList
      initialQuestions={result.questions}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      totalPages={result.totalPages}
      initialFilters={filters}
      categories={(categories || []) as Category[]}
    />
  );
}

export default function SolvedPage({ searchParams }: SolvedPageProps) {
  return (
    <div className="space-y-4">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        }
      >
        <SolvedContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

