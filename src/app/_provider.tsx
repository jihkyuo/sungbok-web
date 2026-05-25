'use client';

import { YoutubeInitialize } from '@/shared/api/YoutubeInitialize';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactLenis } from 'lenis/react';
import { useState, type PropsWithChildren } from 'react';

const queryClient = new QueryClient();

export const AppProvider = ({ children }: PropsWithChildren) => {
  // 데스크톱 휠을 매 프레임 lerp 로 보간해 관성 스크롤(스무딩)을 준다. 휠 한 틱마다
  // ~100px 점프하는 "뚝뚝" 끊김을 없앤다. 모바일 터치는 OS 네이티브 관성을 그대로 두어
  // 지연감을 막는다(syncTouch:false). 인페이지 해시 앵커(#worship/#location)는 80px 고정
  // 헤더만큼 보정해 스무스 이동(기존 scroll-padding-top 의존 대체).
  // 스크롤 위치 복원은 Lenis 가 마운트 시 현재(복원된) 위치에서 시작하므로 즉시 유지된다.
  // prefers-reduced-motion 이면 스무딩을 끄고 네이티브 스크롤로 동작(트리는 유지해 리마운트 방지).
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        smoothWheel: !reduced,
        syncTouch: false,
        anchors: reduced ? false : { offset: -80 },
      }}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <YoutubeInitialize />
      </QueryClientProvider>
    </ReactLenis>
  );
};
