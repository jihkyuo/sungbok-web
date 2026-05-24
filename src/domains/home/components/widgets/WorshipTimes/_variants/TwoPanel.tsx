// 시안 K4 — 2-업 패널. 주일 장년(1~5부) | 다음세대를 동등한 두 큰 패널로, 주중은 하단 바.
// 두 세대를 대등하게 둬 격리감 제거. 빨강은 '주일'만.
import { cn } from '@/shared/lib/utils';
import { GEN_SERVICES, SUNDAY_PARTS, WEEKDAY_SERVICES } from './groups';
import { InlineTime } from './Pieces';
import type { WorshipServiceSummary } from '@/domains/home/data/worshipTimes';

const Row = ({ s }: { s: WorshipServiceSummary }) => (
  <li className="border-b1-border flex items-baseline gap-4 py-3 [&:not(:last-child)]:border-b">
    <InlineTime time={s.time} className="w-[96px] shrink-0 text-[18px]" />
    <div className="min-w-0">
      <div className="text-b1-text text-[16px] font-semibold">
        {s.name}
        {s.note && <span className="text-b1-muted ml-1 text-[11px] font-normal">{s.note}</span>}
      </div>
      <div className="text-b1-sub text-[14px]">{s.place}</div>
    </div>
  </li>
);

export const TwoPanel = () => (
  <div className="flex flex-col gap-5">
    <div className="grid grid-cols-2 gap-5">
      {/* 주일 장년 */}
      <div className="bg-b1-surface border-b1-border rounded-2xl border px-8 py-7">
        <div className="mb-5 flex items-baseline gap-2.5">
          <span className="size-2.5 self-center rounded-full bg-[#dc2626]" />
          <h3 className="m-0 text-[20px] font-bold">
            <span className="text-[#dc2626]">주일</span>
            <span className="text-b1-text">예배</span>
          </h3>
          <span className="text-b1-sub text-[13px]">· 예루살렘성전 3F</span>
        </div>
        <ul className="m-0 list-none p-0">
          {SUNDAY_PARTS.map((s) => (
            <Row key={s.name} s={s} />
          ))}
        </ul>
      </div>

      {/* 다음세대 */}
      <div className="bg-b1-surface border-b1-border rounded-2xl border px-8 py-7">
        <h3 className="text-b1-text m-0 mb-5 text-[20px] font-bold">
          다음세대예배 <span className="text-b1-sub text-[13px] font-normal">· 주일</span>
        </h3>
        <ul className="m-0 grid list-none grid-cols-2 gap-x-8 p-0">
          {GEN_SERVICES.map((s) => (
            <Row key={s.name} s={s} />
          ))}
        </ul>
      </div>
    </div>

    {/* 주중 바 */}
    <div className="bg-b1-surface border-b1-border rounded-2xl border px-8 py-6">
      <h3 className="text-b1-text m-0 mb-4 text-[18px] font-bold">주중·새벽예배</h3>
      <div className="grid grid-cols-4 gap-x-8">
        {WEEKDAY_SERVICES.map((s) => (
          <div key={s.name} className={cn('flex items-baseline gap-3')}>
            <InlineTime time={s.time} className="w-[84px] shrink-0 text-[17px]" />
            <div>
              <div className="text-b1-text text-[15px] font-semibold">
                {s.name}
                {s.note && <span className="text-b1-muted ml-1 text-[11px] font-normal">{s.note}</span>}
              </div>
              <div className="text-b1-sub text-[13px]">{s.place}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
