import { cn } from '@/shared/lib/utils';
import { forwardRef, type PropsWithChildren } from 'react';

interface Props {
  className?: string;
}

export const Section = forwardRef<HTMLElement, PropsWithChildren<Props>>(
  ({ children, className }, ref) => {
    return (
      <section ref={ref} className={cn('mx-auto max-w-[1400px] px-10 md:px-40', className)}>
        {children}
      </section>
    );
  }
);

Section.displayName = 'Section';
