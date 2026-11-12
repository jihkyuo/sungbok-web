import { WorshipTimesTable } from '@/domains/home/components/widgets/WorshipTimes/WorshipTimesTable';
import { Section } from '@/domains/home/components/features/Section';
import { SectionTitle } from '@/domains/home/components/features/SectionTitle';
import { Reveal } from '@/shared/components/features/Reveal';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const WorshipTimes = () => {
  return (
    <Section id="worship">
      <Reveal>
        <SectionTitle
          title="이번 주 예배"
          eyebrow="● WORSHIP"
          action={
            <Link
              href="/location#worship-times"
              className="b1-link text-b1-sub text-body font-medium no-underline"
            >
              찾아오시는 길
              <ArrowRight size={15} strokeWidth={2} />
            </Link>
          }
        />
      </Reveal>

      <WorshipTimesTable />
    </Section>
  );
};
