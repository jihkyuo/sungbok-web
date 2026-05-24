// 시안 K2 — 티켓 스텁 카드. 각 예배를 [시간존 | 점선 절취선 | 정보존] 티켓으로.
// 빨강은 '주일'만. 시간 오전/오후 명시, 장소 진하게.
import { GEN_SERVICES, SUNDAY_PARTS, WEEKDAY_SERVICES } from './groups';
import { SundayHeader } from './Pieces';
import { periodKo, stripPeriod } from './time';
import type { WorshipServiceSummary } from '@/domains/home/data/worshipTimes';

const Ticket = ({ s }: { s: WorshipServiceSummary }) => (
  <div className="bg-b1-surface border-b1-border flex overflow-hidden rounded-xl border">
    <div className="bg-b1-bg flex min-w-[104px] flex-col justify-center px-4 py-3">
      <span className="b1-mono text-b1-sub text-[12px] font-semibold">{periodKo(s.time)}</span>
      <span className="b1-mono text-b1-text text-[23px] font-bold leading-none">{stripPeriod(s.time)}</span>
    </div>
    <div className="relative flex-1 px-4 py-3">
      <span className="border-b1-border absolute top-0 left-0 h-full border-l border-dashed" />
      <div className="text-b1-text text-[16px] font-semibold">
        {s.name}
        {s.note && <span className="text-b1-muted ml-1 text-[11px] font-normal">{s.note}</span>}
      </div>
      <div className="text-b1-sub text-[13px]">{s.place}</div>
    </div>
  </div>
);

export const TicketStub = () => (
  <div className="flex flex-col gap-7">
    <div>
      <SundayHeader />
      <div className="mt-4 grid grid-cols-3 gap-3">
        {SUNDAY_PARTS.map((s) => (
          <Ticket key={s.name} s={s} />
        ))}
      </div>
    </div>
    <div>
      <h4 className="text-b1-text mb-3.5 text-[17px] font-bold">
        다음세대예배 <span className="text-b1-sub text-[13px] font-normal">· 주일</span>
      </h4>
      <div className="grid grid-cols-4 gap-3">
        {GEN_SERVICES.map((s) => (
          <Ticket key={s.name} s={s} />
        ))}
      </div>
    </div>
    <div>
      <h4 className="text-b1-text mb-3.5 text-[17px] font-bold">주중·새벽예배</h4>
      <div className="grid grid-cols-4 gap-3">
        {WEEKDAY_SERVICES.map((s) => (
          <Ticket key={s.name} s={s} />
        ))}
      </div>
    </div>
  </div>
);
