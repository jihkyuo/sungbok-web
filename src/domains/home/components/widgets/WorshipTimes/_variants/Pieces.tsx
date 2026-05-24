// 시안 비교용 공용 조각 — 빨강은 '주일' 글자에만, 시간은 오전/오후 통일 표기.
import { cn } from '@/shared/lib/utils';
import { WEEKDAY_SECTIONS } from './groups';
import { periodKo, stripPeriod } from './time';

// 포스터형 시간: 오전/오후(작게) + 큰 숫자
export const PosterTime = ({ time, className }: { time: string; className?: string }) => (
  <span className={cn('flex items-baseline gap-1.5', className)}>
    <span className="b1-mono text-b1-sub text-[14px] font-semibold">{periodKo(time)}</span>
    <span className="b1-mono text-b1-text text-[34px] font-bold leading-none tracking-[-0.02em]">
      {stripPeriod(time)}
    </span>
  </span>
);

// 인라인 시간: 오전/오후 + 숫자 한 줄
export const InlineTime = ({ time, className }: { time: string; className?: string }) => (
  <span className={cn('b1-mono text-b1-accent font-bold whitespace-nowrap', className)}>{time}</span>
);

// 주일 헤더: '주일'만 빨강 포인트
export const SundayHeader = ({ place = '예루살렘성전 3F' }: { place?: string }) => (
  <div className="flex items-baseline gap-2.5">
    <span className="size-2.5 self-center rounded-full bg-[#dc2626]" />
    <h3 className="m-0 text-[26px] font-bold tracking-[-0.01em]">
      <span className="text-[#dc2626]">주일</span>
      <span className="text-b1-text">예배</span>
    </h3>
    <span className="text-b1-sub text-[14px]">· {place}</span>
  </div>
);

// 주중·새벽 스트립 (영어 표기 없음)
export const WeekdayStrip = () => (
  <div className="bg-b1-border border-b1-border grid grid-cols-3 gap-px overflow-hidden rounded-2xl border">
    {WEEKDAY_SECTIONS.map((sec) => (
      <div key={sec.day} className="bg-b1-surface px-7 py-6">
        <h4 className="text-b1-text m-0 text-[19px] font-bold">{sec.day}</h4>
        <ul className="mt-4 flex list-none flex-col gap-3.5 p-0">
          {sec.services.map((s) => (
            <li key={s.name} className="flex items-baseline gap-3">
              <InlineTime time={s.time} className="text-[17px]" />
              <div>
                <div className="text-b1-text text-[15px] font-semibold">
                  {s.name}
                  {s.note && (
                    <span className="text-b1-muted ml-1 text-[11px] font-normal">{s.note}</span>
                  )}
                </div>
                <div className="text-b1-sub text-[13px]">{s.place}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);
