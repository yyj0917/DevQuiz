import { z } from 'zod';

/**
 * Question creation/update schema for admin and user-created questions
 */
export const questionSchema = z
  .object({
    category_id: z.string().uuid('유효한 카테고리를 선택해주세요'),
    type: z.enum(['multiple', 'ox', 'blank', 'code'], {
      message: '유효한 문제 유형을 선택해주세요',
    }),
    difficulty: z.number().min(1).max(3),
    question: z
      .string()
      .min(10, '문제는 최소 10자 이상이어야 합니다')
      .max(1000, '문제는 1000자를 초과할 수 없습니다'),
    options: z.array(z.string()).length(4).nullable().optional(),
    answer: z.string().min(1, '정답을 입력해주세요'),
    explanation: z
      .string()
      .min(20, '해설은 최소 20자 이상이어야 합니다')
      .max(2000, '해설은 2000자를 초과할 수 없습니다')
      .nullable(),
    code_snippet: z.string().max(2000, 'code_snippet은 2000자를 초과할 수 없습니다').nullable().optional(),
    tags: z.array(z.string()).max(5, '태그는 최대 5개까지 가능합니다').optional(),
    source: z.string().nullable().optional(),
    is_active: z.boolean(),
  })
  .refine(
    (data) => {
      // 객관식이면 options 필수
      if (data.type === 'multiple') {
        return data.options && data.options.length === 4;
      }
      return true;
    },
    {
      message: '객관식 문제는 4개의 선지가 필요합니다',
      path: ['options'],
    }
  )
  .refine(
    (data) => {
      // 객관식이면 answer는 '1', '2', '3', '4' 중 하나
      if (data.type === 'multiple') {
        return ['1', '2', '3', '4'].includes(data.answer);
      }
      return true;
    },
    {
      message: '객관식 정답은 1, 2, 3, 4 중 하나여야 합니다',
      path: ['answer'],
    }
  )
  .refine(
    (data) => {
      // O/X면 answer는 'true' 또는 'false'
      if (data.type === 'ox') {
        return data.answer === 'true' || data.answer === 'false';
      }
      return true;
    },
    {
      message: 'O/X 정답은 true 또는 false여야 합니다',
      path: ['answer'],
    }
  )
  .refine(
    (data) => {
      // code 타입이면 code_snippet 필수
      if (data.type === 'code') {
        return data.code_snippet && data.code_snippet.trim().length > 0;
      }
      return true;
    },
    {
      message: '코드 문제는 code_snippet이 필수입니다',
      path: ['code_snippet'],
    }
  );

export type QuestionFormData = z.infer<typeof questionSchema>;

/**
 * User quiz creation schema (without admin-only fields)
 */
export const userQuestionSchema = z
  .object({
    category_id: z.string().uuid('유효한 카테고리를 선택해주세요'),
    type: z.enum(['multiple', 'ox', 'blank', 'code'], {
      message: '유효한 문제 유형을 선택해주세요',
    }),
    difficulty: z.number().min(1).max(3),
    question: z
      .string()
      .min(10, '문제는 최소 10자 이상이어야 합니다')
      .max(1000, '문제는 1000자를 초과할 수 없습니다'),
    options: z.array(z.string()).length(4).nullable().optional(),
    answer: z.string().min(1, '정답을 입력해주세요'),
    explanation: z
      .string()
      .min(20, '해설은 최소 20자 이상이어야 합니다')
      .max(2000, '해설은 2000자를 초과할 수 없습니다')
      .nullable(),
    code_snippet: z.string().max(2000, 'code_snippet은 2000자를 초과할 수 없습니다').nullable().optional(),
    tags: z.array(z.string()).max(5, '태그는 최대 5개까지 가능합니다').optional(),
  })
  .refine(
    (data) => {
      // 객관식이면 options 필수
      if (data.type === 'multiple') {
        return data.options && data.options.length === 4;
      }
      return true;
    },
    {
      message: '객관식 문제는 4개의 선지가 필요합니다',
      path: ['options'],
    }
  )
  .refine(
    (data) => {
      // 객관식이면 answer는 '1', '2', '3', '4' 중 하나
      if (data.type === 'multiple') {
        return ['1', '2', '3', '4'].includes(data.answer);
      }
      return true;
    },
    {
      message: '객관식 정답은 1, 2, 3, 4 중 하나여야 합니다',
      path: ['answer'],
    }
  )
  .refine(
    (data) => {
      // O/X면 answer는 'true' 또는 'false'
      if (data.type === 'ox') {
        return data.answer === 'true' || data.answer === 'false';
      }
      return true;
    },
    {
      message: 'O/X 정답은 true 또는 false여야 합니다',
      path: ['answer'],
    }
  )
  .refine(
    (data) => {
      // code 타입이면 code_snippet 필수
      if (data.type === 'code') {
        return data.code_snippet && data.code_snippet.trim().length > 0;
      }
      return true;
    },
    {
      message: '코드 문제는 code_snippet이 필수입니다',
      path: ['code_snippet'],
    }
  );

export type UserQuestionFormData = z.infer<typeof userQuestionSchema>;
