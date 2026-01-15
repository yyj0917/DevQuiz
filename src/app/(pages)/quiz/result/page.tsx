import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, CheckCircle2, XCircle, Flame, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDifficultyStars } from '@/lib/quiz/utils';
import Link from 'next/link';

type ResultPageProps = {
  searchParams: Promise<{
    attempt?: string;
  }>;
};

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const resolvedSearchParams = await searchParams;
  const attemptId = resolvedSearchParams.attempt;

  if (!attemptId) {
    redirect('/quiz');
  }

  // Attempt 및 답변 조회
  const { data: attempt } = (await supabase
    .from('quiz_attempts')
    .select('id, user_id, correct_count, total_questions, is_completed, date')
    .eq('id', attemptId)
    .single()) as any;

  if (!attempt || attempt.user_id !== user.id) {
    redirect('/quiz');
  }

  if (!attempt.is_completed) {
    redirect('/quiz');
  }

  // 답변 및 문제 조회
  const { data: answers } = (await supabase
    .from('quiz_answers')
    .select('*, questions(*, categories(slug, name))')
    .eq('attempt_id', attemptId)
    .order('answered_at', { ascending: true })) as any;

  if (!answers || answers.length === 0) {
    redirect('/quiz');
  }

  // 스트릭 조회
  const { data: streak } = (await supabase
    .from('user_streaks')
    .select('current_streak, longest_streak, total_quiz_days')
    .eq('user_id', user.id)
    .single()) as any;

  const score = attempt.correct_count;
  const totalQuestions = attempt.total_questions;
  const accuracy = Math.round((score / totalQuestions) * 100);
  const currentStreak = streak?.current_streak || 0;

  const questionsWithAnswers = answers.map((a: any) => {
    const q = a.questions as any;
    const category = q.categories as { slug: string; name: string } | null;
    return {
      questionNumber: 0, // 아래에서 인덱스로 설정
      questionId: q.id,
      category: category?.name || 'Unknown',
      difficulty: q.difficulty as 1 | 2 | 3,
      question: q.question,
      userAnswer: a.user_answer,
      isCorrect: a.is_correct,
      correctAnswer: q.answer,
      explanation: q.explanation,
    };
  });

  // 질문 번호 할당
  questionsWithAnswers.forEach((q: any, index: number) => {
    q.questionNumber = index + 1;
  });

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] text-white border-0">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <Trophy className="w-10 h-10" />
              </div>
            </div>
            <CardTitle className="text-3xl mb-2">
              {accuracy >= 80 ? 'You Won! 🎉' : accuracy >= 60 ? 'Good Job! 👍' : 'Keep Going! 💪'}
            </CardTitle>
            <div className="text-5xl font-bold mb-2">
              {score}/{totalQuestions}
            </div>
            <div className="text-lg opacity-90">정확도 {accuracy}%</div>
          </CardHeader>
        </Card>

        {/* Streak Card */}
        {currentStreak > 0 && (
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3">
                <Flame className="w-6 h-6 text-orange-600" />
                <div className="text-center">
                  <p className="text-sm text-orange-700">연속 학습</p>
                  <p className="text-2xl font-bold text-orange-900">{currentStreak}일차</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">문제별 결과</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questionsWithAnswers.map((item: any) => (
              <div
                key={item.questionId}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg border-2',
                  item.isCorrect
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                )}
              >
                <div className="flex-shrink-0 mt-1">
                  {item.isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-700">
                      Q{item.questionNumber}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                    <span className="text-xs text-gray-600">{getDifficultyStars(item.difficulty)}</span>
                  </div>
                  <p className="text-sm text-gray-900 line-clamp-2">{item.question}</p>
                  {!item.isCorrect && (
                    <div className="space-y-1 text-xs">
                      <p className="text-red-700">
                        <span className="font-medium">내 답: </span>
                        {item.userAnswer}
                      </p>
                      <p className="text-green-700">
                        <span className="font-medium">정답: </span>
                        {item.correctAnswer}
                      </p>
                    </div>
                  )}
                  {item.explanation && (
                    <p className="text-xs text-gray-600 bg-white/50 p-2 rounded">
                      {item.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            asChild
            variant="outline"
            className="flex-1 h-12 text-base rounded-2xl border-gray-300"
          >
            <Link href="/quiz">홈으로</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 h-12 text-base rounded-2xl border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a]/5"
          >
            <Link href="/quiz" className="flex items-center justify-center gap-2">
              오답 노트로 이동
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
