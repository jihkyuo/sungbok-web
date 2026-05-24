// 시안 E2 — 레드 포스터 헤드 + 요일 아젠다.
// 주일 1~5부를 딥레드 패널에 초대형 흰 숫자로(포스터), 다음세대는 그 아래 그리드,
// 주중·새벽은 요일 아젠다로. 텍스트 확대 + 장소는 b1-sub로 진하게.
import { cn } from '@/shared/lib/utils';
import { GEN_SERVICES, SUNDAY_PARTS, WEEKDAY_SECTIONS } from './groups';
import { periodLabel, stripPeriod } from './time';

export const RedPosterAgenda = () => (
  <div className="bg-b1-surface border-b1-border overflow-hidden rounded-2xl border">
    {/* 주일 레드 포스터 */}
    <div className="bg-[#b91c1c] px-10 py-9">
      <div className="mb-7 flex items-baseline gap-3">
        <h3 className="m-0 text-[26px] font-bold text-white">주일예배</h3>
        <span className="b1-mono text-[13px] tracking-[0.12em] text-white/55">
          SUNDAY · 예루살렘성전 3F
        </span>
      </div>
      <div className="grid grid-cols-5 gap-6">
        {SUNDAY_PARTS.map((s, i) => (
          <div
            key={s.name}
            className={cn('flex flex-col gap-2 pl-6', i !== 0 && 'border-l border-white/20')}
          >
            <span className="text-[15px] font-semibold text-white/75">{s.name}</span>
            <span className="b1-mono text-[40px] font-bold leading-none tracking-[-0.03em] text-white">
              {stripPeriod(s.time)}
            </span>
            <span className="b1-mono text-[12px] tracking-[0.1em] text-white/50">
              {periodLabel(s.time)}
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* 다음세대 (주일) */}
    <div className="border-b1-border border-b px-10 py-8">
      <h4 className="b1-mono text-b1-sub mb-6 text-[13px] font-bold tracking-[0.12em]">
        다음세대예배 · 주일
      </h4>
      <div className="grid grid-cols-4 gap-x-8 gap-y-7">
        {GEN_SERVICES.map((s) => (
          <div key={s.name} className="flex flex-col gap-1">
            <span className="b1-mono text-b1-accent text-[24px] font-bold leading-none">
              {stripPeriod(s.time)}
            </span>
            <span className="text-b1-text mt-1.5 text-[16px] font-semibold">{s.name}</span>
            <span className="text-b1-sub text-[14px]">{s.place}</span>
          </div>
        ))}
      </div>
    </div>

    {/* 주중·새벽 아젠다 */}
    <div className="bg-b1-border flex flex-col gap-px">
      {WEEKDAY_SECTIONS.map((sec) => (
        <div
          key={sec.day}
          className="bg-b1-surface grid grid-cols-[180px_1fr] items-start gap-8 px-10 py-6"
        >
          <div>
            <h4 className="text-b1-text m-0 text-[20px] font-bold">{sec.day}</h4>
            <span className="b1-mono text-b1-muted text-[11px] tracking-[0.12em]">{sec.sub}</span>
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-4">
            {sec.services.map((s) => (
              <div key={s.name} className="flex items-baseline gap-3">
                <span className="b1-mono text-b1-accent text-[22px] font-bold">{s.time}</span>
                <div>
                  <div className="text-b1-text text-[16px] font-semibold">
                    {s.name}
                    {s.note && (
                      <span className="text-b1-muted ml-1 text-[12px] font-normal">{s.note}</span>
                    )}
                  </div>
                  <div className="text-b1-sub text-[14px]">{s.place}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
