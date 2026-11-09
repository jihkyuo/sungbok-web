import { AppProvider } from '@/app/_provider';
import { Footer } from '@/shared/components/layout/Footer';
import { Header } from '@/shared/components/layout/Header';
import type { Metadata } from 'next';
import { JetBrains_Mono, Nanum_Brush_Script } from 'next/font/google';
// 본문 폰트 — Pretendard 를 같은 출처(/_next/static/media)에서 서빙한다. 외부 CDN 연결(DNS·TLS)과
// 렌더 차단 외부 CSS 를 없앤다. dynamic-subset 이라 화면에 쓰인 글자 묶음만 받는다(전체 2MB 아님).
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

// 표어용 붓글씨 서예체 — 빌드 때 받아 자체 호스팅. 한글 조각은 미리 받지 않고 쓰일 때 받는다.
const nanumBrush = Nanum_Brush_Script({
  variable: '--font-brush',
  weight: '400',
  subsets: ['latin'],
  preload: false,
  display: 'swap',
});

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
        className={`${jetbrainsMono.variable} ${nanumBrush.variable} bg-b1-bg text-b1-text flex min-h-dvh flex-col font-sans antialiased`}
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
