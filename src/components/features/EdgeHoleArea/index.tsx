import maskSideImg02 from '@/assets/images/bgSide02.png';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
  className?: string;
}

export const EdgeHoleArea = ({ children, className }: Props) => {
  return (
    <div className={'relative'}>
      <div className={cn('absolute top-0 right-0 h-22 w-22 rounded-bl-[30px] bg-white', className)}>
        <MaskImage side="top" />
        <MaskImage side="bottom" />
        <div className={'absolute top-0 right-0'}>{children}</div>
      </div>
    </div>
  );
};

interface MaskImageProps {
  side: 'top' | 'bottom';
}

const MaskImage = ({ side }: MaskImageProps) => {
  return (
    <Image
      src={maskSideImg02}
      alt="maskSideImg"
      className={cn('absolute brightness-[1000] contrast-[1000]', {
        'top-0 left-[-30px]': side === 'top',
        'right-0 bottom-[-30px]': side === 'bottom',
      })}
    />
  );
};
