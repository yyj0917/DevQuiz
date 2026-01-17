'use client';

import { useState } from 'react';

interface QuizModeSelectorProps {
  onStart: (mode: 'random' | 'wrong_only', count: number) => void;
  isLoading?: boolean;
}

export function QuizModeSelector({ onStart, isLoading }: QuizModeSelectorProps) {
  const [mode, setMode] = useState<'random' | 'wrong_only'>('random');
  const [count, setCount] = useState(10);

  const counts = [5, 10, 15, 20];

  const handleStart = () => {
    onStart(mode, count);
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          퀴즈 모드
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setMode('random')}
            className={`p-4 rounded-lg border-2 transition-all ${
              mode === 'random'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">🎲</div>
            <div className="font-semibold">랜덤 모드</div>
            <div className="text-xs text-gray-500 mt-1">
              문제를 무작위로 출제
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMode('wrong_only')}
            className={`p-4 rounded-lg border-2 transition-all ${
              mode === 'wrong_only'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">❌</div>
            <div className="font-semibold">오답만 모드</div>
            <div className="text-xs text-gray-500 mt-1">
              틀렸던 문제만 출제
            </div>
          </button>
        </div>
      </div>

      {/* Question Count Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          문제 개수
        </label>
        <div className="grid grid-cols-4 gap-3">
          {counts.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCount(c)}
              className={`py-3 px-4 text-sm rounded-lg border-2 font-semibold transition-all ${
                count === c
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {c}문제
            </button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <button
        type="button"
        onClick={handleStart}
        disabled={isLoading}
        className="w-full py-4 px-6 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? '퀴즈 준비 중...' : '퀴즈 시작하기'}
      </button>
    </div>
  );
}
