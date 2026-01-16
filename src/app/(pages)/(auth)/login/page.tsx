import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { KakaoLoginButton } from '@/components/auth/kakao-login-button';

type LoginPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/quiz');
  }

  const error = searchParams?.error;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      {/* Status Bar Simulation
      <div className="flex justify-between items-center px-6 pt-4 pb-2">
        <span className="text-sm text-gray-900">9:41</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 border border-gray-900 rounded-sm">
            <div className="w-full h-full bg-gray-900 rounded-sm"></div>
          </div>
        </div>
      </div> */}

      <div className="flex flex-col items-center px-6 pt-8">
        {/* Logo */}
        <div className="mb-16 mt-8">
          <div className="text-[#1e3a8a] text-3xl font-bold text-center mb-2 lowercase">
            DevQuiz
          </div>
          <div className="flex justify-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-10">
          Login to your Account
        </h1>

        {/* Error Message */}
        {error && (
          <div className="w-full max-w-sm mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
          </div>
        )}

        {/* Sign in Button */}
        <div className="w-full max-w-sm mb-6">
          <KakaoLoginButton />
        </div>

        {/* Divider */}
        <div className="w-full max-w-sm flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sm text-gray-500">Or sign in with</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Social Login Icons */}
        <div className="flex justify-center gap-4 mb-8">
          <KakaoLoginButton isIconOnly />
        </div>
      </div>
    </div>
  );
}

