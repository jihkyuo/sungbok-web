// 시안 G2 — 주일 1~5부를 개별 틴트 카드(5열)로 분리, 다음세대를 '같은 5열 그리드'로
// 바로 아래 정렬해 컬럼이 위아래로 딱 맞음. 빨강은 '주일' 글자만.
import { GEN_SERVICES, SUNDAY_PARTS } from './groups';
import { InlineTime, PosterTime, SundayHeader, WeekdayStrip } from './Pieces';

export const SundayCards = () => (
  <div className="flex flex-col gap-6">
    <div className="bg-b1-surface border-b1-border rounded-2xl border px-9 py-8">
      <SundayHeader />

      {/* 주일 1~5부 — 개별 틴트 카드 */}
      <div className="mt-7 grid grid-cols-5 gap-3">
        {SUNDAY_PARTS.map((s) => (
          <div
            key={s.name}
            className="bg-b1-bg border-b1-border flex flex-col gap-2 rounded-xl border px-4 py-4"
          >
            <span className="text-b1-sub text-[15px] font-semibold">{s.name}</span>
            <PosterTime time={s.time} />
          </div>
        ))}
      </div>

      {/* 다음세대 — 동일 5열 정렬 */}
      <h4 className="text-b1-sub mt-8 mb-5 text-[14px] font-bold">다음세대예배</h4>
      <div className="grid grid-cols-5 gap-x-3 gap-y-7">
        {GEN_SERVICES.map((s) => (
          <div key={s.name} className="flex flex-col gap-1 px-4">
            <InlineTime time={s.time} className="text-[18px]" />
            <span className="text-b1-text mt-1 text-[16px] font-semibold">{s.name}</span>
            <span className="text-b1-sub text-[14px]">{s.place}</span>
          </div>
        ))}
      </div>
    </div>

    <WeekdayStrip />
  </div>
);
