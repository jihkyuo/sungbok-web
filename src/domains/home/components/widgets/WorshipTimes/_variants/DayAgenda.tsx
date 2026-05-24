// 시안 E (다른 결) — 요일별 아젠다. 시간축이 아니라 '요일'을 1차 기준으로 묶는다.
// 좌측 큰 요일 라벨 + 우측 예배 그리드. 주일 섹션이 가장 큼.
import { cn } from '@/shared/lib/utils';
import { WEEK_SERVICES, type WeekService } from './weekData';

const byNames = (...names: string[]) => WEEK_SERVICES.filter((s) => names.includes(s.name));

const SECTIONS: { day: string; sub: string; services: WeekService[] }[] = [
  { day: '주일', sub: 'SUNDAY', services: WEEK_SERVICES.filter((s) => s.days.includes('일')) },
  { day: '매일 새벽', sub: '월–금', services: byNames('새벽예배') },
  { day: '수요일', sub: 'WEDNESDAY', services: byNames('수요예배', '청년수요예배') },
  { day: '금요일', sub: 'FRIDAY', services: byNames('금요생수의강') },
];

const Item = ({ svc }: { svc: WeekService }) => (
  <div className="flex items-baseline gap-3">
    <span className="b1-mono text-b1-accent w-[78px] shrink-0 text-[16px] font-bold tracking-[-0.01em]">
      {svc.time}
    </span>
    <div className="min-w-0">
      <div className="text-b1-text text-[14px] font-semibold">
        {svc.name}
        {svc.note && <span className="text-b1-muted ml-1 text-[10px] font-normal">{svc.note}</span>}
      </div>
      <div className="text-b1-muted text-[12px]">{svc.place}</div>
    </div>
  </div>
);

export const DayAgenda = () => (
  <div className="bg-b1-border border-b1-border flex flex-col gap-px overflow-hidden rounded-2xl border">
    {SECTIONS.map((sec) => (
      <div key={sec.day} className="bg-b1-surface grid grid-cols-[200px_1fr] gap-8 px-8 py-7">
        <div>
          <h3 className="text-b1-text m-0 text-[22px] font-bold tracking-[-0.01em]">{sec.day}</h3>
          <span className="b1-mono text-b1-muted text-[11px] tracking-[0.12em]">{sec.sub}</span>
        </div>
        <div
          className={cn(
            'grid gap-x-8 gap-y-4',
            sec.services.length > 4 ? 'grid-cols-3' : 'grid-cols-2'
          )}
        >
          {sec.services.map((s) => (
            <Item key={s.name} svc={s} />
          ))}
        </div>
      </div>
    ))}
  </div>
);
