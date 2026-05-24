// 시안 A (STABLE) — 2단 분할 리스트. 좌:장년 / 우:다음세대.
// 좁은 컬럼 + 좌측 패킹으로 시간↔장소 갭 제거, 타이포 확대.
import { WORSHIP_GROUPS } from '@/domains/home/data/worshipTimes';
import { cn } from '@/shared/lib/utils';

export const SplitList = () => (
  <div className="grid grid-cols-2 gap-6">
    {WORSHIP_GROUPS.map((group) => (
      <div
        key={group.label}
        className="bg-b1-surface border-b1-border overflow-hidden rounded-2xl border"
      >
        <div className="bg-b1-bg border-b1-border border-b px-6 py-3">
          <h3 className="b1-mono text-b1-sub m-0 text-[13px] font-semibold tracking-[0.08em]">
            {group.label}
          </h3>
        </div>
        <ul className="m-0 list-none p-0">
          {group.services.map((s, i) => (
            <li
              key={s.name}
              className={cn(
                'flex items-baseline gap-4 px-6 py-3.5',
                i !== group.services.length - 1 && 'border-b1-border border-b'
              )}
            >
              <span className="b1-mono text-b1-accent w-[96px] shrink-0 text-[18px] font-bold tracking-[-0.01em]">
                {s.time}
              </span>
              <span className="text-b1-text text-[16px] font-semibold">
                {s.name}
                {s.note && (
                  <span className="text-b1-muted ml-2 text-[12px] font-normal">{s.note}</span>
                )}
              </span>
              <span className="text-b1-muted text-[13px]">· {s.place}</span>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);
