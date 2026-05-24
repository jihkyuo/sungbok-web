// 시안 I5 — 가로 타임라인. 주일 하루를 왼→오 시간 흐름으로(7:00 → 3:30), 각 시각 아래 예배 카드.
// 11:30 수렴이 가로축에서 보임. 주중·새벽은 하단 별도 스트립. 빨강은 '주일'만.
import { cn } from '@/shared/lib/utils';
import { GEN_SERVICES, SUNDAY_PARTS, WEEKDAY_SECTIONS } from './groups';
import { InlineTime, SundayHeader } from './Pieces';
import { periodKo, stripPeriod, toMinutes } from './time';

const SUNDAY_ALL = [...SUNDAY_PARTS, ...GEN_SERVICES];
const SUNDAY_TIMES = [...new Set(SUNDAY_ALL.map((s) => s.time))].sort(
  (a, b) => toMinutes(a) - toMinutes(b)
);

export const HorizontalTimeline = () => (
  <div className="flex flex-col gap-6">
    <div className="bg-b1-surface border-b1-border rounded-2xl border px-8 py-7">
      <SundayHeader />
      <div className="mt-6 grid" style={{ gridTemplateColumns: `repeat(${SUNDAY_TIMES.length}, minmax(0, 1fr))` }}>
        {SUNDAY_TIMES.map((t) => (
          <div key={t} className="px-2">
            <div className="flex items-baseline gap-1.5">
              <span className="b1-mono text-b1-sub text-[13px] font-semibold">{periodKo(t)}</span>
              <span className="b1-mono text-b1-text text-[26px] font-bold leading-none tracking-[-0.02em]">
                {stripPeriod(t)}
              </span>
            </div>
            <div className="bg-b1-accent mt-3 mb-3 h-[3px] w-full rounded-full" />
            <div className="flex flex-col gap-2">
              {SUNDAY_ALL.filter((s) => s.time === t).map((s) => {
                const gen = !s.name.startsWith('주일');
                return (
                  <div
                    key={s.name}
                    className={cn(
                      'rounded-lg px-3 py-2.5',
                      gen ? 'bg-b1-accent-soft' : 'bg-b1-bg border-b1-border border'
                    )}
                  >
                    <div className={cn('text-[15px] font-semibold', gen ? 'text-b1-accent' : 'text-b1-text')}>
                      {s.name}
                    </div>
                    <div className="text-b1-sub text-[12px]">{s.place}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* 주중·새벽 스트립 */}
    <div className="bg-b1-border border-b1-border grid grid-cols-3 gap-px overflow-hidden rounded-2xl border">
      {WEEKDAY_SECTIONS.map((sec) => (
        <div key={sec.day} className="bg-b1-surface px-7 py-6">
          <h4 className="text-b1-text m-0 mb-4 text-[18px] font-bold">{sec.day}</h4>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {sec.services.map((s) => (
              <li key={s.name} className="flex items-baseline gap-3">
                <InlineTime time={s.time} className="text-[17px]" />
                <div>
                  <div className="text-b1-text text-[15px] font-semibold">
                    {s.name}
                    {s.note && <span className="text-b1-muted ml-1 text-[11px] font-normal">{s.note}</span>}
                  </div>
                  <div className="text-b1-sub text-[13px]">{s.place}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);
