'use client';

import { GridSection } from '@/domains/home/components/features/GridSection';
import { VideoBgCard } from '@/domains/home/components/features/VideoBgCard';

export const WorshipVideoSection = () => {
  return (
    <div className={'mx-auto max-w-[1400px] px-10 py-20 md:px-40'}>
      <Title />
      <GridSection className={'xl:grid-cols-5'}>
        <Subtitle />
        <VideoBgCard
          className={'col-span-4 xl:mt-20'}
          videoUrl={'https://www.youtube.com/embed/HYruCseVKZo'}
          onClick={() => window.open('https://www.youtube.com/@allliveworship', '_blank')}
        />
      </GridSection>
    </div>
  );
};

const Title = () => {
  return (
    <div className={'flex flex-col gap-3 font-bold tracking-wide'}>
      <h3 className={'text-2xl text-blue-600'}>말씀 · 기도 · 찬양 · 감사</h3>
      <h2 className={'text-4xl'}>예배를 통해</h2>
    </div>
  );
};

const Subtitle = () => {
  return (
    <p className="mt-8 text-2xl font-bold leading-10 whitespace-pre-wrap">
      {`건강하게
세워져가고
있습니다.`}
    </p>
  );
};
