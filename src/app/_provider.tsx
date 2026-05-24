'use client';

import { YoutubeInitialize } from '@/shared/api/YoutubeInitialize';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type PropsWithChildren } from 'react';

const queryClient = new QueryClient();

export const AppProvider = ({ children }: PropsWithChildren) => {
  // 새로고침 시 스크롤 위치 복원은 유지하되, 복원이 smooth 로 애니메이션되어
  // 히어로 인터랙션이 "바쁘게" 따라 움직이는 현상을 막는다. 로드 직후 잠깐
  // scroll-behavior 를 auto 로 강제해 즉시 복원시키고, 이후 CSS smooth 를 되살린다.
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    const id = window.setTimeout(() => {
      html.style.scrollBehavior = prev;
    }, 300);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <YoutubeInitialize />
    </QueryClientProvider>
  );
};
