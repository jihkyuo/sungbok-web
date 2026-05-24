// 시안 H4 — 시간축 타임라인 정제판(처음 좋아했던 결). 시간이 척추, 같은 시간대 예배가 한 노드.
// 11:30 수렴이 한눈에. 큰 시간·진한 장소·오전/오후 명시. 비주일 예배엔 요일 칩.
import { rowServices, TIME_ROWS, type WeekService } from './weekData';
import { periodKo, stripPeriod } from './time';
import { cn } from '@/shared/lib/utils';

const dayTag = (s: WeekService) => {
  if (s.days.length > 1) return s.note ?? '월~금';
  if (s.days[0] !== '일') return `${s.days[0]}요일`;
  return null;
};

export const TimelineRefined = () => (
  <div className="bg-b1-surface border-b1-border rounded-2xl border px-9 py-8">
    <ul className="m-0 list-none p-0">
      {TIME_ROWS.map((time, i) => (
        <li key={time} className="flex gap-7 pb-7 last:pb-0">
          <div className="flex w-[104px] shrink-0 flex-col items-end pt-1">
            <span className="b1-mono text-b1-sub text-[14px] font-semibold">{periodKo(time)}</span>
            <span className="b1-mono text-b1-text text-[30px] font-bold leading-none tracking-[-0.02em]">
              {stripPeriod(time)}
            </span>
          </div>

          <div className="flex flex-col items-center pt-2">
            <span className="bg-b1-accent size-2.5 shrink-0 rounded-full" />
            {i !== TIME_ROWS.length - 1 && <span className="bg-b1-border w-px flex-1" />}
          </div>

          <div className="flex flex-1 flex-wrap gap-2.5 pt-0.5">
            {rowServices(time).map((it) => {
              const tag = dayTag(it);
              return (
                <div
                  key={it.name}
                  className={cn(
                    'rounded-xl px-4 py-3',
                    it.gen ? 'bg-b1-accent-soft' : 'bg-b1-bg border-b1-border border'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn('text-[16px] font-semibold', it.gen ? 'text-b1-accent' : 'text-b1-text')}
                    >
                      {it.name}
                    </span>
                    {tag && (
                      <span className="bg-b1-surface text-b1-sub border-b1-border rounded border px-1.5 py-0.5 text-[11px] font-semibold">
                        {tag}
                      </span>
                    )}
                  </div>
                  <div className="text-b1-sub mt-0.5 text-[13px]">{it.place}</div>
                </div>
              );
            })}
          </div>
        </li>
      ))}
    </ul>
  </div>
);
