import arrowUpRightIcon from '@/assets/icons/arrow-up-right.svg';
import { Card } from '@/components/features/Card';
import { DarkOverlay } from '@/components/features/DarkOverlay';
import { EdgeHoleArea } from '@/components/features/EdgeHoleArea';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import type { PropsWithChildren, ReactNode } from 'react';

interface Props {
  imgSrc: string;
  title: ReactNode;
  subtitle: ReactNode;
}

export const LinkBgCard = ({ imgSrc, title, subtitle }: Props) => {
  return (
    <Card className={'cursor-pointer'}>
      <EdgeHoleArea>
        <Button
          className={
            'h-17 w-17 rounded-full transition-all duration-400 group-hover:bg-blue-500 hover:bg-blue-500'
          }
        >
          <Image src={arrowUpRightIcon} alt="arrowUpRightIcon" />
        </Button>
      </EdgeHoleArea>

      <div
        style={{ backgroundImage: `url(${imgSrc})` }}
        className={'relative h-full bg-cover bg-center px-15 py-30 break-keep text-white'}
      >
        <DarkOverlay />

        <div className="relative z-10">
          <Title>{title}</Title>
          <Subtitle>{subtitle}</Subtitle>
        </div>
      </div>
    </Card>
  );
};

const Title = ({ children }: PropsWithChildren) => {
  return (
    <h1 className="text-4xl leading-tight font-bold tracking-tight drop-shadow-[1px_1px_2px_rgba(0,0,0,0.9)]">
      {children}
    </h1>
  );
};

const Subtitle = ({ children }: PropsWithChildren) => {
  return (
    <div className="mt-4 text-2xl font-semibold drop-shadow-[1px_1px_2px_rgba(0,0,0,0.9)]">
      {children}
    </div>
  );
};
