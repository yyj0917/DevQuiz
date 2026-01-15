import { getCategoriesAction } from '../actions';
import Link from 'next/link';
import QuestionForm from '@/components/admin/question-form';

export default async function NewQuestionPage() {
  const categoriesResult = await getCategoriesAction();

  if (!categoriesResult.success) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">카테고리를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  const categories = categoriesResult.categories || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/questions"
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ← 문제 목록으로
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">새 문제 추가</h1>
        <p className="text-gray-600 mt-1">새로운 퀴즈 문제를 작성하세요.</p>
      </div>

      {/* Form */}
      <QuestionForm mode="create" categories={categories} />
    </div>
  );
}
