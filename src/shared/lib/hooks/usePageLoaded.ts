'use client';

import { useSyncExternalStore } from 'react';

// 'load' 는 한 번만 나고 그 뒤 readyState 는 'complete' 로 남는다 — 이벤트를 구독하고 값은 readyState 에서 읽는다.
const subscribe = (onChange: () => void) => {
  window.addEventListener('load', onChange);
  return () => window.removeEventListener('load', onChange);
};

/**
 * 페이지 첫 로딩(window load — 첫 화면의 그림·스크립트)이 끝났으면 true. 서버 HTML·하이드레이션 첫 렌더는 false.
 * 화면 밖의 무거운 것(유튜브 플레이어 등)을 미리 준비할 때, 새로고침 직후 첫 화면과 회선을 다투지 않게 기다리는 데 쓴다.
 */
export const usePageLoaded = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => document.readyState === 'complete',
    () => false
  );
