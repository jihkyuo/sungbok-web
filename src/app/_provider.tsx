'use client';

import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactLenis } from 'lenis/react';
import { scrollbarWidth } from '@/shared/lib/scrollbarWidth';
import { useEffect, useState, type PropsWithChildren } from 'react';

export const AppProvider = ({ children }: PropsWithChildren) => {
  // QueryClient 는 컴포넌트 안에서 만든다 — 서버는 렌더(=ISR 재생성)마다 새로, 브라우저는 탭당 하나.
  // 모듈 스코프에 두면 서버 프로세스 전체가 한 캐시를 공유해, 홈 HydrationBoundary 가 첫 재생성 데이터에
  // 굳어(이미 있는 쿼리는 렌더 중에 덮지 않음) 이후 HTML 이 옛 피드로 나가고 하이드레이션이 어긋난다.
  // 실패한 쿼리는 여기 한곳에서 기록한다 — 화면엔 실패 문구만 보이므로 원인은 콘솔에 남긴다.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => console.error('[query]', query.queryKey, error),
        }),
      })
  );
  // 데스크톱 휠을 매 프레임 lerp 로 보간해 관성 스크롤(스무딩)을 준다. 휠 한 틱마다
  // ~100px 점프하는 "뚝뚝" 끊김을 없앤다. 모바일 터치는 OS 네이티브 관성을 그대로 두어
  // 지연감을 막는다(syncTouch:false). 인페이지 해시 앵커(#worship/#location)는 스무스 이동 —
  // 고정 헤더 보정은 전역 scroll-padding-top(globals.css) 한 곳만 쓴다. Lenis 가 scroll-padding-top 과
  // 대상의 scroll-margin-top 을 직접 읽으므로 여기서 offset 을 또 주면 두 번 빠진다(아이폰에서 80px 더 아래에 멈춤).
  // 스크롤 위치 복원은 Lenis 가 마운트 시 현재(복원된) 위치에서 시작하므로 즉시 유지된다.
  // prefers-reduced-motion 이면 스무딩을 끄고 네이티브 스크롤로 동작(트리는 유지해 리마운트 방지).
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // 화면 끝까지 꽉 채우는 연출(calc(100vw - var(--sbw)))이 스크롤바 폭만큼 넘치지 않게 --sbw 를 둔다.
  // 스크롤바는 페이지 길이에 따라 생기고 없어지므로 크기 변화마다 다시 잰다.
  useEffect(() => {
    const root = document.documentElement;
    const sync = () =>
      root.style.setProperty('--sbw', `${scrollbarWidth(window.innerWidth, root.clientWidth)}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(document.body);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, []);

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        smoothWheel: !reduced,
        syncTouch: false,
        anchors: !reduced,
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ReactLenis>
  );
};
