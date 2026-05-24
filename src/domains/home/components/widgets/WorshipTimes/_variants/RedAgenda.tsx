// 시안 E3 — 화이트 베이스 + 빅 레드 숫자. 레드를 패널이 아니라 타이포로 사용.
// 주일 1~5부는 흰 배경에 초대형 레드 숫자(포스터), 다음세대 그리드, 주중·새벽 아젠다.
import { cn } from '@/shared/lib/utils';
import { GEN_SERVICES, SUNDAY_PARTS, WEEKDAY_SECTIONS } from './groups';
import { periodLabel, stripPeriod } from './time';

export const RedAgenda = () => (
  <div className="bg-b1-border border-b1-border flex flex-col gap-px overflow-hidden rounded-2xl border">
    {/* 주일 */}
    <div className="bg-b1-surface px-10 py-8">
      <div className="mb-7 flex items-baseline gap-3">
        <span className="size-2.5 rounded-full bg-[#dc2626]" />
        <h3 className="m-0 text-[28px] font-bold text-[#dc2626]">주일</h3>
        <span className="b1-mono text-b1-muted text-[12px] tracking-[0.12em]">
          SUNDAY · 예루살렘성전 3F
        </span>
      </div>

      {/* 1~5부 포스터 행 */}
      <div className="border-b1-border mb-8 grid grid-cols-5 gap-6 border-b pb-8">
        {SUNDAY_PARTS.map((s, i) => (
          <div
            key={s.name}
            className={cn('flex flex-col gap-2 pl-5', i !== 0 && 'border-b1-border border-l')}
          >
            <span className="text-b1-sub text-[15px] font-semibold">{s.name}</span>
            <span className="b1-mono text-[44px] font-bold leading-none tracking-[-0.03em] text-[#dc2626]">
              {stripPeriod(s.time)}
            </span>
            <span className="b1-mono text-b1-muted text-[12px] tracking-[0.1em]">
              {periodLabel(s.time)}
            </span>
          </div>
        ))}
      </div>

      {/* 다음세대 */}
      <h4 className="b1-mono text-b1-sub mb-5 text-[13px] font-bold tracking-[0.12em]">
        다음세대예배
      </h4>
      <div className="grid grid-cols-4 gap-x-8 gap-y-6">
        {GEN_SERVICES.map((s) => (
          <div key={s.name} className="flex items-baseline gap-3">
            <span className="b1-mono text-b1-accent w-[66px] shrink-0 text-[20px] font-bold">
              {stripPeriod(s.time)}
            </span>
            <div>
              <div className="text-b1-text text-[16px] font-semibold">{s.name}</div>
              <div className="text-b1-sub text-[14px]">{s.place}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* 주중·새벽 */}
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
);
