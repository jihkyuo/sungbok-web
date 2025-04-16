import bgImgMain01 from '@/assets/images/main/main01.jpg';
import { DarkOverlay } from '@/components/features/DarkOverlay';

export const HomeBanner = () => {
  return (
    <div
      style={{ backgroundImage: `url(${bgImgMain01.src})` }}
      className={'relative h-[calc(100vh-400px)] w-full bg-cover bg-center'}
    >
      <DarkOverlay />

      <div className="flex h-full flex-col justify-center px-40 text-white">
        <Title />
        <Subtitle />
      </div>
    </div>
  );
};

const Title = () => {
  return (
    <h1 className="text-5xl leading-tight font-bold tracking-tight drop-shadow-[1px_1px_2px_rgba(0,0,0,0.9)]">
      삶에 기쁨과 <br />
      소망을 주는 교회
    </h1>
  );
};

const Subtitle = () => {
  return (
    <p className="mt-4 text-2xl font-semibold drop-shadow-[1px_1px_2px_rgba(0,0,0,0.9)]">
      성복교회는 대한예수교장로회 합동교단(총신대학교)에 소속되어 있습니다.
    </p>
  );
};
