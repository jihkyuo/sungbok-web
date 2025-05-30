'use client';

import { Section } from '@/domains/home/components/features/Section';
import { SectionTitle } from '@/domains/home/components/features/SectionTitle';
import { GridSection } from '@/domains/home/components/widgets/WorshipVideoSection/GridSection';
import { VideoBgCard } from '@/shared/components/features/BgOverlayCard/VideoBgCard';

export const WorshipVideoSection = () => {
  return (
    <Section className={'py-20'}>
      <SectionTitle title="예배를 통해" subtitle="말씀 · 기도 · 찬양 · 감사" />
      <GridSection className={'xl:grid-cols-5'}>
        <Subtitle />
        <VideoBgCard
          className={'col-span-4 xl:mt-20'}
          videoUrl={'https://www.youtube.com/embed/HYruCseVKZo'}
          onClick={() => window.open('https://www.youtube.com/@allliveworship', '_blank')}
        />
      </GridSection>
    </Section>
  );
};

const Subtitle = () => {
  return (
    <p className="mt-8 text-2xl leading-10 font-bold whitespace-pre-wrap">
      {`건강하게
세워져가고
있습니다.`}
    </p>
  );
};
