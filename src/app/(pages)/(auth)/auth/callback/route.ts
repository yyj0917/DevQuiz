import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Profile } from '@/types/auth';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('error', error);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('error', 'missing_code');
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createClient();

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('error', 'oauth_callback');
    return NextResponse.redirect(redirectUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('error', 'no_user');
    return NextResponse.redirect(redirectUrl);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_onboarded')
    .eq('id', user.id)
    .maybeSingle() as { data: { is_onboarded: boolean } | null };

  const isOnboarded = profile?.is_onboarded ?? false;
  const redirectPath = isOnboarded ? '/' : '/onboarding';

  const redirectUrl = new URL(redirectPath, request.url);
  return NextResponse.redirect(redirectUrl);
}

