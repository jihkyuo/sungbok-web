// 시안 J3 — 미니멀 빅타입. 크롬 최소·여백 최대. 주일 부는 큰 시간+이름(장소는 헤더로 승격),
// 다음세대·주중은 작은 라벨 + 깔끔한 행. 빨강은 '주일'만.
import { cn } from '@/shared/lib/utils';
import { GEN_SERVICES, SUNDAY_PARTS, WEEKDAY_SERVICES } from './groups';
import { InlineTime } from './Pieces';
import type { WorshipServiceSummary } from '@/domains/home/data/worshipTimes';

const MiniRow = ({ s }: { s: WorshipServiceSummary }) => (
  <div className="flex items-baseline gap-5 py-3">
    <InlineTime time={s.time} className="w-[104px] shrink-0 text-[18px]" />
    <span className="text-b1-text flex-1 text-[16px] font-semibold">
      {s.name}
      {s.note && <span className="text-b1-muted ml-1 text-[11px] font-normal">{s.note}</span>}
    </span>
    <span className="text-b1-sub text-[14px]">{s.place}</span>
  </div>
);

export const MinimalBigType = () => (
  <div className="bg-b1-surface border-b1-border rounded-2xl border px-12 py-10">
    <div className="mb-4 flex items-baseline gap-2.5">
      <span className="size-2.5 self-center rounded-full bg-[#dc2626]" />
      <h3 className="m-0 text-[22px] font-bold">
        <span className="text-[#dc2626]">주일</span>
        <span className="text-b1-text">예배</span>
      </h3>
      <span className="text-b1-sub text-[14px]">· 예루살렘성전 3F</span>
    </div>
    <ul className="m-0 mb-12 list-none p-0">
      {SUNDAY_PARTS.map((s, i) => (
        <li
          key={s.name}
          className={cn('flex items-baseline gap-7 py-4', i !== 0 && 'border-b1-border border-t')}
        >
          <InlineTime time={s.time} className="w-[160px] shrink-0 text-[26px]" />
          <span className="text-b1-text text-[21px] font-semibold">{s.name}</span>
        </li>
      ))}
    </ul>

    <h4 className="text-b1-sub mb-2 text-[13px] font-bold tracking-[0.1em]">다음세대예배 · 주일</h4>
    <div className="mb-12 grid grid-cols-2 gap-x-14">
      {GEN_SERVICES.map((s) => (
        <MiniRow key={s.name} s={s} />
      ))}
    </div>

    <h4 className="text-b1-sub mb-2 text-[13px] font-bold tracking-[0.1em]">주중·새벽예배</h4>
    <div className="grid grid-cols-2 gap-x-14">
      {WEEKDAY_SERVICES.map((s) => (
        <MiniRow key={s.name} s={s} />
      ))}
    </div>
  </div>
);
