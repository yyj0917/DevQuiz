import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { QuizHomeClient } from '@/components/quiz/quiz-home-client';
import { getCategoriesWithStatsAction } from '@/app/(pages)/quiz/category/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenCheck } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { CategoryCard } from '@/components/quiz/category-card';

export default async function Home() {
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
    .single() as { data: { current_streak: number; total_quiz_days: number } | null };

  // 데일리 퀴즈 총 푼 문제 수 계산 (기존 유지)
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('id')
    .eq('user_id', user.id) as { data: { id: string }[] | null };

  const attemptIds = attempts?.map((a) => a.id) || [] as string[];
  const { count: totalAnswers } = await supabase
    .from('quiz_answers')
    .select('*', { count: 'exact', head: true })
    .in('attempt_id', attemptIds);

  // 카테고리 퀴즈 통계 계산 (데일리 퀴즈 제외)
  // 1. 전체 카테고리 문제 수 합계
  const { count: totalCategoryQuestions } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);

  // 2. 사용자가 푼 카테고리 퀴즈 고유 문제 수
  // 먼저 사용자의 category_quiz_attempts 조회
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoryAttemptsQuery = supabase.from('category_quiz_attempts') as any;
  const { data: userCategoryAttempts } = await categoryAttemptsQuery
    .select('id')
    .eq('user_id', user.id);

  let uniqueSolvedQuestions = 0;

  if (userCategoryAttempts && userCategoryAttempts.length > 0) {
    const attemptIds = (userCategoryAttempts as Array<{ id: string }>).map((a) => a.id);

    // 해당 attempts의 quiz_answers에서 고유 question_id 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quizAnswersQuery = supabase.from('quiz_answers') as any;
    const { data: categoryAnswers } = await quizAnswersQuery
      .select('question_id')
      .in('category_attempt_id', attemptIds);

    // 고유 question_id 개수 계산
    uniqueSolvedQuestions = categoryAnswers
      ? new Set((categoryAnswers as Array<{ question_id: string }>).map((a) => a.question_id)).size
      : 0;
  }

  const totalCategoryQuestionsCount = totalCategoryQuestions || 0;
  const progressPercentage =
    totalCategoryQuestionsCount > 0
      ? Math.round((uniqueSolvedQuestions / totalCategoryQuestionsCount) * 100)
      : 0;

  // 카테고리별 통계 조회
  const categoriesResult = await getCategoriesWithStatsAction();
  const categories = categoriesResult.success ? categoriesResult.categories || [] : [];

  const stats = {
    currentStreak: streak?.current_streak || 0,
    totalAnswers: totalAnswers || 0, // 데일리 퀴즈용 (기존 유지)
    categoryQuizStats: {
      totalQuestions: totalCategoryQuestionsCount,
      solvedQuestions: uniqueSolvedQuestions,
      progressPercentage,
    },
  };
  const categoryStats = stats?.categoryQuizStats;
  const solvedQuestions = categoryStats?.solvedQuestions || 0;
  const totalQuestions = categoryStats?.totalQuestions || 0;
  // const progressPercentage = categoryStats?.progressPercentage || 0;

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold text-[#1e3a8a] lowercase">DevQuiz</h1>
          <p className="text-gray-600">매일 5분, 개발 지식을 퀴즈로 복습하세요</p>
        </div>

        {/* 현재까지 푼 문제 섹션 */}
        <Card className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] text-white border-0">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpenCheck className="w-5 h-5" />
              <CardTitle className="text-xl">현재까지 푼 문제</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
              <div className="flex justify-between text-xs text-white/80 mb-3">
                <span>전체 카테고리 퀴즈 진행률 ({progressPercentage}%)</span>
                <span className='font-bold text-white/90'>{solvedQuestions}/{totalQuestions} 문제 완료</span>

              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
          </CardContent>
        </Card>

        {/* Category Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">카테고리별 퀴즈</h2>
            <Link
              href="/quiz/category"
              className="text-sm text-[#1e3a8a] hover:underline font-medium"
            >
              전체 보기
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Random Quiz Card */}
            <Link href="/quiz/random">
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-gray-200 hover:border-blue-500 border-2">
                <CardContent className="">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">🎲</div>
                    {progressPercentage > 0 && (
                          <span className="text-sm font-semibold text-blue-600">
                            {progressPercentage}%
                          </span>
                        )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    랜덤 퀴즈
                  </h3>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    모든 카테고리를 섞은 랜덤 문제를 출제합니다
                  </p>

                  {/* Progress Bar */}
                  {totalQuestions > 0 && (
                    <div className="mb-3">
                      <Progress value={progressPercentage} className="h-2 mb-2" />
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {solvedQuestions}/{totalQuestions} 
                        </span>
                        <span>문제 완료</span>
                        
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>

            {/* Category Cards with Stats */}
            {categories && categories.length > 0 ? (
              categories.slice(0, 5).map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  href={`/quiz/category/${category.slug}`}
                />
              ))
            ) : (
              // Fallback for hardcoded categories if no data available
              [
                { name: '자료구조', icon: '🏗️', slug: 'data-structure' },
                { name: '알고리즘', icon: '⚡', slug: 'algorithm' },
                { name: '운영체제', icon: '🖥️', slug: 'os' },
                { name: '네트워크', icon: '🌐', slug: 'network' },
                { name: '데이터베이스', icon: '🗄️', slug: 'database' },
              ].map((category) => (
                <Link key={category.slug} href={`/quiz/category/${category.slug}`}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow border-gray-200">
                    <CardContent className="pt-6 pb-4 text-center">
                      <div className="text-4xl mb-2">{category.icon}</div>
                      <p className="text-sm font-medium text-gray-900">{category.name}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
