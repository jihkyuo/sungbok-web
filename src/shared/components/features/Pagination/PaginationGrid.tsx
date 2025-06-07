import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

interface Item {
  key: string | number;
  thumbnail: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
}

export interface PaginationGridProps {
  items: Item[];
  className?: string;
}

export const PaginationGrid = ({ items = [], className }: PaginationGridProps) => {
  return (
    <div className={cn('grid grid-cols-4 gap-4', className)}>
      {items.map(item => (
        <div key={item.key}>
          {item.thumbnail}
          {item.title}
          {item.description}
        </div>
      ))}
    </div>
  );
};
