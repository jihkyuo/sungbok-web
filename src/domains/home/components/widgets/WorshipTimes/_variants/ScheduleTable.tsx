// 시안 I3 — 스케줄 테이블. 시간 | 예배 | 장소 정렬된 표. 주일 부 + 다음세대를 한 '주일' 그룹
// 아래 묶고(소제목으로 구분), 주중·새벽을 별도 그룹으로. 빨강은 '주일'만.
import type { WorshipServiceSummary } from '@/domains/home/data/worshipTimes';
import { cn } from '@/shared/lib/utils';
import { GEN_SERVICES, SUNDAY_PARTS, WEEKDAY_SERVICES } from './groups';

const COLS = 'grid grid-cols-[132px_1fr_220px] items-baseline';

const Row = ({ s, strong }: { s: WorshipServiceSummary; strong?: boolean }) => (
  <div className={cn(COLS, 'border-b1-border border-t px-8 py-3.5')}>
    <span
      className={cn(
        'b1-mono font-bold',
        strong ? 'text-b1-text text-[20px]' : 'text-b1-accent text-[17px]'
      )}
    >
      {s.time}
    </span>
    <span className={cn('text-b1-text font-semibold', strong ? 'text-[17px]' : 'text-[16px]')}>
      {s.name}
      {s.note && <span className="text-b1-muted ml-1.5 text-[12px] font-normal">{s.note}</span>}
    </span>
    <span className="text-b1-sub text-[14px]">{s.place}</span>
  </div>
);

const SubLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="border-b1-border bg-b1-bg/50 border-t px-8 pt-3.5 pb-1">
    <span className="b1-mono text-b1-muted text-[11px] font-bold tracking-[0.1em]">{children}</span>
  </div>
);

export const ScheduleTable = () => (
  <div className="bg-b1-surface border-b1-border overflow-hidden rounded-2xl border">
    {/* 주일 그룹 */}
    <div className="flex items-baseline gap-2.5 px-8 py-4">
      <span className="size-2.5 self-center rounded-full bg-[#dc2626]" />
      <h3 className="m-0 text-[20px] font-bold">
        <span className="text-[#dc2626]">주일</span>
        <span className="text-b1-text">예배</span>
      </h3>
      <span className="text-b1-sub text-[14px]">· 예루살렘성전 3F</span>
    </div>
    <SubLabel>장년 1~5부</SubLabel>
    {SUNDAY_PARTS.map((s) => (
      <Row key={s.name} s={s} strong />
    ))}
    <SubLabel>다음세대</SubLabel>
    {GEN_SERVICES.map((s) => (
      <Row key={s.name} s={s} />
    ))}

    {/* 주중 그룹 */}
    <div className="border-b1-border mt-2 border-t-4 px-8 py-4">
      <h3 className="text-b1-text m-0 text-[20px] font-bold">주중·새벽예배</h3>
    </div>
    {WEEKDAY_SERVICES.map((s) => (
      <Row key={s.name} s={s} />
    ))}
  </div>
);
