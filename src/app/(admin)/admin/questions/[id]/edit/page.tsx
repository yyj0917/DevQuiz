import {
  getQuestionByIdAction,
  getCategoriesAction,
  type QuestionFormInput,
} from '../../actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import QuestionForm from '@/components/admin/question-form';

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const uuid = (await params).id;
  const [questionResult, categoriesResult] = await Promise.all([
    getQuestionByIdAction(uuid),
    getCategoriesAction(),
  ]);

  if (!questionResult.success || !questionResult.question) {
    notFound();
  }

  if (!categoriesResult.success) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">카테고리를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  const question = questionResult.question;
  const categories = categoriesResult.categories || [];

  // Prepare initial data for form
  const initialData: QuestionFormInput & { id: string } = {
    id: question.id,
    category_id: question.category_id,
    type: question.type,
    difficulty: question.difficulty,
    question: question.question,
    options: question.options || undefined,
    answer: question.answer,
    explanation: question.explanation || null,
    code_snippet: question.code_snippet || undefined,
    tags: question.tags || [],
    source: question.source || undefined,
    is_active: question.is_active,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/admin/questions/${uuid}`}
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ← 문제 상세로
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">문제 수정</h1>
        <p className="text-gray-600 mt-1">문제 정보를 수정하세요.</p>
      </div>

      {/* Form */}
      <QuestionForm
        mode="edit"
        categories={categories}
        initialData={initialData}
      />
    </div>
  );
}
