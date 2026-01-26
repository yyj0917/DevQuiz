'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CreateQuestionInput } from '@/actions/quiz-create';

interface QuizPreviewProps {
  formValues: CreateQuestionInput;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  }>;
}

export default function QuizPreview({ formValues, categories }: QuizPreviewProps) {
  const {
    category_id,
    type,
    difficulty,
    question,
    options,
    answer,
    explanation,
    code_snippet,
    tags,
  } = formValues;

  // 카테고리 정보 찾기
  const selectedCategory = categories.find((cat) => cat.id === category_id);

  // 난이도 표시
  const difficultyDisplay = {
    1: '⭐ Easy',
    2: '⭐⭐ Medium',
    3: '⭐⭐⭐ Hard',
  }[difficulty] || '⭐ Easy';

  // 문제 유형 한글
  const typeDisplay = {
    multiple: '객관식',
    ox: 'O/X',
    blank: '빈칸',
    code: '코드',
  }[type] || '객관식';

  // 정답 표시 계산
  const getAnswerDisplay = () => {
    if (type === 'multiple' && answer) {
      const answerIndex = parseInt(answer) - 1;
      if (options && options[answerIndex]) {
        return options[answerIndex];
      }
      return `${answer}번`;
    }
    if (type === 'ox') {
      return answer === 'true' ? 'O (참)' : answer === 'false' ? 'X (거짓)' : '-';
    }
    return answer || '-';
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedCategory && (
              <Badge variant="secondary" className="font-medium">
                {selectedCategory.icon} {selectedCategory.name}
              </Badge>
            )}
            <Badge variant="outline">{typeDisplay}</Badge>
          </div>
          <span className="text-sm font-medium text-gray-700">
            {difficultyDisplay}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        {/* Question */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {question || '문제가 여기에 표시됩니다...'}
          </h3>
        </div>

        {/* Code Snippet */}
        {code_snippet && (
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              {code_snippet}
            </pre>
          </div>
        )}

        {/* Options - Multiple Choice */}
        {type === 'multiple' && options && (
          <div className="space-y-2">
            {options.map((option, index) => {
              const isCorrect = answer === String(index + 1);
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isCorrect
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {isCorrect && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                    <p
                      className={`text-sm ${
                        option ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {option || `선택지 ${index + 1}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Options - O/X */}
        {type === 'ox' && (
          <div className="space-y-2">
            {[
              { value: 'true', label: 'O (참)' },
              { value: 'false', label: 'X (거짓)' },
            ].map((option) => {
              const isCorrect = answer === option.value;
              return (
                <div
                  key={option.value}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isCorrect
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {isCorrect && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-900">{option.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Answer - Blank/Code */}
        {(type === 'blank' || type === 'code') && (
          <div className="p-3 rounded-lg bg-green-50 border-2 border-green-500">
            <p className="text-sm font-medium text-gray-700 mb-1">정답</p>
            <p className="text-sm text-gray-900 font-mono">
              {answer || '정답이 여기에 표시됩니다...'}
            </p>
          </div>
        )}

        {/* Explanation */}
        {explanation && (
          <div className="border-t pt-4">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-lg">💡</span>
              <h4 className="font-semibold text-gray-900">해설</h4>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap pl-7">
              {explanation}
            </p>
          </div>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!question && !explanation && !tags?.length && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">
              문제를 입력하면 여기에서 미리보기를 확인할 수 있습니다.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
