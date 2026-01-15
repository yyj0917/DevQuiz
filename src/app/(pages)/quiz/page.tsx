import { redirect } from 'next/navigation';

// 퀴즈 메인 페이지로 리다이렉트
export default async function QuizPage() {
  redirect('/');
}
