'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * 요소가 화면 근처(rootMargin 만큼 앞)에 처음 들어오면 true 로 바뀌고 그대로 유지한다.
 * 무거운 임베드(유튜브 iframe 등)를 첫 로딩에서 빼고, 사용자가 닿기 전에 미리 붙일 때 쓴다.
 */
export const useNearViewport = <T extends Element>(
  ref: RefObject<T | null>,
  rootMargin = '200% 0px'
): boolean => {
  // 서버·첫 렌더는 항상 false(하이드레이션 일치). 판단은 마운트 뒤 effect 에서.
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (near) return;
    const el = ref.current;
    // IntersectionObserver 는 Next 16 지원 브라우저(Safari 16.4+, Chrome 111+) 전부에 있다.
    if (!el) return;
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, near]);

  return near;
};
