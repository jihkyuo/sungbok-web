import { Section } from '@/domains/home/components/features/Section';
import { SectionTitle } from '@/domains/home/components/features/SectionTitle';
import { WorshipSection } from '@/domains/home/components/widgets/WorshipTimeTable/WorshipTimeTableWide/WorshipSection';

import type { PropsWithChildren } from 'react';

export const WorshipTimeTableWide = () => {
  return (
    <Section className={'flex flex-col gap-10 py-20'}>
      <SectionTitle title="예배시간 안내" subtitle="삶의 예배" />
      <Card>
        <WorshipSection />
      </Card>
    </Section>
  );
};

const Card = ({ children }: PropsWithChildren) => {
  return (
    <div className="mx-10 flex-col rounded-[45px] border-1 bg-gray-50 px-20 py-30 shadow-lg">
      {children}
    </div>
  );
};
