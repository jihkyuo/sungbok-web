// 시안 I2 — 벤토 그리드. 크기가 다른 블록 모자이크. 주일 부는 넓은 상단 블록(큰 숫자),
// 다음세대는 넓은 블록, 주중·새벽은 좁은 사이드 블록. 빨강은 '주일'만.
import { GEN_SERVICES, SUNDAY_PARTS, WEEKDAY_SERVICES } from './groups';
import { InlineTime, PosterTime, SundayHeader } from './Pieces';

export const BentoGrid = () => (
  <div className="grid grid-cols-3 gap-4">
    {/* 주일 부 — 넓은 상단 블록 */}
    <div className="bg-b1-surface border-b1-border col-span-3 rounded-2xl border px-8 py-7">
      <SundayHeader />
      <div className="mt-5 grid grid-cols-5 gap-4">
        {SUNDAY_PARTS.map((s) => (
          <div key={s.name} className="bg-b1-bg border-b1-border flex flex-col gap-2 rounded-xl border px-5 py-4">
            <span className="text-b1-sub text-[15px] font-semibold">{s.name}</span>
            <PosterTime time={s.time} />
          </div>
        ))}
      </div>
    </div>

    {/* 다음세대 — 넓은 블록 */}
    <div className="bg-b1-surface border-b1-border col-span-2 rounded-2xl border px-8 py-7">
      <h4 className="text-b1-text mb-5 text-[17px] font-bold">
        다음세대예배 <span className="text-b1-sub text-[13px] font-normal">· 주일</span>
      </h4>
      <div className="grid grid-cols-2 gap-x-8 gap-y-5">
        {GEN_SERVICES.map((s) => (
          <div key={s.name} className="flex items-baseline gap-3">
            <InlineTime time={s.time} className="w-[92px] shrink-0 text-[18px]" />
            <div>
              <div className="text-b1-text text-[16px] font-semibold">{s.name}</div>
              <div className="text-b1-sub text-[14px]">{s.place}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* 주중·새벽 — 좁은 사이드 블록 */}
    <div className="bg-b1-surface border-b1-border col-span-1 rounded-2xl border px-7 py-7">
      <h4 className="text-b1-text mb-5 text-[17px] font-bold">주중·새벽예배</h4>
      <ul className="m-0 flex list-none flex-col gap-4 p-0">
        {WEEKDAY_SERVICES.map((s) => (
          <li key={s.name} className="flex items-baseline gap-3">
            <InlineTime time={s.time} className="w-[84px] shrink-0 text-[17px]" />
            <div>
              <div className="text-b1-text text-[15px] font-semibold">
                {s.name}
                {s.note && <span className="text-b1-muted ml-1 text-[11px] font-normal">{s.note}</span>}
              </div>
              <div className="text-b1-sub text-[13px]">{s.place}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
);
