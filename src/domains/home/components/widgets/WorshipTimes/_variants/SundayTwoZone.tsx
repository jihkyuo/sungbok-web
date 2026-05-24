// 시안 G3 — E4 형태(2존) 유지하되 빨강 배경 제거. 좌:주일 1~5부(틴트 존),
// 우:다음세대. 두 존 모두 흰 카드로 동등하게 둬 격리감 줄임. 빨강은 '주일' 글자만.
import { cn } from '@/shared/lib/utils';
import { GEN_SERVICES, SUNDAY_PARTS } from './groups';
import { InlineTime, PosterTime, SundayHeader, WeekdayStrip } from './Pieces';

export const SundayTwoZone = () => (
  <div className="flex flex-col gap-6">
    <div className="grid grid-cols-[1fr_1.35fr] gap-6">
      {/* 주일 1~5부 존 */}
      <div className="bg-b1-surface border-b1-border rounded-2xl border px-7 py-7">
        <SundayHeader />
        <div className="bg-b1-bg border-b1-border mt-6 overflow-hidden rounded-xl border">
          {SUNDAY_PARTS.map((s, i) => (
            <div
              key={s.name}
              className={cn(
                'flex items-center justify-between px-5 py-3.5',
                i !== 0 && 'border-b1-border border-t'
              )}
            >
              <span className="text-b1-text text-[17px] font-semibold">{s.name}</span>
              <PosterTime time={s.time} />
            </div>
          ))}
        </div>
      </div>

      {/* 다음세대 존 */}
      <div className="bg-b1-surface border-b1-border rounded-2xl border px-7 py-7">
        <h3 className="text-b1-text m-0 text-[18px] font-bold">
          다음세대예배 <span className="text-b1-sub text-[13px] font-normal">· 주일</span>
        </h3>
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5">
          {GEN_SERVICES.map((s) => (
            <div key={s.name} className="flex items-baseline gap-3">
              <InlineTime time={s.time} className="w-[88px] shrink-0 text-[18px]" />
              <div className="min-w-0">
                <div className="text-b1-text text-[16px] font-semibold">{s.name}</div>
                <div className="text-b1-sub text-[14px]">{s.place}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <WeekdayStrip />
  </div>
);
