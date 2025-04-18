import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      {...props}
      className={cn('group w-full overflow-hidden rounded-[45px_0_45px_45px]', className)}
    />
  );
};
