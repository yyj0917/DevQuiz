import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { startDailyQuizAction } from '../actions';
import { QuizClient } from '@/components/quiz/quiz-client';

export default async function QuizStartPage() {
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

  // 퀴즈 시작
  try {
    const result = await startDailyQuizAction();

    if (result.isCompleted) {
      // 이미 완료된 퀴즈면 결과 페이지로
      redirect(`/quiz/result?attempt=${result.attemptId}`);
    }

    if (!result.questions || result.questions.length === 0) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <h1 className="text-xl font-semibold text-gray-900">문제를 불러올 수 없습니다</h1>
            <p className="text-gray-600">잠시 후 다시 시도해주세요</p>
          </div>
        </div>
      );
    }

    return <QuizClient attemptId={result.attemptId} questions={result.questions} />;
  } catch (error: unknown) {
    // Next.js redirect는 특별한 에러를 throw하므로 재throw
    // redirect 에러는 digest가 'NEXT_REDIRECT'로 시작함
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.startsWith('NEXT_REDIRECT')
    ) {
      throw error;
    }

    console.error('Quiz start error:', error);
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-semibold text-gray-900">퀴즈 시작에 실패했습니다</h1>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'}
          </p>
        </div>
      </div>
    );
  }
}
