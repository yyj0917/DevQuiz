'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Question } from '@/types/database';
import { submitCategoryAnswerAction, completeCategoryQuizAction } from '@/app/(pages)/quiz/category/actions';
import { Check, X, XCircle, ChevronLeft, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CategoryQuizClientProps {
  attemptId: string;
  questions: Question[];
  categoryName: string | null;
}

export function CategoryQuizClient({
  attemptId,
  questions,
  categoryName,
}: CategoryQuizClientProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showAnswerOnly, setShowAnswerOnly] = useState(false);

  const currentQuestion = questions[currentIndex];
  console.log(currentQuestion);
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    console.log("answer : ", answer);
    if (!showResult) {
      setSelectedAnswer(answer as string);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || isSubmitting) return;

    setIsSubmitting(true);
    console.log(attemptId, currentQuestion.id, selectedAnswer);
    const result = await submitCategoryAnswerAction(
      attemptId,
      currentQuestion.id,
      selectedAnswer
    );
    console.log(result);

    if (result.success) {
      setIsCorrect(result.isCorrect || false);
      setShowResult(true);
      setShowAnswerOnly(false);
    } else {
      alert(result.error || '답안 제출에 실패했습니다.');
    }

    setIsSubmitting(false);
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      // Complete quiz
      const result = await completeCategoryQuizAction(attemptId);

      if (result.success) {
        router.push(`/quiz/category/result?attemptId=${attemptId}`);
      } else {
        alert(result.error || '퀴즈 완료 처리에 실패했습니다.');
      }
    } else {
      // Next question
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
      setShowAnswerOnly(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
      setShowAnswerOnly(false);
    }
  };

  const handleShowAnswer = () => {
    setShowResult(true);
    setShowAnswerOnly(true);
    setIsCorrect(false);
  };

  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="px-4 py-4 fixed mobile-area top-0 left-0 right-0 z-50 bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={handleExit}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="나가기"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {categoryName ? `${categoryName} 퀴즈` : '랜덤 퀴즈'}
              </h1>
            </div>
            <span className="text-sm text-gray-600">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          {/* Question */}
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                Q
              </span>
              <h2 className="text-lg font-semibold text-gray-900 flex-1">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Code Snippet */}
            {currentQuestion.code_snippet && (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto mb-4">
                <code>{currentQuestion.code_snippet}</code>
              </pre>
            )}
          </div>

          {/* Options by Question Type */}
          {currentQuestion.type === 'multiple' &&
            currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const optionNumber = (index + 1).toString();
                  const isSelected = selectedAnswer === optionNumber;
                  const showCorrect =
                    showResult && currentQuestion.answer === optionNumber;
                  const showWrong =
                    showResult && !showAnswerOnly && isSelected && !isCorrect;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(optionNumber)}
                      disabled={showResult}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        showCorrect
                          ? 'border-green-500 bg-green-50'
                          : showWrong
                          ? 'border-red-500 bg-red-50'
                          : isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                            showCorrect
                              ? 'bg-green-500 text-white'
                              : showWrong
                              ? 'bg-red-500 text-white'
                              : isSelected
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="flex-1">{option}</span>
                        {showCorrect && <span className="text-2xl">✓</span>}
                        {showWrong && <span className="text-2xl">✗</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

          {currentQuestion.type === 'ox' && (
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleAnswerSelect("true")}
                disabled={showResult}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-2 rounded-2xl border-2 transition-all ${
                  showResult && currentQuestion.answer === 'true'
                    ? 'btruerder-green-500 bg-green-50'
                    : showResult && !showAnswerOnly && selectedAnswer === 'true' && !isCorrect
                    ? 'border-red-500 bg-red-50'
                    : selectedAnswer === 'true'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                {showResult && currentQuestion.answer === 'true' && (
                  <span className="text-2xl">✓</span>
                )}
                {showResult && selectedAnswer === 'true' && !isCorrect && (
                  <span className="text-2xl">✗</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleAnswerSelect("false")}
                disabled={showResult}
                className={`flex-1 flex items-center justify-center gap-2 p-6 rounded-2xl border-2 transition-all ${
                  showResult && currentQuestion.answer === 'false'
                    ? 'border-green-500 bg-green-50'
                    : showResult && !showAnswerOnly && selectedAnswer === 'false' && !isCorrect
                    ? 'border-red-500 bg-red-50'
                    : selectedAnswer === 'false'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <X className="w-6 h-6" />
                </div>
                  {showResult && currentQuestion.answer === 'false' && (
                  <span className="text-2xl">✓</span>
                )}
                {showResult && selectedAnswer === 'false' && !isCorrect && (
                  <span className="text-2xl">✗</span>
                )}
              </button>
            </div>
          )}

          {(currentQuestion.type === 'blank' || currentQuestion.type === 'code') && (
            <div className="space-y-3">
              <Input
                type="text"
                placeholder={
                  currentQuestion.type === 'blank' ? '빈칸에 들어갈 답을 입력하세요' : '답을 입력하세요'
                }
                value={selectedAnswer || ''}
                onChange={(e) => handleAnswerSelect(e.target.value)}
                disabled={showResult}
                className={`h-12 text-base ${
                  showResult
                    ? showAnswerOnly || isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : ''
                }`}
                autoFocus
              />
              {showResult && (showAnswerOnly || !isCorrect) && (
                <div className={`p-3 border rounded-lg ${
                  showAnswerOnly || isCorrect
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <p className={`text-sm ${
                    showAnswerOnly || isCorrect
                      ? 'text-green-700'
                      : 'text-red-700'
                  }`}>
                    {showAnswerOnly ? (
                      <>
                        <span className="font-semibold">정답:</span> {currentQuestion.answer}
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">정답:</span> {currentQuestion.answer}
                      </>
                    )}
                  </p>
                </div>
              )}
              {showResult && !showAnswerOnly && isCorrect && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 font-semibold">정답입니다! ✓</p>
                </div>
              )}
            </div>
          )}

          {/* Explanation */}
          {showResult && currentQuestion.explanation && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">💡 해설</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {!showResult ? (
            <>
              {currentIndex > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                  aria-label="이전 문제"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={handleShowAnswer}
                className="px-4 py-4 bg-[#1e3a8a] text-white font-semibold rounded-lg hover:bg-[#1e3a8a]/80 transition-colors whitespace-nowrap"
              >
                정답 확인
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer || isSubmitting}
                className="flex-1 py-4 px-6 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '제출 중...' : '제출하기'}
              </button>
            </>
          ) : (
            <>
              {currentIndex > 0 && (
                <button
                  onClick={() => {
                    setCurrentIndex(currentIndex - 1);
                    setSelectedAnswer(null);
                    setShowResult(false);
                    setIsCorrect(false);
                    setShowAnswerOnly(false);
                  }}
                  className="px-4 py-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                  aria-label="이전 문제"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {showAnswerOnly && (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedAnswer || isSubmitting}
                  className="px-4 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {isSubmitting ? '제출 중...' : '제출하기'}
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-1 py-4 px-6 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isLastQuestion ? '결과 보기' : '다음 문제'}
              </button>
            </>
          )}
        </div>

        {/* Exit Confirmation Dialog */}
        <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>퀴즈를 나가시겠습니까?</DialogTitle>
              <DialogDescription>
                진행 중인 퀴즈를 중단하고 나가면 현재까지의 답안은 저장되지 않습니다.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowExitDialog(false)}
              >
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={confirmExit}
              >
                나가기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
