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
          eyebrow="● WORSHIP"
          action={
            <Link
              href="/worship/guide"
              className="b1-link text-b1-sub text-body font-medium no-underline"
            >
              예배 안내
              <ArrowRight size={15} strokeWidth={2} />
            </Link>
          }
        />
      </Reveal>

      {/* 휴대폰·태블릿: 그룹 리스트 / PC(lg 이상): T3 정류장 타임라인 — 타임라인은 1024 미만에서 열이 좁아 줄이 깨진다 */}
      <div className="lg:hidden">
        <WorshipTimesMobile />
      </div>
      <div className="hidden lg:block">
        <WorshipTimesDesktop />
      </div>
    </Section>
  );
};
