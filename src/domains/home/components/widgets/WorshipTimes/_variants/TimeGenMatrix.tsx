// 시안 K5 — 시간×세대 매트릭스. 주일 시각(행) × [장년 | 다음세대](열). 같은 시각에 두 세대가
// 나란히 보임(11:30에 장년 3부 ↔ 다음세대 5부서). 주중·새벽은 하단 스트립. 빨강은 '주일'만.
import { cn } from '@/shared/lib/utils';
import { GEN_SERVICES, SUNDAY_PARTS, WEEKDAY_SECTIONS } from './groups';
import { InlineTime, PosterTime } from './Pieces';
import { toMinutes } from './time';

const SUNDAY_TIMES = [...new Set([...SUNDAY_PARTS, ...GEN_SERVICES].map((s) => s.time))].sort(
  (a, b) => toMinutes(a) - toMinutes(b)
);

const Chip = ({ name, place, gen }: { name: string; place: string; gen?: boolean }) => (
  <div className={cn('rounded-lg px-3 py-2', gen ? 'bg-b1-accent-soft' : 'bg-b1-bg border-b1-border border')}>
    <span className={cn('text-[15px] font-semibold', gen ? 'text-b1-accent' : 'text-b1-text')}>{name}</span>
    <span className="text-b1-sub ml-2 text-[12px]">{place}</span>
  </div>
);

export const TimeGenMatrix = () => (
  <div className="flex flex-col gap-6">
    <div className="bg-b1-surface border-b1-border overflow-hidden rounded-2xl border">
      <div className="flex items-baseline gap-2.5 px-7 py-4">
        <span className="size-2.5 self-center rounded-full bg-[#dc2626]" />
        <h3 className="m-0 text-[20px] font-bold">
          <span className="text-[#dc2626]">주일</span>
          <span className="text-b1-text">예배</span>
        </h3>
      </div>
      <div className="bg-b1-bg border-b1-border text-b1-muted grid grid-cols-[120px_1fr_1.4fr] border-y px-7 py-2.5 text-[12px] font-bold tracking-[0.08em]">
        <span>시간</span>
        <span>장년예배</span>
        <span>다음세대예배</span>
      </div>
      {SUNDAY_TIMES.map((t, i) => (
        <div
          key={t}
          className={cn(
            'grid grid-cols-[120px_1fr_1.4fr] items-center gap-4 px-7 py-3.5',
            i !== 0 && 'border-b1-border border-t'
          )}
        >
          <PosterTime time={t} className="!text-[26px]" />
          <div className="flex flex-wrap gap-2">
            {SUNDAY_PARTS.filter((s) => s.time === t).map((s) => (
              <Chip key={s.name} name={s.name} place={s.place} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {GEN_SERVICES.filter((s) => s.time === t).map((s) => (
              <Chip key={s.name} name={s.name} place={s.place} gen />
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* 주중·새벽 스트립 */}
    <div className="bg-b1-border border-b1-border grid grid-cols-3 gap-px overflow-hidden rounded-2xl border">
      {WEEKDAY_SECTIONS.map((sec) => (
        <div key={sec.day} className="bg-b1-surface px-7 py-6">
          <h4 className="text-b1-text m-0 mb-4 text-[18px] font-bold">{sec.day}</h4>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {sec.services.map((s) => (
              <li key={s.name} className="flex items-baseline gap-3">
                <InlineTime time={s.time} className="text-[17px]" />
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
      ))}
    </div>
  </div>
);
