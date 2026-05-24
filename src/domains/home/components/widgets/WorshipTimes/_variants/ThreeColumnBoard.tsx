// 시안 H1 — 3열 동등 보드. 주일 1~5부 / 다음세대 / 주중·새벽을 동등한 세 컬럼으로.
// 다음세대를 '주일'과 동급 컬럼으로 둬 격리감 제거. 좌측 패킹으로 갭 없음. 빨강은 '주일'만.
import { GEN_SERVICES, SUNDAY_PARTS, WEEKDAY_SERVICES } from './groups';
import { InlineTime } from './Pieces';
import type { WorshipServiceSummary } from '@/domains/home/data/worshipTimes';
import { cn } from '@/shared/lib/utils';

const Row = ({ s, big }: { s: WorshipServiceSummary; big?: boolean }) => (
  <li className="border-b1-border flex items-baseline gap-3 py-3 [&:not(:last-child)]:border-b">
    <InlineTime time={s.time} className={cn('shrink-0', big ? 'w-[96px] text-[19px]' : 'w-[96px] text-[16px]')} />
    <div className="min-w-0">
      <div className={cn('text-b1-text font-semibold', big ? 'text-[17px]' : 'text-[15px]')}>
        {s.name}
        {s.note && <span className="text-b1-muted ml-1 text-[11px] font-normal">{s.note}</span>}
      </div>
      <div className="text-b1-sub text-[13px]">{s.place}</div>
    </div>
  </li>
);

const Col = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-b1-surface border-b1-border rounded-2xl border px-7 py-6">{children}</div>
);

export const ThreeColumnBoard = () => (
  <div className="grid grid-cols-3 items-start gap-5">
    <Col>
      <div className="mb-5 flex items-baseline gap-2.5">
        <span className="size-2.5 self-center rounded-full bg-[#dc2626]" />
        <h3 className="m-0 text-[20px] font-bold">
          <span className="text-[#dc2626]">주일</span>
          <span className="text-b1-text">예배</span>
        </h3>
      </div>
      <ul className="m-0 list-none p-0">
        {SUNDAY_PARTS.map((s) => (
          <Row key={s.name} s={s} big />
        ))}
      </ul>
    </Col>

    <Col>
      <h3 className="text-b1-text m-0 mb-5 text-[20px] font-bold">
        다음세대예배 <span className="text-b1-sub text-[13px] font-normal">· 주일</span>
      </h3>
      <ul className="m-0 list-none p-0">
        {GEN_SERVICES.map((s) => (
          <Row key={s.name} s={s} />
        ))}
      </ul>
    </Col>

    <Col>
      <h3 className="text-b1-text m-0 mb-5 text-[20px] font-bold">주중·새벽예배</h3>
      <ul className="m-0 list-none p-0">
        {WEEKDAY_SERVICES.map((s) => (
          <Row key={s.name} s={s} />
        ))}
      </ul>
    </Col>
  </div>
);
