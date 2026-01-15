'use client';

import { toggleQuestionActiveAction } from '@/app/(admin)/admin/questions/actions';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

interface ToggleActiveButtonProps {
  questionId: string;
  initialActive: boolean;
}

export default function ToggleActiveButton({
  questionId,
  initialActive,
}: ToggleActiveButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isActive, setIsActive] = useState(initialActive);

  const handleToggle = () => {
    const newState = !isActive;
    setIsActive(newState); // Optimistic update

    startTransition(async () => {
      const result = await toggleQuestionActiveAction(questionId, newState);
      if (result.success) {
        router.refresh();
      } else {
        setIsActive(!newState); // Rollback on error
        alert(result.error || '상태 변경에 실패했습니다.');
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
        isActive
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'bg-gray-400 text-white hover:bg-gray-500'
      }`}
    >
      {isPending ? '변경 중...' : isActive ? '✓ 활성' : '✕ 비활성'}
    </button>
  );
}
