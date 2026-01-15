'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { questionSchema } from '@/lib/validations/question';
import type { QuestionFormInput } from '@/app/(admin)/admin/questions/actions';
import {
  createQuestionAction,
  updateQuestionAction,
} from '@/app/(admin)/admin/questions/actions';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

interface QuestionFormProps {
  mode: 'create' | 'edit';
  categories: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  initialData?: QuestionFormInput & { id?: string };
}

export default function QuestionForm({
  mode,
  categories,
  initialData,
}: QuestionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuestionFormInput>({
    resolver: zodResolver(questionSchema),
    defaultValues: initialData || {
      category_id: '',
      type: 'multiple',
      difficulty: 1,
      question: '',
      options: ['', '', '', ''],
      answer: '',
      explanation: '',
      code_snippet: '',
      tags: [],
      source: '',
      is_active: true,
    },
  });

  const questionType = watch('type');
  const [tagInput, setTagInput] = useState('');

  const onSubmit = async (data: QuestionFormInput) => {
    setError(null);

    startTransition(async () => {
      let result;
      if (mode === 'create') {
        result = await createQuestionAction(data);
      } else if (initialData?.id) {
        result = await updateQuestionAction(initialData.id, data);
      }

      if (result?.success) {
        router.push('/admin/questions');
        router.refresh();
      } else {
        setError(result?.error || '오류가 발생했습니다.');
      }
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const currentTags = watch('tags') || [];
      setValue('tags', [...currentTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    const currentTags = watch('tags') || [];
    setValue(
      'tags',
      currentTags.filter((_, i) => i !== index)
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">기본 정보</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 *
            </label>
            <select
              {...register('category_id')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">선택하세요</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-red-600 text-sm mt-1">
                {errors.category_id.message}
              </p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              문제 유형 *
            </label>
            <select
              {...register('type')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="multiple">객관식</option>
              <option value="ox">O/X</option>
              <option value="blank">빈칸</option>
              <option value="code">코드</option>
            </select>
            {errors.type && (
              <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>
            )}
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              난이도 *
            </label>
            <select
              {...register('difficulty', { valueAsNumber: true })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>하</option>
              <option value={2}>중</option>
              <option value={3}>상</option>
            </select>
            {errors.difficulty && (
              <p className="text-red-600 text-sm mt-1">
                {errors.difficulty.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">문제 내용</h2>

        {/* Question Text */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            문제 *
          </label>
          <textarea
            {...register('question')}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="문제를 입력하세요..."
          />
          {errors.question && (
            <p className="text-red-600 text-sm mt-1">
              {errors.question.message}
            </p>
          )}
        </div>

        {/* Code Snippet */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            코드 스니펫 (선택)
          </label>
          <textarea
            {...register('code_snippet')}
            rows={6}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="코드를 입력하세요..."
          />
        </div>
      </div>

      {/* Options (Multiple Choice Only) */}
      {questionType === 'multiple' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">선택지</h2>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  선택지 {index + 1} *
                </label>
                <input
                  {...register(`options.${index}` as const)}
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`선택지 ${index + 1}을 입력하세요`}
                />
              </div>
            ))}
          </div>
          {errors.options && (
            <p className="text-red-600 text-sm mt-2">
              {errors.options.message}
            </p>
          )}
        </div>
      )}

      {/* Answer */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">정답</h2>

        {questionType === 'multiple' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              정답 번호 (1-4) *
            </label>
            <select
              {...register('answer')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">선택하세요</option>
              <option value="1">1번</option>
              <option value="2">2번</option>
              <option value="3">3번</option>
              <option value="4">4번</option>
            </select>
          </div>
        )}

        {questionType === 'ox' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              정답 *
            </label>
            <select
              {...register('answer')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">선택하세요</option>
              <option value="true">O (참)</option>
              <option value="false">X (거짓)</option>
            </select>
          </div>
        )}

        {(questionType === 'blank' || questionType === 'code') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              정답 *
            </label>
            <input
              {...register('answer')}
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="정답을 입력하세요"
            />
          </div>
        )}

        {errors.answer && (
          <p className="text-red-600 text-sm mt-2">{errors.answer.message}</p>
        )}

        {/* Explanation */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            해설 *
          </label>
          <textarea
            {...register('explanation')}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="정답 해설을 입력하세요..."
          />
          {errors.explanation && (
            <p className="text-red-600 text-sm mt-1">
              {errors.explanation.message}
            </p>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">추가 정보</h2>

        {/* Tags */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            태그
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="태그를 입력하고 Enter 또는 추가 버튼을 누르세요"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              추가
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(watch('tags') || []).map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Source */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            출처
          </label>
          <input
            {...register('source')}
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="문제 출처를 입력하세요"
          />
        </div>

        {/* Active Status */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              {...register('is_active')}
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              활성 상태로 저장
            </span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isPending
            ? '저장 중...'
            : mode === 'create'
              ? '문제 추가'
              : '수정 완료'}
        </button>
      </div>
    </form>
  );
}
