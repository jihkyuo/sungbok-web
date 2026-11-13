'use client';

import { useEffect } from 'react';
import { loadYouTubeIframeApi } from '@/shared/lib/youtubePlayer';

/** 첫 화면 로드 후 여유 시간에 공용 플레이어 코드만 준비한다. iframe은 영상 영역 근처에서 만든다. */
export const HomeVideoWarmup = () => {
  useEffect(() => {
    let active = true;
    let cancel = () => {};
    const prepare = () => {
      if (!active) return;
      // 준비가 실패해도 첫 화면은 유지한다. 실제 영상 영역의 초기화와는 별개다.
      void loadYouTubeIframeApi().catch(() => {});
    };
    const schedule = () => {
      if (typeof window.requestIdleCallback === 'function') {
        const id = window.requestIdleCallback(prepare, { timeout: 2000 });
        cancel = () => window.cancelIdleCallback(id);
      } else {
        const id = window.setTimeout(prepare, 0);
        cancel = () => window.clearTimeout(id);
      }
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
    return () => {
      active = false;
      window.removeEventListener('load', schedule);
      cancel();
    };
  }, []);
  return null;
};
