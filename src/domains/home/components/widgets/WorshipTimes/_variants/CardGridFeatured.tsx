// 시안 H3 — 카드 그리드. 주일 1~5부는 큰 피처드 카드 행, 다음세대·주중은 카드 그리드.
// 카드 기반의 친근한 결. 빨강은 '주일'만, 시간 오전/오후 명시.
import { GEN_SERVICES, SUNDAY_PARTS, WEEKDAY_SECTIONS } from './groups';
import { InlineTime } from './Pieces';
import { periodKo, stripPeriod } from './time';

export const CardGridFeatured = () => (
  <div className="flex flex-col gap-7">
    {/* 주일 피처드 */}
    <div>
      <div className="mb-4 flex items-baseline gap-2.5">
        <span className="size-2.5 self-center rounded-full bg-[#dc2626]" />
        <h3 className="m-0 text-[20px] font-bold">
          <span className="text-[#dc2626]">주일</span>
          <span className="text-b1-text">예배</span>
        </h3>
        <span className="text-b1-sub text-[14px]">· 예루살렘성전 3F</span>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {SUNDAY_PARTS.map((s) => (
          <div
            key={s.name}
            className="bg-b1-surface border-b1-border b1-card-hover rounded-2xl border px-6 py-6"
          >
            <div className="text-b1-sub mb-2.5 text-[15px] font-semibold">{s.name}</div>
            <div className="flex items-baseline gap-1.5">
              <span className="b1-mono text-b1-sub text-[15px] font-semibold">{periodKo(s.time)}</span>
              <span className="b1-mono text-b1-text text-[34px] font-bold leading-none tracking-[-0.02em]">
                {stripPeriod(s.time)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* 다음세대 */}
    <div>
      <h4 className="text-b1-text mb-3.5 text-[16px] font-bold">
        다음세대예배 <span className="text-b1-sub text-[13px] font-normal">· 주일</span>
      </h4>
      <div className="grid grid-cols-4 gap-3">
        {GEN_SERVICES.map((s) => (
          <div key={s.name} className="bg-b1-surface border-b1-border rounded-xl border px-5 py-4">
            <div className="flex items-baseline gap-1.5">
              <span className="b1-mono text-b1-sub text-[13px] font-semibold">{periodKo(s.time)}</span>
              <span className="b1-mono text-b1-accent text-[22px] font-bold leading-none">
                {stripPeriod(s.time)}
              </span>
            </div>
            <div className="text-b1-text mt-2 text-[16px] font-semibold">{s.name}</div>
            <div className="text-b1-sub text-[13px]">{s.place}</div>
          </div>
        ))}
      </div>
    </div>

    {/* 주중·새벽 */}
    <div>
      <h4 className="text-b1-text mb-3.5 text-[16px] font-bold">주중·새벽예배</h4>
      <div className="grid grid-cols-3 gap-3">
        {WEEKDAY_SECTIONS.map((sec) => (
          <div key={sec.day} className="bg-b1-surface border-b1-border rounded-xl border px-5 py-4">
            <div className="text-b1-text mb-3 text-[16px] font-bold">{sec.day}</div>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {sec.services.map((s) => (
                <li key={s.name} className="flex items-baseline gap-2.5">
                  <InlineTime time={s.time} className="text-[16px]" />
                  <div>
                    <span className="text-b1-text text-[15px] font-semibold">
                      {s.name}
                      {s.note && (
                        <span className="text-b1-muted ml-1 text-[11px] font-normal">{s.note}</span>
                      )}
                    </span>
                    <div className="text-b1-sub text-[13px]">{s.place}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </div>
);
