import type { Metadata } from 'next';
import { Source_Code_Pro } from 'next/font/google';
import './../globals.css';
import { BottomNav } from '@/components/layout/bottom-nav';

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
});

export const metadata: Metadata = {
  title: 'DevQuiz',
  description: '매일 5분, 개발 지식을 퀴즈로 복습하는 학습 플랫폼',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DevQuiz',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icons-192x192.png',
    apple: '/icons/icons-192x192.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${sourceCodePro.variable} antialiased mobile-area border-l border-r`}>
        <div className="pb-16">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
