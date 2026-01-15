import { getDashboardStatsAction } from './questions/actions';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const result = await getDashboardStatsAction();

  if (!result.success || !result.stats) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">통계를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  const stats = result.stats;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 대시보드</h1>
        <p className="text-gray-600 mt-1">DevQuiz 관리 시스템</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">
            총 문제
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.totalQuestions}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">
            활성 문제
          </div>
          <div className="text-3xl font-bold text-green-600">
            {stats.activeQuestions}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">
            비활성 문제
          </div>
          <div className="text-3xl font-bold text-gray-400">
            {stats.inactiveQuestions}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">
            신고 대기
          </div>
          <div className="text-3xl font-bold text-red-600">
            {stats.pendingReports}
          </div>
        </div>
      </div>

      {/* Category Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          카테고리별 문제 수
        </h2>
        <div className="space-y-3">
          {stats.categoryCounts &&
            Object.entries(stats.categoryCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([category, count]) => (
                <div key={category} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-gray-700">
                    {category}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full flex items-center justify-end pr-2"
                      style={{
                        width: `${Math.min(
                          (count / stats.totalQuestions) * 100 * 2,
                          100
                        )}%`,
                      }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* Recent Questions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            최근 추가된 문제
          </h2>
          <Link
            href="/admin/questions"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            전체 보기 →
          </Link>
        </div>
        <div className="space-y-3">
          {stats.recentQuestions && stats.recentQuestions.length > 0 ? (
            stats.recentQuestions.map((q: any) => (
              <Link
                key={q.id}
                href={`/admin/questions/${q.id}`}
                className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{q.categories?.icon || '📝'}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-600">
                        [{q.categories?.name || 'Unknown'}]
                      </span>
                    </div>
                    <p className="text-gray-900 line-clamp-1">{q.question}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(q.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              최근 추가된 문제가 없습니다.
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/questions/new"
          className="bg-blue-600 text-white rounded-lg p-6 hover:bg-blue-700 transition-colors"
        >
          <div className="text-2xl mb-2">➕</div>
          <div className="font-semibold">새 문제 추가</div>
          <div className="text-sm text-blue-100 mt-1">
            새로운 퀴즈 문제 만들기
          </div>
        </Link>

        <Link
          href="/admin/questions"
          className="bg-gray-800 text-white rounded-lg p-6 hover:bg-gray-900 transition-colors"
        >
          <div className="text-2xl mb-2">📝</div>
          <div className="font-semibold">문제 관리</div>
          <div className="text-sm text-gray-300 mt-1">
            기존 문제 수정/삭제
          </div>
        </Link>

        <Link
          href="/admin/categories"
          className="bg-purple-600 text-white rounded-lg p-6 hover:bg-purple-700 transition-colors"
        >
          <div className="text-2xl mb-2">📁</div>
          <div className="font-semibold">카테고리 관리</div>
          <div className="text-sm text-purple-100 mt-1">
            카테고리 추가/수정
          </div>
        </Link>
      </div>
    </div>
  );
}
