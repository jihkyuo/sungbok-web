'use client';

import bgImgMain01 from '@/assets/images/main/main01.jpg';
import { ScrollDown } from '@/domains/home/components/widgets/HomeHero/ScrollDown';
import { useEffect, useState } from 'react';

export const HomeHero = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div
      style={{ backgroundImage: `url(${bgImgMain01.src})` }}
      className="relative h-screen w-full bg-cover bg-fixed bg-center"
    >
      <DarkMask />
      <div className="relative z-10 flex h-full flex-col items-center justify-center">
        <Title isLoaded={isLoaded} />
        <Subtitle isLoaded={isLoaded} />
      </div>
      <ScrollDown />
    </div>
  );
};

interface TitleProps {
  isLoaded: boolean;
}

const Title = ({ isLoaded }: TitleProps) => {
  return (
    <div className="px-10 text-center">
      <h1
        className={`text-5xl leading-tight font-bold tracking-tight text-white drop-shadow-[2px_2px_8px_rgba(0,0,0,0.8)] transition-all duration-1000 sm:text-6xl md:text-7xl lg:text-8xl ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        삶에 기쁨과 <br />
        <span className="bg-gradient-to-r from-white via-blue-50 to-white bg-clip-text text-transparent">
          소망을 주는 교회
        </span>
      </h1>
    </div>
  );
};

interface SubtitleProps {
  isLoaded: boolean;
}

const Subtitle = ({ isLoaded }: SubtitleProps) => {
  return (
    <p
      className={`absolute bottom-40 left-1/2 -translate-x-1/2 px-10 text-center text-lg font-medium text-gray-100 drop-shadow-[2px_2px_6px_rgba(0,0,0,0.9)] transition-all delay-300 duration-1000 sm:text-xl md:text-2xl ${
        isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
      }`}
    >
      성복교회는 대한예수교장로회 합동교단(총신대학교)에 소속되어 있습니다.
    </p>
  );
};

const DarkMask = () => {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
    </>
  );
};
