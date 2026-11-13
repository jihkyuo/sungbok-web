'use client';

import { useScrollFadeIn } from '@/shared/lib/hooks/useScrollFadeIn';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties, ElementType, PropsWithChildren } from 'react';

interface Props {
  as?: ElementType;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

export const Reveal = ({
  as: Tag = 'div',
  delay = 0,
  className,
  style,
  children,
}: PropsWithChildren<Props>) => {
  const { ref, isVisible } = useScrollFadeIn({ threshold: 0.1, rootMargin: '-40px' });

  return (
    <Tag
      ref={ref}
      style={{ ...style, transitionDelay: `${delay}ms` }}
      className={cn(
        // 바뀌는 두 속성만 전환한다. will-change 는 두지 않는다 — 등장이 끝난 뒤에도 요소마다 층이 남는다(전환 중에는 브라우저가 알아서 층을 만든다).
        'transition-[translate,opacity] duration-700 ease-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        // «동작 줄이기»면 처음부터 최종 상태 — 떠오르기·페이드 없이 바로 보인다(DESIGN.md §3).
        // CSS 미디어쿼리라 JS·관찰자 없이도 적용되고, 하이드레이션 전 서버 HTML 에서도 숨겨지지 않는다.
        'motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none',
        className
      )}
    >
      {children}
    </Tag>
  );
};
