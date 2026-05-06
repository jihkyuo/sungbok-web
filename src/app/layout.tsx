import { AppProvider } from '@/app/_provider';
import { Footer } from '@/shared/components/layout/Footer';
import { Header } from '@/shared/components/layout/Header';
import type { Metadata } from 'next';
import { Geist, Geist_Mono, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${jetbrainsMono.variable} ${geistSans.variable} ${geistMono.variable} bg-b1-bg text-b1-text font-sans antialiased`}
      >
        <AppProvider>
          <Header />
          {children}
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
