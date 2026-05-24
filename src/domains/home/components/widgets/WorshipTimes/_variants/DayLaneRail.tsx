// 시안 C3 (C + 요일축, 에어리) — C의 큰 시간 레일 느낌은 유지하되 보더 없이 여백 위주.
// 시간(세로 레일) × 요일(가로 레인), 큰 카드, 넉넉한 행 간격. 새벽은 월~금 스팬.
import { cn } from '@/shared/lib/utils';
import { Fragment } from 'react';
import { periodLabel, stripPeriod } from './time';
import { DAYS, rowServices, servicesAt, TIME_ROWS, type WeekService } from './weekData';

const Chip = ({ svc }: { svc: WeekService }) => (
  <div
    className={cn(
      'rounded-xl px-3.5 py-3',
      svc.gen ? 'bg-b1-accent-soft' : 'bg-b1-bg border-b1-border border'
    )}
  >
    <div className={cn('text-[15px] font-semibold', svc.gen ? 'text-b1-accent' : 'text-b1-text')}>
      {svc.name}
      {svc.note && <span className="text-b1-muted ml-1 text-[10px] font-normal">{svc.note}</span>}
    </div>
    <div className="text-b1-muted mt-0.5 text-[12px]">{svc.place}</div>
  </div>
);

const COLS = 'grid-cols-[96px_repeat(7,minmax(0,1fr))]';

export const DayLaneRail = () => (
  <div className="bg-b1-surface border-b1-border rounded-2xl border px-7 py-6">
    <div className={cn('grid gap-x-3 pb-4', COLS)}>
      <div />
      {DAYS.map((d) => (
        <div
          key={d}
          className={cn(
            'text-center text-[13px] font-bold',
            d === '일' ? 'text-b1-accent' : 'text-b1-muted'
          )}
        >
          {d}
        </div>
      ))}
    </div>

    {TIME_ROWS.map((time, i) => {
      const spanning = rowServices(time).find((s) => s.days.length > 1);
      return (
        <div
          key={time}
          className={cn(
            'grid items-center gap-x-3 gap-y-2 py-5',
            COLS,
            i !== 0 && 'border-b1-border border-t'
          )}
        >
          <div className="flex flex-col items-end">
            <span className="b1-mono text-b1-accent text-[26px] font-bold leading-none tracking-[-0.02em]">
              {stripPeriod(time)}
            </span>
            <span className="b1-mono text-b1-muted mt-1 text-[10px] tracking-[0.12em]">
              {periodLabel(time)}
            </span>
          </div>

          {spanning ? (
            <Fragment>
              <div />
              <div className="col-span-5">
                <Chip svc={spanning} />
              </div>
              <div />
            </Fragment>
          ) : (
            DAYS.map((d) => (
              <div key={d} className="flex flex-col gap-2">
                {servicesAt(time, d).map((s) => (
                  <Chip key={s.name} svc={s} />
                ))}
              </div>
            ))
          )}
        </div>
      );
    })}

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
