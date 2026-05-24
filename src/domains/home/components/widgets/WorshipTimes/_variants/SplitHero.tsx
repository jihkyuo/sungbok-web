// 시안 J2 — 분할 히어로. 좌측 큰 '주일예배' 히어로 블록(부 리스트), 우측 다음세대·주중.
// 비대칭 에디토리얼. 빨강은 '주일'만.
import { cn } from '@/shared/lib/utils';
import { GEN_SERVICES, SUNDAY_PARTS, WEEKDAY_SERVICES } from './groups';
import { InlineTime } from './Pieces';
import type { WorshipServiceSummary } from '@/domains/home/data/worshipTimes';

const Item = ({ s }: { s: WorshipServiceSummary }) => (
  <div className="flex items-baseline gap-3">
    <InlineTime time={s.time} className="w-[88px] shrink-0 text-[17px]" />
    <div>
      <div className="text-b1-text text-[16px] font-semibold">
        {s.name}
        {s.note && <span className="text-b1-muted ml-1 text-[11px] font-normal">{s.note}</span>}
      </div>
      <div className="text-b1-sub text-[14px]">{s.place}</div>
    </div>
  </div>
);

export const SplitHero = () => (
  <div className="border-b1-border grid grid-cols-[5fr_7fr] overflow-hidden rounded-2xl border">
    {/* 히어로 좌 */}
    <div className="bg-b1-bg px-9 py-9">
      <div className="mb-3 flex items-baseline gap-2.5">
        <span className="size-2.5 self-center rounded-full bg-[#dc2626]" />
        <h3 className="m-0 text-[30px] font-bold tracking-[-0.02em]">
          <span className="text-[#dc2626]">주일</span>
          <span className="text-b1-text">예배</span>
        </h3>
      </div>
      <div className="text-b1-sub mb-6 text-[14px]">예루살렘성전 3F · 1~5부</div>
      <ul className="m-0 flex list-none flex-col p-0">
        {SUNDAY_PARTS.map((s, i) => (
          <li
            key={s.name}
            className={cn('flex items-baseline justify-between py-3.5', i !== 0 && 'border-b1-border border-t')}
          >
            <span className="text-b1-text text-[16px] font-semibold">{s.name}</span>
            <InlineTime time={s.time} className="text-[21px]" />
          </li>
        ))}
      </ul>
    </div>

    {/* 우 */}
    <div className="bg-b1-surface px-9 py-9">
      <h4 className="text-b1-text mb-5 text-[17px] font-bold">
        다음세대예배 <span className="text-b1-sub text-[13px] font-normal">· 주일</span>
      </h4>
      <div className="mb-8 grid grid-cols-2 gap-x-8 gap-y-5">
        {GEN_SERVICES.map((s) => (
          <Item key={s.name} s={s} />
        ))}
      </div>
      <h4 className="text-b1-text mb-5 text-[17px] font-bold">주중·새벽예배</h4>
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {WEEKDAY_SERVICES.map((s) => (
          <Item key={s.name} s={s} />
        ))}
      </div>
    </div>
  </div>
);
