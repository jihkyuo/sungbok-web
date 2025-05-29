import { cn } from '@/shared/lib/utils';
import type { HTMLAttributes } from 'react';
import './index.css';

export const ScrollDownButton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div id="mouse-scroll" className={cn('cursor-pointer', className)} {...props}>
      <div className="mouse">
        <div className="mouse-in"></div>
      </div>
      <div>
        <span className="down-arrow-1"></span>
        <span className="down-arrow-2"></span>
        <span className="down-arrow-3"></span>
      </div>
    </div>
  );
};
