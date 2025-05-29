import { cn } from '@/shared/lib/utils';

interface Props {
  className?: string;
}

export const DividerLine = ({ className }: Props) => {
  return (
    <div
      className={cn('mt-4 h-[2px] w-full bg-gradient-to-r from-gray-400 to-transparent', className)}
    />
  );
};
