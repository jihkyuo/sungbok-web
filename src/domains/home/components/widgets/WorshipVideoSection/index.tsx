'use client';

import { GridSection } from '@/domains/home/components/features/GridSection';
import { VideoBgCard } from '@/domains/home/components/features/VideoBgCard';
import { WorshipTextArea } from '@/domains/home/components/widgets/WorshipVideoSection/WorshipTextArea';

export const WorshipVideoSection = () => {
  return (
    <div className={'px-50 py-20'}>
      <GridSection className={'bg-red-100'}>
        <WorshipTextArea />
        <VideoBgCard
          videoUrl={'https://www.youtube.com/embed/HYruCseVKZo'}
          onClick={() => window.open('https://www.youtube.com/@allliveworship', '_blank')}
        />
      </GridSection>
    </div>
  );
};
