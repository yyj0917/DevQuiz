'use client';

import { deleteQuestionAction } from '@/app/(admin)/admin/questions/actions';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

interface DeleteQuestionButtonProps {
  questionId: string;
}

export default function DeleteQuestionButton({
  questionId,
}: DeleteQuestionButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    startTransition(async () => {
      const result = await deleteQuestionAction(questionId);
      if (result.success) {
        router.push('/admin/questions');
        router.refresh();
      } else {
        alert(result.error || '삭제에 실패했습니다.');
        setShowConfirm(false);
      }
    });
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className="relative">
      {showConfirm ? (
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isPending ? '삭제 중...' : '✓ 확인'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
          >
            취소
          </button>
        </div>
      ) : (
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          🗑️ 삭제
        </button>
      )}
    </div>
  );
}
