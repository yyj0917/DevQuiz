import { redirect } from 'next/navigation';

export default function MypagePage() {
  // Redirect to history page by default
  redirect('/mypage/history');
}
