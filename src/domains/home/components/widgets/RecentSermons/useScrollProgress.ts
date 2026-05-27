'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 요소가 뷰포트를 통과하는 진행도(0~1).
 * 0 = 요소 top 이 뷰포트 바닥에 막 닿음(등장 직전), 1 = 요소 bottom 이 뷰포트 top 을 막 빠져나감(사라짐).
 * Lenis 는 실제 document 스크롤을 움직이므로 window scroll 이벤트로 충분. rAF 로 스로틀.
 */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const total = r.height + vh;
      const passed = vh - r.top;
      setProgress(Math.min(1, Math.max(0, passed / total)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return { ref, progress };
}
