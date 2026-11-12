'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useSyncExternalStore } from 'react';

// 고른 영상을 주소(?v=영상id)에 둔다 — 주소를 공유하면 그 영상이 열리고, 뒤로 가면 이전 영상으로 돌아간다.
// 화면은 next/navigation 의 useSearchParams 로 읽지 않는다: 그 훅을 쓰면 정적(ISR) 페이지에서 이 화면 전체가
// 서버 HTML 에서 빠지고(Suspense 대체 화면만 남는다) 브라우저에서야 그려진다. 여기서는 서버 HTML 은 늘
// 최신 설교로 그리고, 주소의 v 는 하이드레이션 뒤에 읽는다.

const KEY = 'v';
const listeners = new Set<() => void>();

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  window.addEventListener('popstate', onChange); // 뒤로·앞으로
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('popstate', onChange);
  };
};
const read = () => new URLSearchParams(window.location.search).get(KEY);

/**
 * [주소의 영상 id(없으면 null), 영상 고르기]. 서버 HTML·하이드레이션 첫 렌더는 null.
 * 고르기는 기본이 'push'(방문 기록에 남아 뒤로 가면 이전 영상), 'replace' 는 주소만 바꾼다.
 */
export const useVideoParam = (): [
  string | null,
  (videoId: string, mode?: 'push' | 'replace') => void,
] => {
  const videoId = useSyncExternalStore(subscribe, read, () => null);
  const pick = useCallback((next: string, mode: 'push' | 'replace' = 'push') => {
    if (read() === next) return;
    const url = new URL(window.location.href);
    url.searchParams.set(KEY, next);
    // Next 라우터는 history.pushState·replaceState 를 감지해 주소만 맞춘다(서버 요청 없음). 첫 인자는 null —
    // history.state(Next 내부 표시가 들어 있다)를 그대로 넘기면 Next 가 제 호출로 여겨 라우터 주소를 맞추지 않는다.
    if (mode === 'replace') window.history.replaceState(null, '', url);
    else window.history.pushState(null, '', url);
    listeners.forEach(notify => notify());
  }, []);
  return [videoId, pick];
};

/**
 * Next 라우터가 주소를 바꿨을 때(같은 페이지로 가는 링크·router.push — popstate 가 나지 않는다) 구독자에게 알린다.
 * 이게 없으면 영상을 고른 뒤 머리의 «주일예배» 를 눌러 주소에서 v 가 사라져도 화면엔 고른 영상이 남는다.
 * useSearchParams 를 쓰므로 Suspense 로 감싼 빈 부품 안에서만 부른다 — 그 안쪽만 서버 HTML 에서 빠진다.
 */
export const useVideoParamRouterSync = () => {
  // 라우터 밖(시험 등)에서는 null
  const routerVideoId = useSearchParams()?.get(KEY) ?? null;
  useEffect(() => {
    listeners.forEach(notify => notify());
  }, [routerVideoId]);
};
