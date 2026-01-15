import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

const PROTECTED_PATHS = [
  '/quiz',
  '/quiz/result',
  '/wrong-notes',
  '/stats',
  '/settings',
  '/onboarding',
];

function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const res = NextResponse.next();

  const supabase = createMiddlewareClient(req, res);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = isProtectedPath(pathname);
  const isLoginPath = pathname === '/login';

  // 2. 비로그인 + 보호 라우트 접근 → /login
  if (!user && isProtected) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirectedFrom', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // 3. 로그인 상태 + /login 접근 → /quiz
  if (user && isLoginPath) {
    const quizUrl = new URL('/quiz', req.url);
    return NextResponse.redirect(quizUrl);
  }

  // 4. 로그인 + 온보딩 미완료 + /quiz 접근 → /onboarding
  if (user && pathname.startsWith('/quiz')) {
    const { data: profile } = (await supabase
      .from('profiles')
      .select('is_onboarded')
      .eq('id', user.id)
      .single()) as { data: { is_onboarded: boolean } | null };

    if (!profile?.is_onboarded) {
      const onboardingUrl = new URL('/onboarding', req.url);
      return NextResponse.redirect(onboardingUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

