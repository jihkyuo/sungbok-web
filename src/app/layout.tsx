import { AppProvider } from '@/app/_provider';
import { Footer } from '@/shared/components/layout/Footer';
import { Header } from '@/shared/components/layout/Header';
import type { Metadata } from 'next';
// 폰트는 외부 CDN 없이 우리 도메인에서 제공한다(ADR 0009). 둘 다 unicode-range 조각이라 쓰인 글자만 받는다.
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import '@fontsource/nanum-brush-script/400.css'; // 표어용 붓글씨 서예체(.b1-brush)
// 숫자·날짜·머리표(.b1-mono, 29개 파일) — 라틴 글자만 쓰므로 latin 조각만 넣는다
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import '@fontsource/jetbrains-mono/latin-600.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import './globals.css';

export const metadata: Metadata = {
  title: '성복교회',
  description: '성복교회 홈페이지',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        suppressHydrationWarning
        className="bg-b1-bg text-b1-text flex min-h-dvh flex-col font-sans antialiased"
      >
        <AppProvider>
          <Header />
          {/* 본문이 짧아도 푸터가 바닥에 붙도록 남는 높이를 main 이 차지한다(body = flex-col min-h-dvh) */}
          <main className="flex-1">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
