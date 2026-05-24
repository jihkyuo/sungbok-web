import { WorshipTimesDesktop } from '@/domains/home/components/widgets/WorshipTimes/desktop';
import { WorshipTimesMobile } from '@/domains/home/components/widgets/WorshipTimes/mobile';
import { Reveal } from '@/shared/components/features/Reveal';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const WorshipTimes = () => {
  return (
    <section id="worship" className="px-5 pt-6 pb-14 md:px-10 md:pt-8 md:pb-24">
      <Reveal>
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-b1-text m-0 text-[24px] font-bold tracking-[-0.02em] md:text-[30px]">
            이번 주 예배
          </h2>
          <Link
            href="/worship-video"
            className="b1-mono b1-link text-b1-sub text-[12px] no-underline"
          >
            ALL SERVICES
            <ArrowRight size={12} strokeWidth={2} />
          </Link>
        </div>
      </Reveal>

      {/* 모바일: 그룹 리스트 / 데스크톱: T3 정류장 타임라인 (별도 디자인) */}
      <div className="md:hidden">
        <WorshipTimesMobile />
      </div>
      <div className="hidden md:block">
        <WorshipTimesDesktop />
      </div>
    </section>
  );
};
