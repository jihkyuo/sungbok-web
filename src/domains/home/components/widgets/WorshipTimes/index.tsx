import { HERO_WORSHIP_TIMES } from '@/domains/home/data/worshipTimes';
import { Reveal } from '@/shared/components/features/Reveal';
import { cn } from '@/shared/lib/utils';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const periodLabel = (time: string) =>
  time.includes('오전') ? 'AM' : time.includes('오후') ? 'PM' : '';

const stripPeriod = (time: string) =>
  time.replace('오전 ', '').replace('오후 ', '').replace('저녁 ', '');

export const WorshipTimes = () => {
  const services = HERO_WORSHIP_TIMES;
  const last = services.length - 1;

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

      <div className="bg-b1-surface border-b1-border grid grid-cols-2 overflow-hidden rounded-2xl border md:grid-cols-4">
        {services.map((service, i) => {
          const isMobileBottomRow = i >= services.length - 2;
          const isMobileLeftCol = i % 2 === 0;

          return (
            <Reveal
              key={service.name}
              delay={i * 60}
              className={cn(
                'p-5 md:px-[18px] md:py-7',
                // mobile dividers
                isMobileLeftCol && 'border-b1-border border-r md:border-r-0',
                !isMobileBottomRow && 'border-b1-border border-b md:border-b-0',
                // desktop dividers (vertical between cells)
                i !== last && 'md:border-b1-border md:border-r'
              )}
            >
              <div className="b1-mono text-b1-muted mb-2.5 text-[10px] tracking-[0.08em]">
                {String(i + 1).padStart(2, '0')} · {service.place}
              </div>
              <div className="text-b1-sub mb-1.5 text-[14px] font-medium">{service.name}</div>
              <div className="b1-mono text-b1-accent text-[22px] font-bold tracking-[-0.01em]">
                {stripPeriod(service.time)}
              </div>
              <div className="b1-mono text-b1-muted text-[10px] tracking-[0.08em]">
                {periodLabel(service.time)}
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
};
