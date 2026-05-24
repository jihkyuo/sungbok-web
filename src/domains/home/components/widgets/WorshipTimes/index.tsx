import { WORSHIP_GROUPS } from '@/domains/home/data/worshipTimes';
import { Reveal } from '@/shared/components/features/Reveal';
import { cn } from '@/shared/lib/utils';
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

      <div className="bg-b1-surface border-b1-border overflow-hidden rounded-2xl border">
        {WORSHIP_GROUPS.map((group, gi) => (
          <div key={group.label} className={cn(gi !== 0 && 'border-b1-border border-t')}>
            <Reveal className="bg-b1-bg border-b1-border border-b px-5 py-2.5">
              <h3 className="b1-mono text-b1-sub m-0 text-[11px] font-semibold tracking-[0.08em]">
                {group.label}
              </h3>
            </Reveal>

            <ul className="m-0 list-none p-0">
              {group.services.map((service, i) => (
                <Reveal
                  as="li"
                  key={service.name}
                  delay={i * 35}
                  className={cn(
                    'grid grid-cols-[78px_1fr_auto] items-center gap-3 px-5 py-3 md:grid-cols-[96px_1fr_auto] md:py-3.5',
                    i !== group.services.length - 1 && 'border-b1-border border-b'
                  )}
                >
                  <span className="b1-mono text-b1-accent text-[13px] font-bold tracking-[-0.01em] md:text-[14px]">
                    {service.time}
                  </span>
                  <span className="text-b1-text text-[14px] font-medium">
                    {service.name}
                    {service.note && (
                      <span className="text-b1-muted ml-1.5 text-[11px] font-normal">
                        {service.note}
                      </span>
                    )}
                  </span>
                  <span className="b1-mono text-b1-muted text-right text-[11px] tracking-[0.02em]">
                    {service.place}
                  </span>
                </Reveal>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};
