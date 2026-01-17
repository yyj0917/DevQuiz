'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { resolveWrongNoteAction } from '@/app/(pages)/mypage/actions';
import { WrongNotesFilters } from './wrong-notes-filters';
import { ReportDialog } from '@/components/quiz/report-dialog';
import { useState } from 'react';
import type { WrongQuestion } from '@/types/mypage-stats';

interface WrongQuestionsListProps {
  initialQuestions: WrongQuestion[];
}

export function WrongQuestionsList({
  initialQuestions,
}: WrongQuestionsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null
  );

  const filter =
    (searchParams.get('filter') as 'all' | 'unreviewed' | 'reviewed') ||
    'unreviewed';

  const handleFilterChange = (newFilter: 'all' | 'unreviewed' | 'reviewed') => {
    const params = new URLSearchParams(searchParams.toString());
    if (newFilter === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', newFilter);
    }
    router.push(`?${params.toString()}`);
  };

  const handleResolve = async (wrongNoteId: string) => {
    const result = await resolveWrongNoteAction(wrongNoteId);

    if (result.success) {
      // Reload page to reflect changes
      router.refresh();
    }
  };

  const filteredQuestions =
    filter === 'all'
      ? initialQuestions
      : filter === 'reviewed'
      ? initialQuestions.filter((q) => q.isReviewed)
      : initialQuestions.filter((q) => !q.isReviewed);

  if (filteredQuestions.length === 0) {
    return (
      <>
        <WrongNotesFilters filter={filter} onFilterChange={handleFilterChange} />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="text-4xl mb-4">
              {filter === 'unreviewed' ? '🎉' : '📚'}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'unreviewed'
                ? '복습할 오답이 없습니다'
                : '오답 노트가 비어있습니다'}
            </h3>
            <p className="text-gray-600">
              {filter === 'unreviewed'
                ? '모든 문제를 정확히 이해하고 있어요!'
                : '틀린 문제가 생기면 여기에 표시됩니다'}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <WrongNotesFilters filter={filter} onFilterChange={handleFilterChange} />

      <div className="space-y-4">
        {filteredQuestions.map((item) => {
          const question = item.question;
          const category = item.category;

          return (
            <div
              key={item.questionId}
              className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
                item.isReviewed
                  ? 'border-gray-200 opacity-75'
                  : 'border-red-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {category && (
                    <span className="text-sm px-2 py-1 bg-gray-100 rounded">
                      {category.icon} {category.name}
                    </span>
                  )}
                  <span className="text-sm px-2 py-1 bg-red-100 text-red-700 rounded">
                    {item.wrongCount}번 틀림
                  </span>
                  {item.isReviewed && (
                    <span className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded">
                      ✓ 복습 완료
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(item.lastWrongAt).toLocaleDateString('ko-KR')}
                </span>
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
                    const isCorrect =
                      question.answer === (index + 1).toString();
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
                          {isCorrect && (
                            <span className="ml-auto text-green-600">
                              ✓ 정답
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {question?.explanation && (
                <div className="p-3 bg-blue-50 rounded-lg mb-3">
                  <p className="text-sm text-gray-700">
                    💡 {question.explanation}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedQuestionId(question.id);
                    setReportDialogOpen(true);
                  }}
                  className="flex-1 w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  문제 신고
                </button>
                {!item.isReviewed && (
                  <button
                    onClick={() => handleResolve(item.wrongNoteId)}
                    className="flex-2 w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    복습 완료
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredQuestions.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          총 {filteredQuestions.length}개의 오답이 있습니다
        </div>
      )}

      {selectedQuestionId && (
        <ReportDialog
          questionId={selectedQuestionId}
          open={reportDialogOpen}
          onOpenChange={(open) => {
            setReportDialogOpen(open);
            if (!open) {
              setSelectedQuestionId(null);
            }
          }}
        />
      )}
    </>
  );
}

