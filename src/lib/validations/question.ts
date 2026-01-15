import { z } from 'zod';

export const questionSchema = z
  .object({
    category_id: z.string().uuid('유효한 카테고리를 선택해주세요'),
    type: z.enum(['multiple', 'ox', 'blank', 'code'], {
      errorMap: () => ({ message: '유효한 문제 유형을 선택해주세요' }),
    }),
    difficulty: z.number().min(1).max(3),
    question: z.string().min(10, '문제는 최소 10자 이상이어야 합니다'),
    options: z.array(z.string()).length(4).nullable().optional(),
    answer: z.string().min(1, '정답을 입력해주세요'),
    explanation: z.string().min(10, '해설은 최소 10자 이상이어야 합니다'),
    code_snippet: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    source: z.string().nullable().optional(),
    is_active: z.boolean().default(true),
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
      // 객관식이면 answer는 1-4 사이의 숫자
      if (data.type === 'multiple') {
        const answerNum = parseInt(data.answer);
        return !isNaN(answerNum) && answerNum >= 1 && answerNum <= 4;
      }
      return true;
    },
    {
      message: '객관식 정답은 1-4 사이의 숫자여야 합니다',
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
  );

export type QuestionFormData = z.infer<typeof questionSchema>;
