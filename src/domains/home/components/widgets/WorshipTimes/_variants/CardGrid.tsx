// 시안 B (STABLE) — 카드 그리드. 그룹별 다열 카드(장년 3열 / 다음세대 4열).
// 큰 시간 숫자를 카드 상단 앵커로, 시간·이름·장소를 한 카드에 근접 배치.
import { WORSHIP_GROUPS } from '@/domains/home/data/worshipTimes';
import { cn } from '@/shared/lib/utils';

export const CardGrid = () => (
  <div className="flex flex-col gap-8">
    {WORSHIP_GROUPS.map((group) => (
      <div key={group.label}>
        <h3 className="b1-mono text-b1-sub mb-3 text-[13px] font-semibold tracking-[0.08em]">
          {group.label}
        </h3>
        <div
          className={cn(
            'grid gap-3',
            group.label === '장년예배' ? 'grid-cols-3' : 'grid-cols-4'
          )}
        >
          {group.services.map((s) => (
            <div
              key={s.name}
              className="bg-b1-surface border-b1-border b1-card-hover flex flex-col gap-1.5 rounded-xl border px-5 py-4"
            >
              <span className="b1-mono text-b1-accent text-[24px] font-bold leading-none tracking-[-0.01em]">
                {s.time}
              </span>
              <span className="text-b1-text text-[15px] font-semibold">
                {s.name}
                {s.note && (
                  <span className="text-b1-muted ml-1.5 text-[11px] font-normal">{s.note}</span>
                )}
              </span>
              <span className="b1-mono text-b1-muted text-[11px] tracking-[0.02em]">
                {s.place}
              </span>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
