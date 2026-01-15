import type { Metadata } from 'next';
import { Source_Code_Pro } from 'next/font/google';
import './../globals.css';
import { BottomNav } from '@/components/layout/bottom-nav';

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
});

export const metadata: Metadata = {
  title: 'DevDaily',
  description: '매일 5분, 개발 지식을 퀴즈로 복습하는 학습 플랫폼',
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
