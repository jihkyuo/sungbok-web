import { WORSHIP_GROUPS } from '@/domains/home/data/worshipTimes';
import { Reveal } from '@/shared/components/features/Reveal';
import { cn } from '@/shared/lib/utils';

// 모바일 전용: 2그룹(장년·다음세대) 세로 리스트. 데스크톱은 desktop.tsx(T3) 사용.
export const WorshipTimesMobile = () => (
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
                'grid grid-cols-[78px_1fr_auto] items-center gap-3 px-5 py-3',
                i !== group.services.length - 1 && 'border-b1-border border-b'
              )}
            >
              <span className="b1-mono text-b1-accent text-[13px] font-bold tracking-[-0.01em]">
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
);
