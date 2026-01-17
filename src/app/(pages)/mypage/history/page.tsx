import { redirect } from 'next/navigation';

interface HistoryPageProps {
  searchParams: Promise<{
    result?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  // Redirect to new solved page
  const params = await searchParams;
  const queryParams = new URLSearchParams();
  
  if (params.result) {
    queryParams.set('result', params.result);
  }
  if (params.page) {
    queryParams.set('page', params.page);
  }
  
  const queryString = queryParams.toString();
  redirect(`/mypage/solved${queryString ? `?${queryString}` : ''}`);
}
