'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getDifficultyStars } from '@/lib/quiz/utils';
import type { DailyQuizQuestion, QuizAnswerPayload } from '@/types/quiz';
import { Check, X } from 'lucide-react';

type QuestionCardProps = {
  question: DailyQuizQuestion;
  currentAnswer: QuizAnswerPayload | null;
  onAnswerChange: (payload: QuizAnswerPayload) => void;
};

export function QuestionCard({ question, currentAnswer, onAnswerChange }: QuestionCardProps) {
  const handleMultipleChoice = (index: number) => {
    onAnswerChange({ type: 'multiple', selectedIndex: index });
  };

  const handleOX = (answer: boolean) => {
    onAnswerChange({ type: 'ox', answer });
  };

  const handleBlank = (answer: string) => {
    onAnswerChange({ type: 'blank', answer });
  };

  const handleCode = (answer: string) => {
    onAnswerChange({ type: 'code', answer });
  };

  const difficultyStars = getDifficultyStars(question.difficulty);

  return (
    <Card className="w-full bg-secondary/50 border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Badge variant="outline" className="text-[#1e3a8a] border-[#1e3a8a]">
            {question.category}
          </Badge>
          <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
            {difficultyStars}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question Text */}
        <div className="text-base text-gray-900 leading-relaxed">{question.question}</div>

        {/* Code Snippet */}
        {question.code_snippet && (
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
            <code>{question.code_snippet}</code>
          </pre>
        )}

        {/* Answer Input by Type */}
        <div className="space-y-3">
          {question.type === 'multiple' && question.options && (
            <RadioGroup
              value={
                currentAnswer && currentAnswer.type === 'multiple'
                  ? String(currentAnswer.selectedIndex)
                  : undefined
              }
              onValueChange={(value) => handleMultipleChoice(Number.parseInt(value))}
            >
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                    currentAnswer &&
                      currentAnswer.type === 'multiple' &&
                      currentAnswer.selectedIndex === index
                      ? 'border-[#1e3a8a] bg-[#1e3a8a]/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  )}
                  onClick={() => handleMultipleChoice(index)}
                >
                  <RadioGroupItem value={String(index)} id={`option-${index}`} />
                  <label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer text-base text-gray-900"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </RadioGroup>
          )}

          {question.type === 'ox' && (
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleOX(true)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 p-6 rounded-2xl border-2 transition-all',
                  currentAnswer && currentAnswer.type === 'ox' && currentAnswer.answer === true
                    ? 'border-[#1e3a8a] bg-[#1e3a8a] text-white'
                    : 'border-gray-200 hover:border-gray-300 bg-white text-gray-900'
                )}
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <span className="text-lg font-semibold">O</span>
              </button>
              <button
                type="button"
                onClick={() => handleOX(false)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 p-6 rounded-2xl border-2 transition-all',
                  currentAnswer && currentAnswer.type === 'ox' && currentAnswer.answer === false
                    ? 'border-[#1e3a8a] bg-[#1e3a8a] text-white'
                    : 'border-gray-200 hover:border-gray-300 bg-white text-gray-900'
                )}
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <X className="w-6 h-6" />
                </div>
                <span className="text-lg font-semibold">X</span>
              </button>
            </div>
          )}

          {(question.type === 'blank' || question.type === 'code') && (
            <Input
              type="text"
              placeholder="답을 입력하세요"
              value={
                currentAnswer &&
                (currentAnswer.type === 'blank' || currentAnswer.type === 'code')
                  ? currentAnswer.answer
                  : ''
              }
              onChange={(e) => {
                if (question.type === 'blank') {
                  handleBlank(e.target.value);
                } else {
                  handleCode(e.target.value);
                }
              }}
              className="h-12 text-base"
              autoFocus
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
