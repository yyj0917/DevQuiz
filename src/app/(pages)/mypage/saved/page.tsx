import { Suspense } from 'react';
import { getSavedQuestionsAction } from '../actions';
import { SavedQuestionsList } from '@/components/mypage/saved-questions-list';
import { LoadingSpinner } from '@/components/common/loading-spinner';

async function SavedQuestionsContent() {
  const result = await getSavedQuestionsAction();

  if (!result.success) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center text-red-600">
          {result.error || '저장한 문제를 불러오는데 실패했습니다.'}
        </div>
      </div>
    );
  }

  return <SavedQuestionsList initialSavedQuestions={result.savedQuestions} />;
}

export default function SavedQuestionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner />
        </div>
      }
    >
      <SavedQuestionsContent />
    </Suspense>
  );
}
