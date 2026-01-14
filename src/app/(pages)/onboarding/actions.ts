'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingError } from '@/lib/errors';
import { onboardingSchema } from '@/lib/validations/onboarding';
import type { ProfileUpdate } from '@/types/database';

/**
 * 온보딩 완료 서버 액션
 */
export async function completeOnboardingAction(formData: FormData) {
  const supabase = await createClient();

  // 현재 유저 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new OnboardingError('인증되지 않은 사용자입니다', 'UNAUTHORIZED');
  }

  // 폼 데이터 파싱
  const nickname = formData.get('nickname')?.toString();
  const categoriesRaw = formData.get('categories')?.toString();

  if (!nickname || !categoriesRaw) {
    throw new OnboardingError('필수 입력값이 누락되었습니다', 'MISSING_FIELDS');
  }

  let categories: string[];
  try {
    categories = JSON.parse(categoriesRaw);
  } catch {
    throw new OnboardingError('카테고리 데이터 형식이 올바르지 않습니다', 'INVALID_FORMAT');
  }

  // Zod 검증
  const validationResult = onboardingSchema.safeParse({ nickname, categories });

  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0];
    throw new OnboardingError(firstError.message, 'VALIDATION_ERROR');
  }

  const { nickname: validatedNickname, categories: validatedCategories } = validationResult.data;

  // 프로필 업데이트
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profilesQuery = supabase.from('profiles') as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileError } = await profilesQuery
    .update({
      nickname: validatedNickname.trim(),
      is_onboarded: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (profileError) {
    throw new OnboardingError('프로필 업데이트에 실패했습니다', 'PROFILE_UPDATE_ERROR');
  }

  // 카테고리 ID 조회 (slug -> id 변환)
  const { data: categoryData, error: categoryFetchError } = await supabase
    .from('categories')
    .select('id, slug')
    .in('slug', validatedCategories)
    .eq('is_active', true);

  if (categoryFetchError || !categoryData || categoryData.length === 0) {
    throw new OnboardingError('선택한 카테고리를 찾을 수 없습니다', 'CATEGORY_NOT_FOUND');
  }

  type CategoryRow = { id: string; slug: string };
  const typedCategoryData = categoryData as CategoryRow[];
  const categoryIdMap = new Map(typedCategoryData.map((cat) => [cat.slug, cat.id]));
  const categoryIds = validatedCategories
    .map((slug) => categoryIdMap.get(slug))
    .filter((id): id is string => id !== undefined);

  if (categoryIds.length !== validatedCategories.length) {
    throw new OnboardingError('일부 카테고리를 찾을 수 없습니다', 'CATEGORY_PARTIAL_NOT_FOUND');
  }

  // 기존 user_categories 삭제 후 새로 삽입
  const { error: deleteError } = await supabase
    .from('user_categories')
    .delete()
    .eq('user_id', user.id);

  if (deleteError) {
    throw new OnboardingError('기존 카테고리 삭제에 실패했습니다', 'CATEGORY_DELETE_ERROR');
  }

  const userCategoriesToInsert: Array<{ user_id: string; category_id: string }> = categoryIds.map(
    (categoryId) => ({
      user_id: user.id,
      category_id: categoryId,
    })
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insertError } = await (supabase
    .from('user_categories')
    .insert(userCategoriesToInsert as any) as any);

  if (insertError) {
    throw new OnboardingError('카테고리 저장에 실패했습니다', 'CATEGORY_INSERT_ERROR');
  }

  // 성공 시 홈으로 리다이렉트
  redirect('/');
}
