import { redirect } from 'next/navigation';

export default function MypagePage() {
  // Redirect to solved page by default
  redirect('/mypage/solved');
}
