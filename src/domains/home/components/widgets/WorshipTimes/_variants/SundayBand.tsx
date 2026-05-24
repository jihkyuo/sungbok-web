// 시안 G1 — 주일 1~5부를 하나의 '중립 틴트 밴드'(5열·구분선)로 분리 강조,
// 다음세대는 같은 패널 바로 아래 4열로 이어붙여 격리감 제거. 빨강은 '주일' 글자만.
import { cn } from '@/shared/lib/utils';
import { GEN_SERVICES, SUNDAY_PARTS } from './groups';
import { InlineTime, PosterTime, SundayHeader, WeekdayStrip } from './Pieces';

export const SundayBand = () => (
  <div className="flex flex-col gap-6">
    <div className="bg-b1-surface border-b1-border rounded-2xl border px-9 py-8">
      <SundayHeader />

      {/* 주일 1~5부 — 중립 틴트 밴드 */}
      <div className="bg-b1-bg border-b1-border mt-7 grid grid-cols-5 overflow-hidden rounded-xl border">
        {SUNDAY_PARTS.map((s, i) => (
          <div
            key={s.name}
            className={cn('flex flex-col gap-2 px-5 py-5', i !== 0 && 'border-b1-border border-l')}
          >
            <span className="text-b1-sub text-[15px] font-semibold">{s.name}</span>
            <PosterTime time={s.time} />
          </div>
        ))}
      </div>

      {/* 다음세대 — 동일 좌측 정렬, 바로 아래 */}
      <h4 className="text-b1-sub mt-8 mb-5 text-[14px] font-bold">다음세대예배</h4>
      <div className="grid grid-cols-4 gap-x-8 gap-y-6 px-5">
        {GEN_SERVICES.map((s) => (
          <div key={s.name} className="flex flex-col gap-1">
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
