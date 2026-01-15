import { getQuestionByIdAction } from '../actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DeleteQuestionButton from '@/components/admin/delete-question-button';
import ToggleActiveButton from '@/components/admin/toggle-active-button';
import { Category, Question } from '@/types/database';

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const uuid = (await params).id;
  const result = (await getQuestionByIdAction(uuid));

  if (!result.success || !result.question) {
    notFound();
  }

  const q = result.question;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/questions"
            className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
          >
            ← 문제 목록으로
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">문제 상세</h1>
        </div>
        <div className="flex items-center gap-3">
          <ToggleActiveButton
            questionId={q.id}
            initialActive={q.is_active}
          />
          <Link
            href={`/admin/questions/${q.id}/edit`}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ✏️ 수정
          </Link>
          <DeleteQuestionButton questionId={q.id} />
        </div>
      </div>

      {/* Question Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              카테고리
            </label>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{q.categories?.icon || '📝'}</span>
              <span className="text-lg font-medium text-gray-900">
                {q.categories?.name || 'Unknown'}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              문제 유형
            </label>
            <span className="text-lg text-gray-900">
              {q.type === 'multiple'
                ? '객관식'
                : q.type === 'ox'
                  ? 'O/X'
                  : q.type === 'blank'
                    ? '빈칸'
                    : '코드'}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              난이도
            </label>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                q.difficulty === 1
                  ? 'bg-green-100 text-green-800'
                  : q.difficulty === 2
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}
            >
              {q.difficulty === 1 ? '하' : q.difficulty === 2 ? '중' : '상'}
            </span>
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            문제
          </label>
          <div className="bg-gray-50 rounded-lg p-4 text-gray-900 whitespace-pre-wrap">
            {q.question}
          </div>
        </div>

        {/* Code Snippet (if exists) */}
        {q.code_snippet && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              코드
            </label>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
              <code>{q.code_snippet}</code>
            </pre>
          </div>
        )}

        {/* Options (for multiple choice) */}
        {q.type === 'multiple' && q.options && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              선택지
            </label>
            <div className="space-y-2">
              {q.options.map((option: string, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    parseInt(q.answer) === index + 1
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <span className="font-medium text-gray-700">
                    {index + 1}.
                  </span>{' '}
                  {option}
                  {parseInt(q.answer) === index + 1 && (
                    <span className="ml-2 text-green-600 font-medium">
                      ✓ 정답
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Answer (for non-multiple choice) */}
        {q.type !== 'multiple' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              정답
            </label>
            <div className="bg-green-50 border border-green-500 rounded-lg p-3 text-gray-900">
              {q.type === 'ox'
                ? q.answer === 'true'
                  ? 'O (참)'
                  : 'X (거짓)'
                : q.answer}
            </div>
          </div>
        )}

        {/* Explanation */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            해설
          </label>
          <div className="bg-blue-50 rounded-lg p-4 text-gray-900 whitespace-pre-wrap">
            {q.explanation}
          </div>
        </div>

        {/* Tags */}
        {q.tags && q.tags.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              태그
            </label>
            <div className="flex flex-wrap gap-2">
              {q.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Source */}
        {q.source && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              출처
            </label>
            <p className="text-gray-900">{q.source}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              생성일
            </label>
            <p className="text-gray-900">
              {new Date(q.created_at).toLocaleString('ko-KR')}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              수정일
            </label>
            <p className="text-gray-900">
              {new Date(q.updated_at).toLocaleString('ko-KR')}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              상태
            </label>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                q.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {q.is_active ? '활성' : '비활성'}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics (if available) */}
      {q.stats && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">통계</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                시도 횟수
              </label>
              <p className="text-2xl font-bold text-gray-900">
                {q.stats.attempts || 0}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                정답 횟수
              </label>
              <p className="text-2xl font-bold text-green-600">
                {q.stats.correct || 0}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                정답률
              </label>
              <p className="text-2xl font-bold text-blue-600">
                {q.stats.attempts
                  ? Math.round((q.stats.correct / q.stats.attempts) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
