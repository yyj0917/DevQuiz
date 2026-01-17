import { redirect } from 'next/navigation';

interface WrongNotesPageProps {
  searchParams: Promise<{
    filter?: string;
  }>;
}

export default async function WrongNotesPage({
  searchParams,
}: WrongNotesPageProps) {
  // Redirect to new wrong page
  const params = await searchParams;
  const queryParams = new URLSearchParams();

  if (params.filter) {
    queryParams.set('filter', params.filter);
  }

  const queryString = queryParams.toString();
  redirect(`/mypage/wrong${queryString ? `?${queryString}` : ''}`);
}
