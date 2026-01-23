'use client';

import { Section } from '@/domains/home/components/features/Section';
import { SectionTitle } from '@/domains/home/components/features/SectionTitle';
import { GridSection } from '@/domains/home/components/widgets/WorshipVideoSection/GridSection';
import { VideoBgCard } from '@/shared/components/features/BgOverlayCard/VideoBgCard';
import { useScrollFadeIn } from '@/shared/lib/hooks/useScrollFadeIn';
import { cn } from '@/shared/lib/utils';

export const WorshipVideoSection = () => {
  const { ref, isVisible } = useScrollFadeIn({ threshold: 0.1, rootMargin: '-50px' });

  return (
    <Section
      ref={ref}
      className={cn(
        'py-20 transition-all duration-1000',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      )}
    >
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
