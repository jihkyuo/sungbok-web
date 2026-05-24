// 시안 J5 — 연속형 가로 레일. I5 결을 살려 하나의 연속 축선 + 점으로 주일 하루 흐름을 표현.
// 같은 시각 예배는 점 아래로 묶임(11:30 수렴). 주중·새벽은 하단 스트립. 빨강은 '주일'만.
import { cn } from '@/shared/lib/utils';
import { GEN_SERVICES, SUNDAY_PARTS, WEEKDAY_SECTIONS } from './groups';
import { InlineTime, PosterTime, SundayHeader } from './Pieces';
import { toMinutes } from './time';

const SUNDAY_ALL = [...SUNDAY_PARTS, ...GEN_SERVICES];
const TIMES = [...new Set(SUNDAY_ALL.map((s) => s.time))].sort((a, b) => toMinutes(a) - toMinutes(b));
const cols = { gridTemplateColumns: `repeat(${TIMES.length}, minmax(0, 1fr))` };

export const HorizontalRail = () => (
  <div className="flex flex-col gap-6">
    <div className="bg-b1-surface border-b1-border rounded-2xl border px-8 py-7">
      <SundayHeader />

      {/* 시간 라벨 */}
      <div className="mt-7 grid" style={cols}>
        {TIMES.map((t) => (
          <div key={t} className="flex justify-center">
            <PosterTime time={t} />
          </div>
        ))}
      </div>

      {/* 연속 레일 + 점 */}
      <div className="relative my-4 h-3">
        <div className="bg-b1-accent absolute inset-x-3 top-1/2 h-0.5 -translate-y-1/2 rounded-full" />
        <div className="relative grid h-full" style={cols}>
          {TIMES.map((t) => (
            <div key={t} className="flex items-center justify-center">
              <span className="bg-b1-accent ring-b1-surface size-3 rounded-full ring-4" />
            </div>
          ))}
        </div>
      </div>

      {/* 카드 */}
      <div className="grid items-start gap-x-3" style={cols}>
        {TIMES.map((t) => (
          <div key={t} className="flex flex-col gap-2">
            {SUNDAY_ALL.filter((s) => s.time === t).map((s) => {
              const gen = !s.name.startsWith('주일');
              return (
                <div
                  key={s.name}
                  className={cn(
                    'rounded-lg px-3 py-2.5 text-center',
                    gen ? 'bg-b1-accent-soft' : 'bg-b1-bg border-b1-border border'
                  )}
                >
                  <div className={cn('text-[14px] font-semibold', gen ? 'text-b1-accent' : 'text-b1-text')}>
                    {s.name}
                  </div>
                  <div className="text-b1-sub text-[12px]">{s.place}</div>
                </div>
              );
            })}
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
