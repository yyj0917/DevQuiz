// ============================================================================
// ONBOARDING VALIDATION SCHEMAS
// ============================================================================

import { z } from 'zod';

const ALLOWED_CATEGORIES = ['os', 'network', 'database', 'data-structure', 'algorithm'] as const;

export const nicknameSchema = z
  .string()
  .min(2, '닉네임은 최소 2자 이상이어야 합니다')
  .max(16, '닉네임은 최대 16자까지 입력 가능합니다')
  .regex(/^[가-힣a-zA-Z0-9\s]+$/, '닉네임은 한글, 영문, 숫자만 사용 가능합니다')
  .refine((val) => val.trim().length >= 2, '닉네임은 공백만으로 구성될 수 없습니다');

export const categoriesSchema = z
  .array(z.enum(ALLOWED_CATEGORIES))
  .min(3, '최소 3개 이상의 카테고리를 선택해주세요');

export const onboardingSchema = z.object({
  nickname: nicknameSchema,
  categories: categoriesSchema,
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
