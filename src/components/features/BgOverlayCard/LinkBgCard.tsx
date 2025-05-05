import arrowUpRightIcon from '@/assets/icons/arrow-up-right.svg';
import { BaseCard } from '@/components/features/BgOverlayCard/BaseCard';
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
    <BaseCard
      {...rest}
      className={cn(
        '3xl:min-h-[350px] min-h-[150px] cursor-pointer rounded-[45px] transition-all duration-500 hover:translate-y-[-5px] sm:min-h-[250px] md:rounded-[45px_0_45px_45px]',
        className
      )}
    >
      <EdgeHoleArea className={'hidden sm:block'}>
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
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-300 group-hover:opacity-0"
        />

        {/* 호버 이미지 레이어 */}
        {hoverImgSrc && (
          <div
            style={{ backgroundImage: `url(${hoverImgSrc})` }}
            className="absolute inset-0 z-10 bg-cover bg-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <DarkGradientOverlay />
          </div>
        )}

        {/* 콘텐츠 레이어 */}
        <div className="relative flex h-full flex-col justify-end p-5 break-keep text-white sm:p-10">
          <DarkGradientOverlay />
          <div className="relative z-10">
            <Title>{title}</Title>
            <Subtitle>{subtitle}</Subtitle>
          </div>
        </div>
      </div>
    </BaseCard>
  );
};

const Title = ({ children }: PropsWithChildren) => {
  return (
    <h1 className="text-3xl leading-tight font-bold tracking-tight drop-shadow-[1px_1px_2px_rgba(0,0,0,0.9)] sm:text-4xl">
      {children}
    </h1>
  );
};

const Subtitle = ({ children }: PropsWithChildren) => {
  return (
    <div className="mt-4 text-sm font-semibold drop-shadow-[1px_1px_2px_rgba(0,0,0,0.9)] sm:text-2xl">
      {children}
    </div>
  );
};

const DarkGradientOverlay = () => {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/30 opacity-0 transition-all duration-300 group-hover:opacity-100" />
    </>
  );
};
