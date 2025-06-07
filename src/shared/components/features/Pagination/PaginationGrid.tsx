import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
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
    <div className={cn('grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4', className)}>
      {items.map(item => (
        <Tooltip key={item.key}>
          <TooltipTrigger asChild>
            <div className="flex flex-col gap-2">
              <div>{item.thumbnail}</div>
              <div className="text-sm font-medium">{item.title}</div>
              <div className="text-sm text-gray-500">{item.description}</div>
            </div>
          </TooltipTrigger>
          <TooltipContent side={'bottom'} sideOffset={-35}>
            {item.title}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};
