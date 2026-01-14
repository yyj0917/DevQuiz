// ============================================================================
// QUIZ VALIDATION SCHEMAS
// ============================================================================

import { z } from 'zod';
import type { QuizType } from '@/types/quiz';

export const quizAnswerSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('multiple'),
    selectedIndex: z.number().int().min(0).max(3),
  }),
  z.object({
    type: z.literal('ox'),
    answer: z.boolean(),
  }),
  z.object({
    type: z.literal('blank'),
    answer: z.string().min(1, '답을 입력해주세요'),
  }),
  z.object({
    type: z.literal('code'),
    answer: z.string().min(1, '답을 입력해주세요'),
  }),
]);

export type QuizAnswerInput = z.infer<typeof quizAnswerSchema>;
