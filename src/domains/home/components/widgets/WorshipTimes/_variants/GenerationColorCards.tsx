// 시안 J4 — 세대 컬러 카드. 그룹별 톤 구분(주일=악센트 상단바, 다음세대=연블루 배경, 주중=뉴트럴).
// 빠른 스캔용 색 코딩. 빨강은 '주일' 글자만.
import { GEN_SERVICES, SUNDAY_PARTS, WEEKDAY_SERVICES } from './groups';
import { PosterTime, SundayHeader } from './Pieces';
import { stripPeriod, periodKo } from './time';

export const GenerationColorCards = () => (
  <div className="flex flex-col gap-7">
    {/* 주일 부 — 악센트 상단바 카드 */}
    <div>
      <SundayHeader />
      <div className="mt-4 grid grid-cols-5 gap-3">
        {SUNDAY_PARTS.map((s) => (
          <div
            key={s.name}
            className="bg-b1-surface border-b1-border overflow-hidden rounded-xl border"
          >
            <div className="bg-b1-accent h-1 w-full" />
            <div className="px-5 py-4">
              <div className="text-b1-sub text-[14px] font-semibold">{s.name}</div>
              <PosterTime time={s.time} />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* 다음세대 — 연블루 배경 */}
    <div>
      <h4 className="text-b1-text mb-3.5 text-[17px] font-bold">
        다음세대예배 <span className="text-b1-sub text-[13px] font-normal">· 주일</span>
      </h4>
      <div className="grid grid-cols-4 gap-3">
        {GEN_SERVICES.map((s) => (
          <div key={s.name} className="bg-b1-accent-soft/70 rounded-xl px-5 py-4">
            <div className="flex items-baseline gap-1.5">
              <span className="b1-mono text-b1-accent2 text-[13px] font-semibold">{periodKo(s.time)}</span>
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

    {/* 주중·새벽 — 뉴트럴 */}
    <div>
      <h4 className="text-b1-text mb-3.5 text-[17px] font-bold">주중·새벽예배</h4>
      <div className="grid grid-cols-4 gap-3">
        {WEEKDAY_SERVICES.map((s) => (
          <div key={s.name} className="bg-b1-bg border-b1-border rounded-xl border px-5 py-4">
            <div className="flex items-baseline gap-1.5">
              <span className="b1-mono text-b1-muted text-[13px] font-semibold">{periodKo(s.time)}</span>
              <span className="b1-mono text-b1-text text-[22px] font-bold leading-none">
                {stripPeriod(s.time)}
              </span>
            </div>
            <div className="text-b1-text mt-2 text-[16px] font-semibold">
              {s.name}
              {s.note && <span className="text-b1-muted ml-1 text-[11px] font-normal">{s.note}</span>}
            </div>
            <div className="text-b1-sub text-[13px]">{s.place}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
