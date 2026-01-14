'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NicknameStepProps = {
  nickname: string;
  onNicknameChange: (nickname: string) => void;
  onNext: () => void;
};

export function NicknameStep({ nickname, onNicknameChange, onNext }: NicknameStepProps) {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = nickname.trim();

    if (trimmed.length < 2) {
      setError('닉네임은 최소 2자 이상이어야 합니다');
      return;
    }

    if (trimmed.length > 16) {
      setError('닉네임은 최대 16자까지 입력 가능합니다');
      return;
    }

    if (!/^[가-힣a-zA-Z0-9\s]+$/.test(trimmed)) {
      setError('닉네임은 한글, 영문, 숫자만 사용 가능합니다');
      return;
    }

    onNext();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-[#1e3a8a]">반가워요, 개발자님</CardTitle>
        <CardDescription className="text-base mt-2">
          사용할 닉네임을 입력해주세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => {
                setError(null);
                onNicknameChange(e.target.value);
              }}
              className={cn(
                'h-12 text-base',
                error && 'border-red-500 focus-visible:ring-red-500'
              )}
              maxLength={16}
              autoFocus
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <p className="text-xs text-gray-500">
              한글, 영문, 숫자만 사용 가능하며 2-16자까지 입력 가능합니다
            </p>
          </div>
          <Button
            type="submit"
            className="w-full h-12 text-base rounded-2xl bg-[#1e3a8a] hover:bg-[#1e40af]"
            disabled={nickname.trim().length < 2}
          >
            다음
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
