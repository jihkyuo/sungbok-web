import { cn } from '@/lib/utils';
import type { PropsWithChildren } from 'react';
interface Props {
  className?: string;
}

export const GridSection = ({ children, className }: PropsWithChildren<Props>) => {
  return (
    <section className={cn(`grid grid-cols-1 gap-10 lg:grid-cols-2`, className)}>
      {children}
    </section>
  );
};
