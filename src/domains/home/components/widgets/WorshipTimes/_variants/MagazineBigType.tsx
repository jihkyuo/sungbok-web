// 시안 H2 — 매거진 빅타입. 박스 최소화·여백 위주. 주일 1~5부를 초대형 타이포로(배경색 없음),
// 다음세대·주중은 같은 패널 안에서 구분선으로 이어짐. 빨강은 '주일'만.
import { GEN_SERVICES, SUNDAY_PARTS, WEEKDAY_SECTIONS } from './groups';
import { InlineTime } from './Pieces';
import { periodKo, stripPeriod } from './time';
import { cn } from '@/shared/lib/utils';

export const MagazineBigType = () => (
  <div className="bg-b1-surface border-b1-border rounded-2xl border px-10 py-9">
    {/* 주일 히어로 */}
    <div className="mb-4 flex items-baseline gap-2.5">
      <span className="size-2.5 self-center rounded-full bg-[#dc2626]" />
      <h3 className="m-0 text-[24px] font-bold">
        <span className="text-[#dc2626]">주일</span>
        <span className="text-b1-text">예배</span>
      </h3>
      <span className="text-b1-sub text-[14px]">· 예루살렘성전 3F</span>
    </div>
    <div className="border-b1-border grid grid-cols-5 border-b pb-9">
      {SUNDAY_PARTS.map((s, i) => (
        <div key={s.name} className={cn('flex flex-col gap-2.5 px-5', i !== 0 && 'border-b1-border border-l')}>
          <span className="text-b1-sub text-[15px] font-semibold">{s.name}</span>
          <span className="flex items-baseline gap-1.5">
            <span className="b1-mono text-b1-sub text-[16px] font-semibold">{periodKo(s.time)}</span>
            <span className="b1-mono text-b1-text text-[46px] font-bold leading-none tracking-[-0.03em]">
              {stripPeriod(s.time)}
            </span>
          </span>
        </div>
      ))}
    </div>

    {/* 다음세대 */}
    <h4 className="text-b1-text mt-9 mb-6 text-[18px] font-bold">
      다음세대예배 <span className="text-b1-sub text-[14px] font-normal">· 주일</span>
    </h4>
    <div className="border-b1-border grid grid-cols-4 gap-x-8 gap-y-6 border-b pb-9">
      {GEN_SERVICES.map((s) => (
        <div key={s.name} className="flex items-baseline gap-3">
          <InlineTime time={s.time} className="w-[96px] shrink-0 text-[19px]" />
          <div>
            <div className="text-b1-text text-[17px] font-semibold">{s.name}</div>
            <div className="text-b1-sub text-[14px]">{s.place}</div>
          </div>
        </div>
      ))}
    </div>

    {/* 주중·새벽 */}
    <h4 className="text-b1-text mt-9 mb-6 text-[18px] font-bold">주중·새벽예배</h4>
    <div className="grid grid-cols-3 gap-x-8">
      {WEEKDAY_SECTIONS.map((sec) => (
        <div key={sec.day}>
          <div className="text-b1-sub mb-3 text-[15px] font-bold">{sec.day}</div>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {sec.services.map((s) => (
              <li key={s.name} className="flex items-baseline gap-3">
                <InlineTime time={s.time} className="text-[18px]" />
                <div>
                  <div className="text-b1-text text-[16px] font-semibold">
                    {s.name}
                    {s.note && <span className="text-b1-muted ml-1 text-[11px] font-normal">{s.note}</span>}
                  </div>
                  <div className="text-b1-sub text-[14px]">{s.place}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);
