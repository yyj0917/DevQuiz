'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/constants/categories';
import type { CategorySlug } from '@/constants/categories';

type CategoryStepProps = {
  selectedCategories: CategorySlug[];
  onCategoryToggle: (slug: CategorySlug) => void;
  onSubmit: () => void;
};

export function CategoryStep({
  selectedCategories,
  onCategoryToggle,
  onSubmit,
}: CategoryStepProps) {
  const canSubmit = selectedCategories.length >= 3;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-[#1e3a8a]">관심 카테고리 선택</CardTitle>
        <CardDescription className="text-base mt-2">
          최소 3개 이상의 카테고리를 선택해주세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategories.includes(category.slug);
            return (
              <button
                key={category.slug}
                type="button"
                onClick={() => onCategoryToggle(category.slug)}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all',
                  'hover:shadow-md',
                  isSelected
                    ? 'bg-[#1e3a8a] border-[#1e3a8a] text-white'
                    : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
                )}
              >
                <span className="text-3xl">{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            );
          })}
        </div>
        <div className="pt-2">
          <p
            className={cn(
              'text-sm text-center',
              canSubmit ? 'text-gray-600' : 'text-orange-600'
            )}
          >
            {canSubmit
              ? `${selectedCategories.length}개 선택됨`
              : `최소 3개 이상 선택해주세요 (현재 ${selectedCategories.length}개)`}
          </p>
        </div>
        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="w-full h-12 text-base rounded-2xl bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          완료
        </Button>
      </CardContent>
    </Card>
  );
}
