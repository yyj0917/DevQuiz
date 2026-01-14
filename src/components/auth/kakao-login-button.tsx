'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type KakaoLoginButtonProps = {
  isIconOnly?: boolean;
};

export function KakaoLoginButton({ isIconOnly = false }: KakaoLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMessage('카카오 로그인 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    } catch {
      setErrorMessage('알 수 없는 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  if (isIconOnly) {
    return (
      <button
        type="button"
        onClick={handleLogin}
        disabled={isLoading}
        className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
        aria-label="Sign in with Kakao"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="24" height="24" rx="12" fill="#FEE500" />
          <path
            d="M12 6C9.24 6 7 7.79 7 10.1C7 11.65 7.93 13.01 9.3 13.7L8.5 16.5L11.4 15.1C11.6 15.1 11.8 15.1 12 15.1C14.76 15.1 17 13.31 17 11C17 8.69 14.76 6 12 6Z"
            fill="#000000"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleLogin}
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#1e3a8a] text-white px-4 py-3 text-base font-medium hover:bg-[#1e40af] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
      {errorMessage && (
        <p className="text-xs text-red-600 text-center">{errorMessage}</p>
      )}
    </div>
  );
}

