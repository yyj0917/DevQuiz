import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/constants/admin';
import Link from 'next/link';
import './../globals.css';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 접근 제한: 로그인되지 않았거나 어드민이 아니면 홈으로 리다이렉트
  if (!user || !isAdminEmail(user.email)) {
    redirect('/');
  }

  return (
    <html lang="ko">
      <body className='max-w-[1280px] mx-auto min-h-screen bg-gray-50 border-l border-r'
      >
      <div className="w-full min-h-screen bg-gray-50 pt-16">
        {/* Admin Header */}
        <header className="max-w-[1280px] mx-auto fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                DevQuiz Admin
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{user.email}</span>
                <Link
                  href="/"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  ← 사이트로
                </Link>
              </div>
            </div>
          </div>
        </header>

      <div className="flex mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] ">
          <nav className="p-4 space-y-2">
            <Link
              href="/admin"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              📊 대시보드
            </Link>
            <Link
              href="/admin/questions"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              📝 문제 관리
            </Link>
            <Link
              href="/admin/categories"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              📁 카테고리
            </Link>
            <Link
              href="/admin/reports"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              🚨 신고 관리
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-blue-50/50">{children}</main>
      </div>
    </div>
      </body>
    </html>
  );
}
