import bgImgMain01 from '@/assets/images/main/main01.jpg';
import { ScrollDownButton } from '@/components/features/ScrollDownButton';

export const HomeHero = () => {
  return (
    <div
      style={{ backgroundImage: `url(${bgImgMain01.src})` }}
      className={'relative h-screen w-full bg-cover bg-fixed bg-center'}
    >
      <DarkMask />
      <Title />
      <Subtitle />
      <ScrollDownButton className={'absolute bottom-20 left-1/2 -translate-x-1/2'} />
    </div>
  );
};

const Title = () => {
  return (
    <h1 className="pt-40 text-center text-6xl leading-tight font-bold tracking-tight text-white drop-shadow-[1px_1px_3px_rgba(0,0,0,0.9)]">
      삶에 기쁨과 <br />
      소망을 주는 교회
    </h1>
  );
};

const Subtitle = () => {
  return (
    <p className="absolute bottom-40 left-1/2 -translate-x-1/2 text-xl font-semibold text-gray-50 drop-shadow-[2px_2px_5px_rgba(0,0,0,0.9)]">
      성복교회는 대한예수교장로회 합동교단(총신대학교)에 소속되어 있습니다.
    </p>
  );
};

const DarkMask = () => {
  return <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />;
};
