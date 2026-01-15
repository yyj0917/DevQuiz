'use client';

import { useState, useTransition } from 'react';
import { toggleSaveQuestionAction } from '@/app/(pages)/mypage/actions';

interface BookmarkButtonProps {
  questionId: string;
  initialSaved?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onToggle?: (isSaved: boolean) => void;
}

export function BookmarkButton({
  questionId,
  initialSaved = false,
  size = 'md',
  showLabel = false,
  onToggle,
}: BookmarkButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const handleClick = () => {
    startTransition(async () => {
      // Optimistic update
      const newSavedState = !isSaved;
      setIsSaved(newSavedState);

      const result = await toggleSaveQuestionAction(questionId);

      if (result.success) {
        setIsSaved(result.isSaved || false);
        onToggle?.(result.isSaved || false);
      } else {
        // Rollback on error
        setIsSaved(isSaved);
        alert(result.error || '저장에 실패했습니다.');
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg
        transition-all duration-200
        ${
          isSaved
            ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
        }
        ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={isSaved ? '저장 해제' : '저장하기'}
    >
      <span className={sizeClasses[size]}>
        {isSaved ? '⭐' : '☆'}
      </span>
      {showLabel && (
        <span className="text-sm font-medium">
          {isSaved ? '저장됨' : '저장'}
        </span>
      )}
    </button>
  );
}
