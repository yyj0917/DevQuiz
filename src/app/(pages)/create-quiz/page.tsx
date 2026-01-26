import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import QuizForm from './_components/quiz-form';
import type { Category } from '@/types/database';

export default async function CreateQuizPage() {
  const supabase = await createClient();

  // 로그인 체크
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // categories 목록 fetch
  const { data: categories = [] as Category[], error } = await supabase
    .from('categories')
    .select('id, name, slug, icon')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error || !categories) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">카테고리를 불러오는데 실패했습니다.</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-gray-600 mt-2">
            <span className='text-[#4285F4] font-bold'>나만의 퀴즈를 만들어 다른 개발자들과 공유하세요.</span>
            <br />
            <span className="text-sm">
              제출된 문제는 관리자 검토 후 승인되면 다른 사용자들이 풀 수 있습니다.
            </span>
          </p>
        </div>

        {/* Form */}
        <QuizForm
          categories={categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
          }))}
        />
      </div>
    </div>
  );
}
