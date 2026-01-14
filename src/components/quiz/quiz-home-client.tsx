'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Play, TrendingUp, BookOpen } from 'lucide-react';
import Link from 'next/link';

type QuizHomeClientProps = {
  stats?: {
    currentStreak: number;
    totalAnswers: number;
  };
};

export function QuizHomeClient({ stats }: QuizHomeClientProps) {
  const router = useRouter();
  
  const currentStreak = stats?.currentStreak || 0;
  const totalAnswers = stats?.totalAnswers || 0;

  const handleStartDailyQuiz = () => {
    router.push('/quiz/start');
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold text-[#1e3a8a] lowercase">DevQuiz</h1>
          <p className="text-gray-600">매일 5분, 개발 지식을 퀴즈로 복습하세요</p>
        </div>

        {/* Daily Quiz Card */}
        <Card className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] text-white border-0">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5" />
              <CardTitle className="text-2xl">오늘의 퀴즈</CardTitle>
            </div>
            <CardDescription className="text-white/80">
              매일 새로운 5문제로 실력을 키워보세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleStartDailyQuiz}
              className="w-full h-12 text-base rounded-2xl bg-white text-[#1e3a8a] hover:bg-gray-100 font-semibold"
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" />
              시작하기
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#1e3a8a]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">연속 학습</p>
                  <p className="text-2xl font-bold text-gray-900">{currentStreak}일</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">총 푼 문제</p>
                  <p className="text-2xl font-bold text-gray-900">{totalAnswers}개</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">카테고리별 퀴즈</h2>
            <Link
              href="/categories"
              className="text-sm text-[#1e3a8a] hover:underline font-medium"
            >
              전체 보기
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { name: '자료구조', icon: '🏗️', slug: 'data-structure' },
              { name: '알고리즘', icon: '⚡', slug: 'algorithm' },
              { name: '운영체제', icon: '🖥️', slug: 'os' },
              { name: '네트워크', icon: '🌐', slug: 'network' },
              { name: '데이터베이스', icon: '🗄️', slug: 'database' },
            ].map((category) => (
              <Card
                key={category.slug}
                className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
              >
                <CardContent className="pt-6 pb-4 text-center">
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <p className="text-sm font-medium text-gray-900">{category.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-2xl border-gray-300"
          >
            <Link href="/review/wrong-notes">오답 노트</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-2xl border-gray-300"
          >
            <Link href="/stats">통계 보기</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
