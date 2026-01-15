import { getQuestionsAction, getCategoriesAction } from './actions';
import Link from 'next/link';
import QuestionsFilter from '@/components/admin/questions-filter';
import Pagination from '@/components/admin/pagination';

type SearchParams = {
  page?: string;
  limit?: string;
  categoryId?: string;
  difficulty?: string;
  type?: string;
  isActive?: string;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'most_attempted';
};

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '20');
  const categoryId = searchParams.categoryId;
  const difficulty = searchParams.difficulty
    ? parseInt(searchParams.difficulty)
    : undefined;
  const type = searchParams.type;
  const isActive =
    searchParams.isActive === 'true'
      ? true
      : searchParams.isActive === 'false'
        ? false
        : undefined;
  const search = searchParams.search;
  const sortBy = searchParams.sortBy || 'newest';

  const [questionsResult, categoriesResult] = await Promise.all([
    getQuestionsAction({
      page,
      limit,
      categoryId,
      difficulty,
      type,
      isActive,
      search,
      sortBy,
    }),
    getCategoriesAction(),
  ]);

  if (!questionsResult.success || !categoriesResult.success) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">문제를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  const { questions, total, totalPages } = questionsResult;
  const categories = categoriesResult.categories || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📝 문제 관리</h1>
          <p className="text-gray-600 mt-1">
            총 {total}개의 문제 ({page}/{totalPages} 페이지)
          </p>
        </div>
        <Link
          href="/admin/questions/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ 새 문제 추가
        </Link>
      </div>

      {/* Filters */}
      <QuestionsFilter categories={categories} />

      {/* Questions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {questions && questions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      문제
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      유형
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      난이도
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.map((q: any) => (
                    <tr key={q.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {q.categories?.icon || '📝'}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {q.categories?.name || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/questions/${q.id}`}
                          className="text-sm text-gray-900 line-clamp-2 hover:text-blue-600"
                        >
                          {q.question}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {q.type === 'multiple'
                            ? '객관식'
                            : q.type === 'ox'
                              ? 'O/X'
                              : q.type === 'blank'
                                ? '빈칸'
                                : '코드'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            q.difficulty === 1
                              ? 'bg-green-100 text-green-800'
                              : q.difficulty === 2
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {q.difficulty === 1
                            ? '하'
                            : q.difficulty === 2
                              ? '중'
                              : '상'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            q.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {q.is_active ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/questions/${q.id}`}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            상세
                          </Link>
                          <span className="text-gray-300">|</span>
                          <Link
                            href={`/admin/questions/${q.id}/edit`}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            수정
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/admin/questions"
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">문제가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
