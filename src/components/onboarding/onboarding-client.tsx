'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { NicknameStep } from './nickname-step';
import { CategoryStep } from './category-step';
import { completeOnboardingAction } from '@/app/(pages)/onboarding/actions';
import type { CategorySlug } from '@/constants/categories';

type OnboardingClientProps = {
  categories: Array<{ slug: string; name: string; icon: string }>;
};

export function OnboardingClient({ categories }: OnboardingClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [nickname, setNickname] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<CategorySlug[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleCategoryToggle = (slug: CategorySlug) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleSubmit = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    // Step 2: Submit onboarding
    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('nickname', nickname.trim());
        formData.append('categories', JSON.stringify(selectedCategories));

        await completeOnboardingAction(formData);
        // redirect는 서버 액션에서 처리
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('온보딩 완료 중 오류가 발생했습니다');
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-[#1e3a8a] text-3xl font-bold mb-2 lowercase">DevQuiz</div>
          <div className="flex justify-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
          </div>
        </div>

        {/* Steps Indicator */}
        <div className="flex justify-center gap-2 mb-4">
          <div
            className={currentStep === 1 ? 'w-8 h-1.5 bg-[#1e3a8a] rounded' : 'w-8 h-1.5 bg-gray-300 rounded'}
          />
          <div
            className={currentStep === 2 ? 'w-8 h-1.5 bg-[#1e3a8a] rounded' : 'w-8 h-1.5 bg-gray-300 rounded'}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full max-w-md mx-auto rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Step Content */}
        {currentStep === 1 ? (
          <NicknameStep
            nickname={nickname}
            onNicknameChange={setNickname}
            onNext={handleSubmit}
          />
        ) : (
          <CategoryStep
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
            onSubmit={handleSubmit}
          />
        )}

        {/* Loading State */}
        {isPending && (
          <div className="text-center text-sm text-gray-500">
            저장 중...
          </div>
        )}
      </div>
    </div>
  );
}
