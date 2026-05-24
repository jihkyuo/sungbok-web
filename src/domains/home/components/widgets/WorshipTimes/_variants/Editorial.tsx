// 시안 D (BOLD) — 에디토리얼 헤드라인. 주일 1~5부를 대형 타이포 5열로 앵커,
// 주중·새벽 / 다음세대는 하단 2패널로 보조. 주일 전체가 한 장소(예루살렘 3F)라 장소를 헤더로 승격.
import { WORSHIP_GROUPS, type WorshipServiceSummary } from '@/domains/home/data/worshipTimes';
import { cn } from '@/shared/lib/utils';
import { periodLabel, stripPeriod } from './time';

const Panel = ({ label, services }: { label: string; services: WorshipServiceSummary[] }) => (
  <div className="bg-b1-surface border-b1-border overflow-hidden rounded-2xl border">
    <div className="bg-b1-bg border-b1-border border-b px-6 py-3">
      <h4 className="b1-mono text-b1-sub m-0 text-[12px] font-semibold tracking-[0.08em]">
        {label}
      </h4>
    </div>
    <ul className="m-0 list-none p-0">
      {services.map((s, i) => (
        <li
          key={s.name}
          className={cn(
            'flex items-baseline gap-4 px-6 py-2.5',
            i !== services.length - 1 && 'border-b1-border border-b'
          )}
        >
          <span className="b1-mono text-b1-accent w-[88px] shrink-0 text-[15px] font-bold">
            {s.time}
          </span>
          <span className="text-b1-text text-[14px] font-medium">
            {s.name}
            {s.note && <span className="text-b1-muted ml-1.5 text-[11px] font-normal">{s.note}</span>}
          </span>
          <span className="text-b1-muted text-[12px]">· {s.place}</span>
        </li>
      ))}
    </ul>
  </div>
);

export const Editorial = () => {
  const adult = WORSHIP_GROUPS[0].services;
  const sunday = adult.slice(0, 5);
  const weekday = adult.slice(5);
  const gen = WORSHIP_GROUPS[1].services;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-b1-surface border-b1-border rounded-2xl border px-10 py-8">
        <div className="mb-6 flex items-baseline gap-3">
          <h3 className="text-b1-text m-0 text-[20px] font-bold">주일예배</h3>
          <span className="b1-mono text-b1-muted text-[12px] tracking-[0.08em]">
            SUNDAY · 예루살렘성전 3F
          </span>
        </div>
        <div className="grid grid-cols-5">
          {sunday.map((s, i) => (
            <div
              key={s.name}
              className={cn('flex flex-col gap-1.5 px-5', i !== 0 && 'border-b1-border border-l')}
            >
              <span className="text-b1-sub text-[13px] font-semibold">{s.name}</span>
              <span className="b1-mono text-b1-text text-[32px] font-bold leading-none tracking-[-0.02em]">
                {stripPeriod(s.time)}
              </span>
              <span className="b1-mono text-b1-muted text-[11px] tracking-[0.08em]">
                {periodLabel(s.time)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Panel label="주중·새벽예배" services={weekday} />
        <Panel label="다음세대예배" services={gen} />
      </div>
    </div>
  );
};
