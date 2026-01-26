'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userQuestionSchema } from '@/lib/validations/question';
import { createQuestion } from '@/actions/quiz-create';
import type { CreateQuestionInput } from '@/actions/quiz-create';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QuizPreview from './quiz-preview';

interface QuizFormProps {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  }>;
}

export default function QuizForm({ categories }: QuizFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateQuestionInput>({
    resolver: zodResolver(userQuestionSchema),
    defaultValues: {
      category_id: '',
      type: 'multiple',
      difficulty: 1,
      question: '',
      options: ['', '', '', ''],
      answer: '',
      explanation: '',
      code_snippet: '',
      tags: [],
    },
  });

  const questionType = watch('type');
  const questionText = watch('question');
  const explanationText = watch('explanation');
  const tags = watch('tags') || [];
  const formValues = watch();

  const onSubmit = async (data: CreateQuestionInput) => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await createQuestion(data);

      if (result.success) {
        setSuccess('문제가 성공적으로 제출되었습니다! 관리자 승인 후 공개됩니다.');
        // 2초 후 리다이렉트
        setTimeout(() => {
          router.push('/mypage');
        }, 2000);
      } else {
        setError(result.error || '문제 제출에 실패했습니다.');
      }
    });
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && tags.length < 5) {
      const currentTags = tags || [];
      if (!currentTags.includes(trimmedTag)) {
        setValue('tags', [...currentTags, trimmedTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    const currentTags = tags || [];
    setValue(
      'tags',
      currentTags.filter((_, i) => i !== index)
    );
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // 문제 유형 변경 시 관련 필드 초기화
  const handleTypeChange = (newType: string) => {
    setValue('type', newType as 'multiple' | 'ox' | 'blank' | 'code');
    setValue('answer', '');
    if (newType !== 'multiple') {
      setValue('options', null);
    } else {
      setValue('options', ['', '', '', '']);
    }
    if (newType !== 'code') {
      setValue('code_snippet', '');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form Section */}
      <div className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category */}
              <div>
                <Label htmlFor="category_id">카테고리 *</Label>
                <select
                  id="category_id"
                  {...register('category_id')}
                  className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">카테고리를 선택하세요</option>
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
                <Label>문제 유형 *</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    { value: 'multiple', label: '객관식' },
                    { value: 'ox', label: 'O/X' },
                    { value: 'blank', label: '빈칸' },
                    { value: 'code', label: '코드' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleTypeChange(type.value)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        questionType === type.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
                {errors.type && (
                  <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>
                )}
              </div>

              {/* Difficulty */}
              <div>
                <Label>난이도 *</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[
                    { value: 1, label: '⭐ Easy' },
                    { value: 2, label: '⭐⭐ Medium' },
                    { value: 3, label: '⭐⭐⭐ Hard' },
                  ].map((diff) => (
                    <button
                      key={diff.value}
                      type="button"
                      onClick={() => setValue('difficulty', diff.value)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        watch('difficulty') === diff.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
                {errors.difficulty && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.difficulty.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Question Content Card */}
          <Card>
            <CardHeader>
              <CardTitle>문제 내용</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Question */}
              <div>
                <Label htmlFor="question">문제 *</Label>
                <Textarea
                  id="question"
                  {...register('question')}
                  rows={4}
                  placeholder="문제를 입력하세요..."
                  className="mt-1"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-500">
                    {questionText?.length || 0}/1000자
                  </p>
                </div>
                {errors.question && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.question.message}
                  </p>
                )}
              </div>

              {/* Code Snippet (for code type) */}
              {questionType === 'code' && (
                <div>
                  <Label htmlFor="code_snippet">코드 스니펫 *</Label>
                  <Textarea
                    id="code_snippet"
                    {...register('code_snippet')}
                    rows={6}
                    placeholder="코드를 입력하세요..."
                    className="mt-1 font-mono text-sm"
                  />
                  {errors.code_snippet && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.code_snippet.message}
                    </p>
                  )}
                </div>
              )}

              {/* Options (for multiple choice) */}
              {questionType === 'multiple' && (
                <div>
                  <Label>선택지 *</Label>
                  <div className="space-y-2 mt-1">
                    {[0, 1, 2, 3].map((index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 w-6">
                          {index + 1}.
                        </span>
                        <Input
                          {...register(`options.${index}` as const)}
                          placeholder={`선택지 ${index + 1}을 입력하세요`}
                        />
                      </div>
                    ))}
                  </div>
                  {errors.options && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.options.message}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Answer Card */}
          <Card>
            <CardHeader>
              <CardTitle>정답</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Answer - Multiple Choice */}
              {questionType === 'multiple' && (
                <div>
                  <Label htmlFor="answer">정답 선택 *</Label>
                  <select
                    id="answer"
                    {...register('answer')}
                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">정답을 선택하세요</option>
                    <option value="1">1번</option>
                    <option value="2">2번</option>
                    <option value="3">3번</option>
                    <option value="4">4번</option>
                  </select>
                  {errors.answer && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.answer.message}
                    </p>
                  )}
                </div>
              )}

              {/* Answer - O/X */}
              {questionType === 'ox' && (
                <div>
                  <Label>정답 *</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {[
                      { value: 'true', label: 'O (참)' },
                      { value: 'false', label: 'X (거짓)' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setValue('answer', option.value)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          watch('answer') === option.value
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {errors.answer && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.answer.message}
                    </p>
                  )}
                </div>
              )}

              {/* Answer - Blank/Code */}
              {(questionType === 'blank' || questionType === 'code') && (
                <div>
                  <Label htmlFor="answer">정답 *</Label>
                  <Input
                    id="answer"
                    {...register('answer')}
                    placeholder="정답을 입력하세요"
                    className="mt-1"
                  />
                  {errors.answer && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.answer.message}
                    </p>
                  )}
                </div>
              )}

              {/* Explanation */}
              <div>
                <Label htmlFor="explanation">해설 *</Label>
                <Textarea
                  id="explanation"
                  {...register('explanation')}
                  rows={4}
                  placeholder="왜 이 답이 정답인지, 다른 선택지는 왜 틀렸는지 설명해주세요."
                  className="mt-1"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-500">
                    {explanationText?.length || 0}/2000자
                  </p>
                </div>
                {errors.explanation && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.explanation.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tags Card */}
          <Card>
            <CardHeader>
              <CardTitle>태그 (최대 5개)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="쉼표(,)로 구분하여 입력"
                  disabled={tags.length >= 5}
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || tags.length >= 5}
                  variant="outline"
                >
                  추가
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => handleRemoveTag(index)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
              {errors.tags && (
                <p className="text-red-600 text-sm">{errors.tags.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="flex-1 lg:hidden"
            >
              {showPreview ? '폼 보기' : '미리보기'}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? '제출 중...' : '문제 제출'}
            </Button>
          </div>
        </form>
      </div>

      {/* Preview Section (Desktop) */}
      <div className="hidden lg:block sticky top-8 h-fit">
        <QuizPreview formValues={formValues} categories={categories} />
      </div>

      {/* Preview Section (Mobile) */}
      {showPreview && (
        <div className="lg:hidden">
          <QuizPreview formValues={formValues} categories={categories} />
        </div>
      )}
    </div>
  );
}
