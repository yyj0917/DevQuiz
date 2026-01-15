'use client';

import { useState, useEffect } from 'react';
import { getWrongNotesAction, resolveWrongNoteAction } from '../actions';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ReportDialog } from '@/components/quiz/report-dialog';

export default function WrongNotesPage() {
  const [wrongNotes, setWrongNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unreviewed' | 'reviewed'>(
    'unreviewed'
  );
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  

  const loadWrongNotes = async () => {
    setIsLoading(true);
    const filterParam =
      filter === 'all'
        ? undefined
        : { isReviewed: filter === 'reviewed' };

    const result = await getWrongNotesAction(filterParam);

    if (result.success) {
      setWrongNotes(result.wrongNotes || []);
    }

    setIsLoading(false);
  };
  

  const handleResolve = async (wrongNoteId: string) => {
    const result = await resolveWrongNoteAction(wrongNoteId);

    if (result.success) {
      // Update UI
      setWrongNotes((prev) =>
        prev.map((note) =>
          note.id === wrongNoteId
            ? { ...note, is_reviewed: true, reviewed_at: new Date().toISOString() }
            : note
        )
      );
    }
  };
  useEffect(() => {
    loadWrongNotes();
  }, [filter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('unreviewed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unreviewed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            복습 필요
          </button>
          <button
            onClick={() => setFilter('reviewed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'reviewed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            복습 완료
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
        </div>
      </div>

      {/* Wrong Notes List */}
      {wrongNotes.length === 0 ? (
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
      ) : (
        <div className="space-y-4">
          {wrongNotes.map((note: any) => {
            const question = note.questions;
            const category = question?.categories;

            return (
              <div
                key={note.id}
                className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
                  note.is_reviewed
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
                      {note.wrong_count}번 틀림
                    </span>
                    {note.is_reviewed && (
                      <span className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded">
                        ✓ 복습 완료
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(note.last_wrong_at).toLocaleDateString('ko-KR')}
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
                <div className='flex gap-2'>
                <button
                  onClick={() => setReportDialogOpen(true)}
                  className="flex-1 w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  문제 신고
                </button>
                {!note.is_reviewed && (
                  <button
                    onClick={() => handleResolve(note.id)}
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
      )}

      {wrongNotes.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          총 {wrongNotes.length}개의 오답이 있습니다
        </div>
      )}
      <ReportDialog
        questionId={wrongNotes.id }
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
      />
    </div>
  );
}
