import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

interface ResultPageProps {
  searchParams: Promise<{ attemptId?: string }>;
}

export default async function CategoryQuizResultPage(props: ResultPageProps) {
  const searchParams = await props.searchParams;
  const attemptId = searchParams.attemptId;

  if (!attemptId) {
    redirect('/quiz/category');
  }

  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get attempt data with answers and category
  const { data: attempt, error: attemptError } = await supabase
    .from('category_quiz_attempts')
    .select(
      `
      *,
      categories(name, slug, icon),
      quiz_answers(
        *,
        questions(*)
      )
    `
    )
    .eq('id', attemptId)
    .eq('user_id', user.id)
    .single();

  if (attemptError || !attempt) {
    redirect('/quiz/category');
  }

  const correctCount = attempt.correct_count || 0;
  const totalCount = attempt.question_count || 0;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const passed = accuracy >= 60;

  // @ts-expect-error: Supabase join type
  const categoryName = attempt.categories?.name || '랜덤';
  // @ts-expect-error: Supabase join type
  const categoryIcon = attempt.categories?.icon || '🎲';
  // @ts-expect-error: Supabase join type
  const categorySlug = attempt.categories?.slug;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Result Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          {/* Icon */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{passed ? '🎉' : '💪'}</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {passed ? '축하합니다!' : '아쉽네요!'}
            </h1>
            <p className="text-gray-600">
              {passed
                ? '퀴즈를 성공적으로 완료했습니다'
                : '다시 도전해보세요'}
            </p>
          </div>

          {/* Category */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
              <span className="text-2xl">{categoryIcon}</span>
              <span className="font-semibold text-gray-900">
                {categoryName}
              </span>
            </div>
          </div>

          {/* Score */}
          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {accuracy}%
            </div>
            <div className="text-gray-600">
              {correctCount} / {totalCount} 정답
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {correctCount}
              </div>
              <div className="text-sm text-gray-600">맞은 문제</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {totalCount - correctCount}
              </div>
              <div className="text-sm text-gray-600">틀린 문제</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {categorySlug && (
              <Link
                href={`/quiz/category/${categorySlug}`}
                className="block w-full py-4 px-6 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                같은 카테고리 다시 풀기
              </Link>
            )}

            <Link
              href="/quiz/category"
              className="block w-full py-4 px-6 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:border-gray-400 transition-colors text-center"
            >
              다른 카테고리 선택
            </Link>

            <Link
              href="/"
              className="block w-full py-3 text-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              홈으로 가기
            </Link>
          </div>
        </div>

        {/* Note */}
        {!passed && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-sm text-yellow-800">
              💡 틀린 문제들은 오답노트에 자동으로 저장됩니다. 복습해보세요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
