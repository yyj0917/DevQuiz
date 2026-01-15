'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, BarChart3, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: '홈',
    icon: Home,
    href: '/',
  },
  {
    label: '통계',
    icon: BarChart3,
    href: '/stats',
  },
  {
    label: '퀴즈문의',
    icon: MessageCircle,
    href: '/quiz/inquiry',
  },
  {
    label: '마이페이지',
    icon: User,
    href: '/mypage',
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // 인증/온보딩 페이지에서는 bottom nav 숨김
  const hideNavPaths = ['/login', '/onboarding', '/auth'];
  const shouldHide = hideNavPaths.some((path) => pathname.startsWith(path));

  if (shouldHide) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 mobile-area left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="mobile-area">
        <div className="grid grid-cols-4 h-16 max-w-[500px] mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 transition-colors',
                  isActive
                    ? 'text-[#1e3a8a]'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
