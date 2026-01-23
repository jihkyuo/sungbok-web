import { Section } from '@/domains/home/components/features/Section';
import { SectionTitle } from '@/domains/home/components/features/SectionTitle';
import { WorshipTimeTableRecord } from '@/domains/home/components/widgets/WorshipTimeTable/model/data';
import { WorshipTimeCardGroup } from '@/domains/home/components/widgets/WorshipTimeTable/WorshipTimeTableMini/WorshipTimeCardGroup';

export const WorshipTimeTableMini = () => {
  return (
    <Section className={'flex flex-col gap-10'}>
      <SectionTitle title="예배시간 안내" subtitle="삶의 예배" />

      <div className={'flex flex-col gap-20'}>
        <WorshipTimeCardGroup title="장년 예배" items={WorshipTimeTableRecord.adultWorship} />
        <WorshipTimeCardGroup title="다음세대 예배" items={WorshipTimeTableRecord.nextGenerationMini} />
      </div>
    </Section>
  );
};
