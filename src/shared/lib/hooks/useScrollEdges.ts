'use client';

import { useEffect, useState, type RefObject } from 'react';

// 끝에서 이만큼 안쪽은 끝으로 본다 — 확대·고해상도 화면의 소수점 스크롤 값에 화살표가 남지 않게
const SLACK = 2;

/**
 * 옆으로 미는 줄(overflow-x)의 양쪽에 넘길 것이 남았는지 — 화살표·흐림 표시를 넘길 수 있는 쪽에만 보일 때 쓴다.
 * start: 앞(왼쪽)으로 더 넘길 수 있다, end: 뒤(오른쪽)로 더 넘길 수 있다. 스크롤할 때와 줄의 크기가 바뀔 때 다시 잰다.
 */
export const useScrollEdges = (ref: RefObject<HTMLElement | null>) => {
  const [edges, setEdges] = useState({ start: false, end: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const start = el.scrollLeft > SLACK;
      const end = el.scrollLeft + el.clientWidth < el.scrollWidth - SLACK;
      // 값이 같으면 같은 객체를 돌려줘 다시 그리지 않는다(스크롤 이벤트는 자주 온다)
      setEdges(prev => (prev.start === start && prev.end === end ? prev : { start, end }));
    };
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(el);
    return () => {
      el.removeEventListener('scroll', measure);
      observer?.disconnect();
    };
  }, [ref]);

  return edges;
};
