import Link from 'next/link';
import type { CategoryWithStats } from '@/types/database';
import { Progress } from '@/components/ui/progress';

interface CategoryCardProps {
  category: CategoryWithStats;
  href: string;
}

export function CategoryCard({ category, href }: CategoryCardProps) {
  const hasStats = category.user_solved_count !== undefined && category.user_solved_count > 0;
  const accuracy = category.accuracy || 0;
  const solvedCount = category.user_solved_count || 0;
  const totalQuestions = category.total_questions || 0;
  const progressPercentage = category.progress_percentage || 0;

  return (
    <Link
      href={href}
      className="block p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200 bg-white"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{category.icon || '📚'}</div>
        {progressPercentage > 0 && (
          <div className="text-sm font-semibold text-blue-600">
            {progressPercentage}%
          </div>
        )}
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2">
        {category.name}
      </h3>

      {category.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {category.description}
        </p>
      )}

      {/* Progress Bar */}
      {totalQuestions > 0 && (
        <div className="mb-3">
          <Progress value={progressPercentage} className="h-2 mb-2" />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {solvedCount}/{totalQuestions} 
            </span>
            <span>문제 완료</span>
          </div>
        </div>
      )}
    </Link>
  );
}

export function RandomQuizCard() {
  return (
    <Link
      href="/quiz/random"
      className="block p-6 rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-500 hover:shadow-lg transition-all duration-200"
    >
      <div className="text-4xl mb-4">🎲</div>

      <h3 className="text-lg font-bold text-gray-900 mb-2">
        랜덤 퀴즈
      </h3>

      <p className="text-sm text-gray-600 mb-3">
        모든 카테고리에서 랜덤으로 문제를 출제합니다
      </p>

      <div className="text-sm text-purple-600 font-medium">
        전체 카테고리 ✨
      </div>
    </Link>
  );
}
