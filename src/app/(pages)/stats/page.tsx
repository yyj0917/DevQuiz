import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getActivityData } from '@/actions/stats';
import ActivityGraph from '@/components/stats/activity-graph';
import StatsOverview from '@/components/stats/stats-overview';
import Link from 'next/link';

export default async function StatsPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch activity data for the last 12 months
  const result = await getActivityData(12);

  if (!result.success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{result.error}</p>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const { activities, summary, categorySummaries } = result.data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {/* <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📊 통계
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            나의 퀴즈 활동을 한눈에 확인하세요
          </p>
        </div> */}
        {/* Right content - Activity Graph */}
        <div className="lg:col-span-9 mb-4">
              <ActivityGraph activities={activities} />
            </div>
        {/* Empty state */}
        {activities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              아직 퀴즈를 푼 기록이 없습니다.
            </p>
            <a
              href="/quiz"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              퀴즈 풀러 가기
            </a>
          </div>
        )}

        {/* Two-column layout: Stats Overview (left) + Activity Graph (right) */}
        {activities.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left sidebar - Overview Stats */}
            <div className="lg:col-span-3">
              <StatsOverview
                summary={summary}
                categorySummaries={categorySummaries}
              />
            </div>

            
          </div>
        )}
      </div>
    </div>
  );
}
