// 시안 F (다른 결) — 포스터형. 주일 1~5부를 다크 패널에 초대형 타이포로 강조하고,
// 다음세대 / 주중·새벽은 하단 밝은 영역으로. 톤이 가장 다름(다크 vs 화이트).
import { WORSHIP_GROUPS, type WorshipServiceSummary } from '@/domains/home/data/worshipTimes';
import { cn } from '@/shared/lib/utils';
import { periodLabel, stripPeriod } from './time';

const adult = WORSHIP_GROUPS[0].services;
const sunday = adult.slice(0, 5);
const weekday = adult.slice(5);
const gen = WORSHIP_GROUPS[1].services;

export const PosterWeek = () => (
  <div className="border-b1-border overflow-hidden rounded-2xl border">
    {/* 다크 헤드라인: 주일 */}
    <div className="bg-b1-text px-10 py-9">
      <div className="mb-7 flex items-baseline gap-3">
        <h3 className="m-0 text-[24px] font-bold text-white">주일예배</h3>
        <span className="b1-mono text-[12px] tracking-[0.12em] text-white/45">
          SUNDAY · 예루살렘성전 3F
        </span>
      </div>
      <div className="grid grid-cols-5 gap-6">
        {sunday.map((s, i) => (
          <div
            key={s.name}
            className={cn('flex flex-col gap-2 pl-6', i !== 0 && 'border-l border-white/15')}
          >
            <span className="text-[13px] font-semibold text-white/60">{s.name}</span>
            <span className="b1-mono text-[34px] font-bold leading-none tracking-[-0.03em] text-white">
              {stripPeriod(s.time)}
            </span>
            <span className="b1-mono text-[11px] tracking-[0.1em] text-white/40">
              {periodLabel(s.time)}
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* 밝은 하단: 다음세대 + 주중·새벽 */}
    <div className="bg-b1-surface grid grid-cols-[1fr_360px]">
      <div className="border-b1-border border-r px-10 py-8">
        <h4 className="b1-mono text-b1-sub mb-5 text-[12px] font-semibold tracking-[0.12em]">
          다음세대예배 · 주일
        </h4>
        <div className="grid grid-cols-4 gap-x-6 gap-y-5">
          {gen.map((s) => (
            <div key={s.name} className="flex flex-col gap-1">
              <span className="b1-mono text-b1-accent text-[18px] font-bold">{stripPeriod(s.time)}</span>
              <span className="text-b1-text text-[14px] font-semibold">{s.name}</span>
              <span className="text-b1-muted text-[11px]">{s.place}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-10 py-8">
        <h4 className="b1-mono text-b1-sub mb-5 text-[12px] font-semibold tracking-[0.12em]">
          주중 · 새벽예배
        </h4>
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {weekday.map((s: WorshipServiceSummary) => (
            <li key={s.name} className="flex items-baseline gap-3">
              <span className="b1-mono text-b1-accent w-[84px] shrink-0 text-[15px] font-bold">
                {s.time}
              </span>
              <div>
                <div className="text-b1-text text-[14px] font-semibold">
                  {s.name}
                  {s.note && (
                    <span className="text-b1-muted ml-1 text-[10px] font-normal">{s.note}</span>
                  )}
                </div>
                <div className="text-b1-muted text-[12px]">{s.place}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);
