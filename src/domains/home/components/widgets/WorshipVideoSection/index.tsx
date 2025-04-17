import { GridSection } from '@/domains/home/components/features/GridSection';
import { VideoBgCard } from '@/domains/home/components/features/VideoBgCard';
import { WorshipTextArea } from '@/domains/home/components/widgets/WorshipVideoSection/WorshipTextArea';

export const WorshipVideoSection = () => {
  return (
    <div className={'px-10 py-20'}>
      <GridSection>
        <WorshipTextArea />
        <VideoBgCard videoUrl={'https://www.youtube.com/embed/HYruCseVKZo'} />
      </GridSection>
    </div>
  );
};
