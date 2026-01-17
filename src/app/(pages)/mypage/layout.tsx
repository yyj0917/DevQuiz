import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MypageTabs } from '@/components/mypage/mypage-tabs';
import { StatsOverview } from '@/components/mypage/stats-overview';
import { getMypageStats } from '@/lib/data/mypage-stats';
import { LogoutButton } from '@/components/auth/logout-button';
import type { Profile } from '@/types/database';
import Link from 'next/link';

export default async function MypageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, email, created_at')
    .eq('id', user.id)
    .single<Profile>();

  // Get stats with caching
  const stats = await getMypageStats(user.id);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.nickname || '사용자'}님
              </h1>
              <p className="text-sm text-gray-600">{profile?.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/settings"
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                설정
              </Link>
              <LogoutButton className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors" />
            </div>
          </div>

          {/* Stats Overview */}
          <StatsOverview stats={stats} />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="px-6">
            <MypageTabs />
          </div>
        </div>

        {/* Page Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
