import arrowUpRightIcon from '@/assets/icons/arrow-up-right.svg';
import { Card } from '@/components/features/Card';
import { EdgeHoleArea } from '@/components/features/EdgeHoleArea';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import type { PropsWithChildren, ReactNode } from 'react';

interface Props {
  imgSrc: string;
  title: ReactNode;
  subtitle: ReactNode;
}

const DarkGradientOverlay = () => {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      <div className="absolute inset-0 transition-all duration-300 opacity-0 bg-gradient-to-tr from-black/30 group-hover:opacity-100" />
    </>
  );
};

export const LinkBgCard = ({ imgSrc, title, subtitle }: Props) => {
  return (
    <Card
      className={
        'min-h-[350px] cursor-pointer transition-all duration-500 hover:translate-y-[-5px]'
      }
    >
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
        className={
          'relative flex h-full flex-col justify-end bg-cover bg-center p-10 break-keep text-white'
        }
      >
        <DarkGradientOverlay />

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
