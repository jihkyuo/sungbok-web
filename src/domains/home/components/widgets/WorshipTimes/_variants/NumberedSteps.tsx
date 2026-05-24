// 시안 J1 — 넘버드 스텝. 주일 1~5부를 큰 인덱스(01~05)와 큰 시간으로 하루의 진행처럼.
// 다음세대·주중은 보조 리스트. 빨강은 '주일'만.
import { cn } from '@/shared/lib/utils';
import { GEN_SERVICES, SUNDAY_PARTS, WEEKDAY_SERVICES } from './groups';
import { InlineTime, PosterTime, SundayHeader } from './Pieces';
import type { WorshipServiceSummary } from '@/domains/home/data/worshipTimes';

const SubList = ({ title, items }: { title: React.ReactNode; items: WorshipServiceSummary[] }) => (
  <>
    <h4 className="text-b1-text mt-8 mb-5 text-[17px] font-bold">{title}</h4>
    <div className="grid grid-cols-4 gap-x-8 gap-y-5">
      {items.map((s) => (
        <div key={s.name} className="flex items-baseline gap-3">
          <InlineTime time={s.time} className="w-[92px] shrink-0 text-[18px]" />
          <div>
            <div className="text-b1-text text-[16px] font-semibold">
              {s.name}
              {s.note && <span className="text-b1-muted ml-1 text-[11px] font-normal">{s.note}</span>}
            </div>
            <div className="text-b1-sub text-[14px]">{s.place}</div>
          </div>
        </div>
      ))}
    </div>
  </>
);

export const NumberedSteps = () => (
  <div className="bg-b1-surface border-b1-border rounded-2xl border px-9 py-8">
    <SundayHeader />
    <div className="mt-6 grid grid-cols-5 gap-2">
      {SUNDAY_PARTS.map((s, i) => (
        <div key={s.name} className={cn('px-5 py-3', i !== 0 && 'border-b1-border border-l')}>
          <span className="b1-mono text-b1-accent2/25 text-[44px] font-bold leading-none">{`0${i + 1}`}</span>
          <div className="text-b1-text mt-2 text-[15px] font-semibold">{s.name}</div>
          <PosterTime time={s.time} className="mt-1.5" />
        </div>
      ))}
    </div>
    <SubList title={<>다음세대예배 <span className="text-b1-sub text-[13px] font-normal">· 주일</span></>} items={GEN_SERVICES} />
    <SubList title="주중·새벽예배" items={WEEKDAY_SERVICES} />
  </div>
);
