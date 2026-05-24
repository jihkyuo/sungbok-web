// 시안 C (BOLD) — 시간축 타임라인. 같은 시간대 예배를 한 노드로 묶어 한 주 리듬을 시각화.
// 11:30에 주일3부 + 다음세대 5개 부서가 수렴하는 구조가 한눈에 보임.
import { WORSHIP_GROUPS } from '@/domains/home/data/worshipTimes';
import { cn } from '@/shared/lib/utils';
import { periodLabel, stripPeriod, toMinutes } from './time';

interface RailItem {
  name: string;
  place: string;
  note?: string;
  gen: boolean;
}
interface RailRow {
  time: string;
  minutes: number;
  items: RailItem[];
}

const buildRows = (): RailRow[] => {
  const map = new Map<string, RailRow>();
  WORSHIP_GROUPS.forEach((group, gi) => {
    const gen = gi === 1;
    group.services.forEach((s) => {
      if (!map.has(s.time)) {
        map.set(s.time, { time: s.time, minutes: toMinutes(s.time), items: [] });
      }
      map.get(s.time)!.items.push({ name: s.name, place: s.place, note: s.note, gen });
    });
  });
  return [...map.values()].sort((a, b) => a.minutes - b.minutes);
};

export const TimeRail = () => {
  const rows = buildRows();

  return (
    <div className="bg-b1-surface border-b1-border rounded-2xl border px-8 py-7">
      <ul className="m-0 list-none p-0">
        {rows.map((row, i) => (
          <li key={row.time} className="flex gap-6 pb-6 last:pb-0">
            <div className="flex w-[92px] shrink-0 flex-col items-end pt-0.5">
              <span className="b1-mono text-b1-accent text-[26px] font-bold leading-none tracking-[-0.02em]">
                {stripPeriod(row.time)}
              </span>
              <span className="b1-mono text-b1-muted mt-1 text-[10px] tracking-[0.12em]">
                {periodLabel(row.time)}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="bg-b1-accent mt-1.5 size-2.5 shrink-0 rounded-full" />
              {i !== rows.length - 1 && <span className="bg-b1-border w-px flex-1" />}
            </div>

            <div className="flex flex-1 flex-wrap items-center gap-2 pt-0.5">
              {row.items.map((it) => (
                <span
                  key={it.name}
                  className={cn(
                    'inline-flex items-baseline gap-1.5 rounded-lg px-3 py-2 text-[14px] font-semibold',
                    it.gen
                      ? 'bg-b1-accent-soft text-b1-accent'
                      : 'bg-b1-bg border-b1-border text-b1-text border'
                  )}
                >
                  {it.name}
                  {it.note && <span className="text-[11px] opacity-60">{it.note}</span>}
                  <span className="text-b1-muted text-[11px] font-normal">{it.place}</span>
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <div className="border-b1-border mt-2 flex items-center gap-5 border-t pt-4">
        <span className="text-b1-sub flex items-center gap-1.5 text-[12px]">
          <span className="bg-b1-bg border-b1-border size-3 rounded border" />
          장년예배
        </span>
        <span className="text-b1-sub flex items-center gap-1.5 text-[12px]">
          <span className="bg-b1-accent-soft size-3 rounded" />
          다음세대예배
        </span>
      </div>
    </div>
  );
};
