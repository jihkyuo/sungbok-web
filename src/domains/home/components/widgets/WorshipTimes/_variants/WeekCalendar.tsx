// 시안 K1 — 주간 캘린더(일~토). '일'=주일이라 일 헤더에 빨강. 새벽은 월~금 스팬.
// C2 정제판: 큰 셀·깔끔한 빈칸·장년/다음세대 색 구분.
import { cn } from '@/shared/lib/utils';
import { Fragment } from 'react';
import { periodKo, stripPeriod } from './time';
import { DAYS, rowServices, servicesAt, TIME_ROWS, type WeekService } from './weekData';

const Cell = ({ svc }: { svc: WeekService }) => (
  <div className={cn('rounded-lg px-3 py-2.5', svc.gen ? 'bg-b1-accent-soft' : 'bg-b1-bg border-b1-border border')}>
    <div className={cn('text-[14px] font-semibold leading-tight', svc.gen ? 'text-b1-accent' : 'text-b1-text')}>
      {svc.name}
      {svc.note && <span className="text-b1-muted ml-1 text-[10px] font-normal">{svc.note}</span>}
    </div>
    <div className="text-b1-sub mt-0.5 text-[12px]">{svc.place}</div>
  </div>
);

export const WeekCalendar = () => (
  <div className="bg-b1-surface border-b1-border overflow-hidden rounded-2xl border">
    <div className="grid grid-cols-[76px_repeat(7,minmax(0,1fr))]">
      <div className="bg-b1-bg border-b1-border border-r border-b" />
      {DAYS.map((d) => (
        <div
          key={d}
          className={cn(
            'bg-b1-bg border-b1-border border-b py-3.5 text-center text-[15px] font-bold',
            d === '일' ? 'text-[#dc2626]' : 'text-b1-sub',
            d !== '토' && 'border-r'
          )}
        >
          {d}
        </div>
      ))}

      {TIME_ROWS.map((time) => {
        const spanning = rowServices(time).find((s) => s.days.length > 1);
        return (
          <Fragment key={time}>
            <div className="border-b1-border flex flex-col items-end justify-center border-t border-r px-2 py-4">
              <span className="b1-mono text-b1-sub text-[11px] font-semibold">{periodKo(time)}</span>
              <span className="b1-mono text-b1-text text-[17px] font-bold leading-tight">{stripPeriod(time)}</span>
            </div>
            {spanning ? (
              <>
                <div className="border-b1-border border-t border-r" />
                <div className="border-b1-border col-span-5 border-t border-r p-2">
                  <Cell svc={spanning} />
                </div>
                <div className="border-b1-border border-t" />
              </>
            ) : (
              DAYS.map((d, di) => (
                <div
                  key={d}
                  className={cn('border-b1-border min-h-[72px] border-t p-2', di !== DAYS.length - 1 && 'border-r')}
                >
                  <div className="flex flex-col gap-2">
                    {servicesAt(time, d).map((s) => (
                      <Cell key={s.name} svc={s} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </Fragment>
        );
      })}
    </div>
  </div>
);
