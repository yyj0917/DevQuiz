import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingClient } from '@/components/onboarding/onboarding-client';
import { CATEGORIES } from '@/constants/categories';
import type { Profile } from '@/types/database';

export default async function OnboardingPage() {
  const supabase = await createClient();

  // 현재 유저 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 프로필 및 온보딩 상태 확인
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle() as { data: Profile | null };

  // 유저 카테고리 조회
  const { data: userCategories } = await supabase
    .from('user_categories')
    .select('category_id')
    .eq('user_id', user.id);

  const categoryCount = userCategories?.length || 0;
  const nickname = profile?.nickname ?? null;
  const hasNickname = nickname !== null && nickname.trim().length > 0;
  const hasMinimumCategories = categoryCount >= 3;

  // 온보딩 완료 조건: 닉네임 존재 + 최소 3개 카테고리
  if (hasNickname && hasMinimumCategories) {
    redirect('/');
  }

  // 카테고리 목록 전달 (서버에서 가져온 실제 카테고리 또는 상수 사용)
  const categoriesForClient = CATEGORIES.map((cat) => ({
    slug: cat.slug,
    name: cat.name,
    icon: cat.icon,
  }));

  return <OnboardingClient categories={categoriesForClient} />;
}