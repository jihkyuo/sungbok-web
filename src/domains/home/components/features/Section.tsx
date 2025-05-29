import { cn } from '@/shared/lib/utils';
import type { PropsWithChildren } from 'react';

interface Props {
  className?: string;
}

export const Section = ({ children, className }: PropsWithChildren<Props>) => {
  return (
    <section className={cn('mx-auto max-w-[1400px] px-10 md:px-40', className)}>{children}</section>
  );
};
