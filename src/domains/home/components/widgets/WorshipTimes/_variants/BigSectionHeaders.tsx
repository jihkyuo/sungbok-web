// 시안 K3 — 빅 섹션 헤더. 그룹명을 초대형 헤더로 써서 구획. 콘텐츠는 깔끔한 행.
// 빨강은 '주일' 글자만.
import { GEN_SERVICES, SUNDAY_PARTS, WEEKDAY_SERVICES } from './groups';
import { InlineTime } from './Pieces';
import type { WorshipServiceSummary } from '@/domains/home/data/worshipTimes';

const Row = ({ s, big }: { s: WorshipServiceSummary; big?: boolean }) => (
  <div className="flex items-baseline gap-4">
    <InlineTime time={s.time} className={big ? 'w-[100px] shrink-0 text-[19px]' : 'w-[92px] shrink-0 text-[17px]'} />
    <div>
      <div className={big ? 'text-b1-text text-[17px] font-semibold' : 'text-b1-text text-[16px] font-semibold'}>
        {s.name}
        {s.note && <span className="text-b1-muted ml-1 text-[11px] font-normal">{s.note}</span>}
      </div>
      <div className="text-b1-sub text-[14px]">{s.place}</div>
    </div>
  </div>
);

export const BigSectionHeaders = () => (
  <div className="bg-b1-surface border-b1-border rounded-2xl border px-10 py-9">
    {/* 주일 */}
    <div className="border-b1-border flex items-end justify-between border-b pb-5">
      <h3 className="m-0 text-[40px] font-bold tracking-[-0.03em]">
        <span className="text-[#dc2626]">주일</span>
        <span className="text-b1-text">예배</span>
      </h3>
      <span className="text-b1-sub pb-2 text-[14px]">예루살렘성전 3F · 1~5부</span>
    </div>
    <div className="mt-6 grid grid-cols-3 gap-x-8 gap-y-5">
      {SUNDAY_PARTS.map((s) => (
        <Row key={s.name} s={s} big />
      ))}
    </div>

    {/* 다음세대 */}
    <h3 className="text-b1-text border-b1-border mt-10 border-b pb-5 text-[40px] font-bold tracking-[-0.03em]">
      다음세대예배 <span className="text-b1-sub align-middle text-[15px] font-normal">· 주일</span>
    </h3>
    <div className="mt-6 grid grid-cols-4 gap-x-8 gap-y-5">
      {GEN_SERVICES.map((s) => (
        <Row key={s.name} s={s} />
      ))}
    </div>

    {/* 주중 */}
    <h3 className="text-b1-text border-b1-border mt-10 border-b pb-5 text-[40px] font-bold tracking-[-0.03em]">
      주중·새벽예배
    </h3>
    <div className="mt-6 grid grid-cols-4 gap-x-8 gap-y-5">
      {WEEKDAY_SERVICES.map((s) => (
        <Row key={s.name} s={s} />
      ))}
    </div>
  </div>
);
