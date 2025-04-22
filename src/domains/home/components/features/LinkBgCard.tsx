import arrowUpRightIcon from '@/assets/icons/arrow-up-right.svg';
import { Card } from '@/components/features/Card';
import { EdgeHoleArea } from '@/components/features/EdgeHoleArea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { HTMLAttributes, PropsWithChildren, ReactNode } from 'react';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  imgSrc: string;
  hoverImgSrc?: string;
  title: ReactNode;
  subtitle: ReactNode;
}

export const LinkBgCard = ({ imgSrc, hoverImgSrc, title, subtitle, className, ...rest }: Props) => {
  return (
    <Card
      {...rest}
      className={cn(
        'min-h-[350px] cursor-pointer transition-all duration-500 hover:translate-y-[-5px]',
        className
      )}
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

      {/* 호버 효과를 위해 두 개의 배경 이미지 레이어 생성 */}
      <div className="relative h-full">
        {/* 기본 이미지 레이어 */}
        <div
          style={{ backgroundImage: `url(${imgSrc})` }}
          className="absolute inset-0 transition-opacity duration-300 bg-center bg-cover group-hover:opacity-0"
        />

        {/* 호버 이미지 레이어 */}
        {hoverImgSrc && (
          <div
            style={{ backgroundImage: `url(${hoverImgSrc})` }}
            className="absolute inset-0 z-10 transition-opacity duration-300 bg-center bg-cover opacity-0 group-hover:opacity-100"
          >
            <DarkGradientOverlay />
          </div>
        )}

        {/* 콘텐츠 레이어 */}
        <div className="relative flex flex-col justify-end h-full p-10 text-white break-keep">
          <DarkGradientOverlay />
          <div className="relative z-10">
            <Title>{title}</Title>
            <Subtitle>{subtitle}</Subtitle>
          </div>
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

const DarkGradientOverlay = () => {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      <div className="absolute inset-0 transition-all duration-300 opacity-0 bg-gradient-to-tr from-black/30 group-hover:opacity-100" />
    </>
  );
};
