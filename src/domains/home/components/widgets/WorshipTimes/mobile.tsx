import { DAY_SECTIONS, type WorshipServiceSummary } from '@/domains/home/data/worshipTimes';
import { Reveal } from '@/shared/components/features/Reveal';
import { cn } from '@/shared/lib/utils';

const ServiceRow = ({ service }: { service: WorshipServiceSummary }) => (
  <li className="border-b1-border grid grid-cols-[78px_1fr_auto] items-center gap-3 border-t px-5 py-3">
    <span className="b1-mono text-b1-accent text-caption font-bold tracking-[-0.01em]">
      {service.time}
    </span>
    <span className="text-b1-text text-label font-medium">
      {service.name}
      {service.note && (
        <span className="text-b1-muted text-caption ml-1.5 font-normal">{service.note}</span>
      )}
    </span>
    <span className="b1-mono text-b1-muted text-caption text-right tracking-[0.02em]">
      {service.place}
    </span>
  </li>
);

// 모바일 전용: 요일별(주일 · 새벽 · 수요일 · 금요일) 세로 리스트. 주일만 장년·다음세대 두 묶음. 데스크톱은 desktop.tsx(T3) 사용.
export const WorshipTimesMobile = () => (
  <div className="flex flex-col gap-4">
    {DAY_SECTIONS.map((section, si) => {
      const sunday = si === 0;
      return (
        <Reveal
          key={section.day}
          delay={si * 60}
          className="bg-b1-surface border-b1-border overflow-hidden rounded-2xl border"
        >
          <div className="flex items-center gap-2.5 px-5 py-3.5">
            <span
              className={cn('h-5 w-[4px] rounded-full', sunday ? 'bg-b1-sunday' : 'bg-b1-accent')}
            />
            <h3
              className={cn('text-title m-0 font-bold', sunday ? 'text-b1-sunday' : 'text-b1-text')}
            >
              {section.day}
            </h3>
          </div>

          {section.lanes.map(lane => (
            <div key={lane.label ?? section.day}>
              {lane.label && (
                <h4 className="b1-mono bg-b1-bg border-b1-border text-b1-sub text-caption m-0 border-t px-5 py-2 font-semibold tracking-[0.08em]">
                  {lane.label}
                </h4>
              )}
              <ul className="m-0 list-none p-0">
                {lane.services.map(service => (
                  <ServiceRow key={service.name} service={service} />
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
      );
    })}
  </div>
);
