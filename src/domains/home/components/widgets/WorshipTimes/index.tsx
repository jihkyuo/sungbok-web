import { WorshipTimesDesktop } from '@/domains/home/components/widgets/WorshipTimes/desktop';
import { WorshipTimesMobile } from '@/domains/home/components/widgets/WorshipTimes/mobile';
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
          action={
            <Link
              href="/worship-video"
              className="b1-mono b1-link text-b1-sub text-[12px] no-underline"
            >
              ALL SERVICES
              <ArrowRight size={12} strokeWidth={2} />
            </Link>
          }
        />
      </Reveal>

      {/* 모바일: 그룹 리스트 / 데스크톱: T3 정류장 타임라인 (별도 디자인) */}
      <div className="md:hidden">
        <WorshipTimesMobile />
      </div>
      <div className="hidden md:block">
        <WorshipTimesDesktop />
      </div>
    </Section>
  );
};
