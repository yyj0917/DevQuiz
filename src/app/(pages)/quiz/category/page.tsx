import { getCategoriesWithStatsAction } from './actions';
import { CategoryCard, RandomQuizCard } from '@/components/quiz/category-card';
import { redirect } from 'next/navigation';

export default async function CategorySelectionPage() {
  const result = await getCategoriesWithStatsAction();

  if (!result.success || !result.categories) {
    redirect('/');
  }

  const categories = result.categories;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            카테고리별 퀴즈
          </h1>
          <p className="text-gray-600">
            원하는 카테고리를 선택해서 퀴즈를 풀어보세요
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Random Quiz Card - First */}
          <RandomQuizCard />

          {/* Category Cards */}
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              href={`/quiz/category/${category.slug}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
