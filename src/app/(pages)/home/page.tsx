import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { QuizHomeClient } from '@/components/quiz/quiz-home-client';

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 프로필 온보딩 확인
  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', user.id)
    .maybeSingle() as { data: { nickname: string | null } | null };

  const nickname = profile?.nickname;
  const hasNickname = nickname !== null && nickname !== undefined && nickname.trim().length > 0;

  if (!hasNickname) {
    redirect('/onboarding');
  }

  // 통계 데이터 조회
  const { data: streak } = await supabase
    .from('user_streaks')
    .select('current_streak, total_quiz_days')
    .eq('user_id', user.id)
    .single();

  // 총 푼 문제 수 계산 (quiz_answers에서)
  const { count: totalAnswers } = await supabase
    .from('quiz_answers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const stats = {
    currentStreak: streak?.current_streak || 0,
    totalAnswers: totalAnswers || 0,
  };

  return <QuizHomeClient stats={stats} />;
}
