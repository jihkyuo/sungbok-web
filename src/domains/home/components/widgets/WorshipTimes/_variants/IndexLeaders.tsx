// 시안 I1 — 목차형(주보 스타일). 이름 ···· 시간 점선 리더로 연결해 갭을 의미 있게 채움.
// 교회 주보의 순서지 느낌. 주일 부 크게, 다음세대·주중은 2열 리더. 빨강은 '주일'만.
import type { WorshipServiceSummary } from '@/domains/home/data/worshipTimes';
import { cn } from '@/shared/lib/utils';
import { GEN_SERVICES, SUNDAY_PARTS, WEEKDAY_SERVICES } from './groups';
import { SundayHeader } from './Pieces';

const Leader = ({ s, big }: { s: WorshipServiceSummary; big?: boolean }) => (
  <li className="flex items-baseline gap-2 py-2.5">
    <span className={cn('text-b1-text shrink-0 font-semibold', big ? 'text-[18px]' : 'text-[16px]')}>
      {s.name}
    </span>
    <span className="text-b1-sub shrink-0 text-[13px]">
      {s.place}
      {s.note ? ` · ${s.note}` : ''}
    </span>
    <span className="border-b1-border mx-1 mb-[5px] flex-1 border-b border-dotted" />
    <span
      className={cn('b1-mono text-b1-accent shrink-0 font-bold', big ? 'text-[20px]' : 'text-[17px]')}
    >
      {s.time}
    </span>
  </li>
);

export const IndexLeaders = () => (
  <div className="bg-b1-surface border-b1-border rounded-2xl border px-10 py-9">
    <SundayHeader />
    <ul className="m-0 mt-4 mb-9 list-none p-0">
      {SUNDAY_PARTS.map((s) => (
        <Leader key={s.name} s={s} big />
      ))}
    </ul>

    <h4 className="text-b1-text mb-2 text-[17px] font-bold">
      다음세대예배 <span className="text-b1-sub text-[13px] font-normal">· 주일</span>
    </h4>
    <ul className="m-0 mb-9 grid list-none grid-cols-2 gap-x-14 p-0">
      {GEN_SERVICES.map((s) => (
        <Leader key={s.name} s={s} />
      ))}
    </ul>

    <h4 className="text-b1-text mb-2 text-[17px] font-bold">주중·새벽예배</h4>
    <ul className="m-0 grid list-none grid-cols-2 gap-x-14 p-0">
      {WEEKDAY_SERVICES.map((s) => (
        <Leader key={s.name} s={s} />
      ))}
    </ul>
  </div>
);
