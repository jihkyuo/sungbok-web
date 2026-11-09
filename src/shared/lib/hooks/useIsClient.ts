'use client';

import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/**
 * 브라우저에 마운트됐는지. 서버 HTML·하이드레이션 첫 렌더는 false, 그 뒤 true.
 * `useEffect(() => setMounted(true), [])` 대신 쓴다 — effect 안 setState 가 렌더를 한 번 더 일으키지 않게.
 */
export const useIsClient = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false
  );
