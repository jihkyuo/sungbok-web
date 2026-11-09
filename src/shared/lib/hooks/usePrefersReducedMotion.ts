'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

const subscribe = (onChange: () => void) => {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
};

/**
 * OS «동작 줄이기» 설정. 서버 HTML·하이드레이션 첫 렌더는 false, 그 뒤 실제 값이며 페이지를 연 채 바꿔도 따라간다.
 * DESIGN.md §3 — 자동재생·연속 애니메이션은 이 값이 true 면 멈춘 상태로 둔다.
 */
export const usePrefersReducedMotion = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
