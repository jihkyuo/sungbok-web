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
        'transition-all duration-700 ease-out will-change-transform',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        className
      )}
    >
      {children}
    </Tag>
  );
};
