'use client';

import { useState, useEffect } from 'react';
import { getSavedQuestionsAction, toggleSaveQuestionAction } from '../actions';

export default function SavedQuestionsPage() {
  const [savedQuestions, setSavedQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedQuestions();
  }, []);

  const loadSavedQuestions = async () => {
    setIsLoading(true);
    const result = await getSavedQuestionsAction();

    if (result.success) {
      setSavedQuestions(result.savedQuestions || []);
    }

    setIsLoading(false);
  };

  const handleUnsave = async (questionId: string) => {
    const result = await toggleSaveQuestionAction(questionId);

    if (result.success) {
      // Remove from list
      setSavedQuestions((prev) =>
        prev.filter((item) => item.question_id !== questionId)
      );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (savedQuestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">📌</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            저장한 문제가 없습니다
          </h3>
          <p className="text-gray-600">
            마음에 드는 문제를 저장해보세요!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {savedQuestions.map((item: any) => {
        const question = item.questions;
        const category = question?.categories;

        return (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                {category && (
                  <span className="text-sm px-2 py-1 bg-gray-100 rounded">
                    {category.icon} {category.name}
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  난이도 {question?.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {new Date(item.created_at).toLocaleDateString('ko-KR')}
                </span>
                <button
                  onClick={() => handleUnsave(item.question_id)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  저장 해제
                </button>
              </div>
            </div>

            <div className="mb-3">
              <h3 className="font-medium text-gray-900 mb-2">
                {question?.question}
              </h3>
              {question?.code_snippet && (
                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto mb-3">
                  <code>{question.code_snippet}</code>
                </pre>
              )}
            </div>

            {question?.options && (
              <div className="space-y-2 mb-3">
                {question.options.map((option: string, index: number) => {
                  const isCorrect = question.answer === (index + 1).toString();
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            isCorrect ? 'text-green-600' : 'text-gray-600'
                          }`}
                        >
                          {index + 1}.
                        </span>
                        <span>{option}</span>
                        {isCorrect && <span className="ml-auto text-green-600">✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {question?.explanation && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  💡 {question.explanation}
                </p>
              </div>
            )}

            {item.memo && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-700">📝 {item.memo}</p>
              </div>
            )}
          </div>
        );
      })}

      <div className="text-center text-sm text-gray-600">
        총 {savedQuestions.length}개의 문제를 저장했습니다
      </div>
    </div>
  );
}
