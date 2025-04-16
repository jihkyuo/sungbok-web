import { cn } from '@/lib/utils';
import type { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
  className?: string;
}

export const Card = ({ className, children }: Props) => {
  return (
    <div className={cn('group w-full overflow-hidden rounded-[45px_0_45px_45px]', className)}>
      {children}
    </div>
  );
};
