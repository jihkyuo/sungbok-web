// 시안 E4 — 레드 세로 포스터 컬럼 + 다음세대 그리드 + 주중 스트립.
// 주일을 좌측 딥레드 컬럼(부 세로 나열, 큰 숫자), 우측은 다음세대 그리드. 주중은 3등분 스트립.
import { GEN_SERVICES, SUNDAY_PARTS, WEEKDAY_SECTIONS } from './groups';
import { stripPeriod } from './time';

export const RedSplitPoster = () => (
  <div className="flex flex-col gap-6">
    {/* 주일: 레드 포스터 컬럼 + 다음세대 */}
    <div className="border-b1-border grid grid-cols-[320px_1fr] overflow-hidden rounded-2xl border">
      <div className="bg-[#b91c1c] px-8 py-8 text-white">
        <h3 className="m-0 text-[24px] font-bold">주일예배</h3>
        <span className="b1-mono text-[12px] tracking-[0.12em] text-white/55">
          SUNDAY · 예루살렘성전 3F
        </span>
        <ul className="mt-7 flex list-none flex-col gap-0 p-0">
          {SUNDAY_PARTS.map((s, i) => (
            <li
              key={s.name}
              className={`flex items-baseline justify-between py-3.5 ${i !== 0 ? 'border-t border-white/15' : ''}`}
            >
              <span className="text-[16px] font-semibold text-white/80">{s.name}</span>
              <span className="b1-mono text-[28px] font-bold leading-none">{stripPeriod(s.time)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-b1-surface px-9 py-8">
        <h4 className="b1-mono text-b1-sub mb-6 text-[13px] font-bold tracking-[0.12em]">
          다음세대예배 · 주일
        </h4>
        <div className="grid grid-cols-2 gap-x-10 gap-y-6">
          {GEN_SERVICES.map((s) => (
            <div key={s.name} className="flex items-baseline gap-3">
              <span className="b1-mono text-b1-accent w-[70px] shrink-0 text-[22px] font-bold">
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
    </div>

    {/* 주중·새벽 스트립 */}
    <div className="bg-b1-border border-b1-border grid grid-cols-3 gap-px overflow-hidden rounded-2xl border">
      {WEEKDAY_SECTIONS.map((sec) => (
        <div key={sec.day} className="bg-b1-surface px-7 py-6">
          <h4 className="text-b1-text m-0 text-[19px] font-bold">{sec.day}</h4>
          <span className="b1-mono text-b1-muted text-[11px] tracking-[0.12em]">{sec.sub}</span>
          <ul className="mt-5 flex list-none flex-col gap-3.5 p-0">
            {sec.services.map((s) => (
              <li key={s.name} className="flex items-baseline gap-3">
                <span className="b1-mono text-b1-accent text-[20px] font-bold">{s.time}</span>
                <div>
                  <div className="text-b1-text text-[15px] font-semibold">
                    {s.name}
                    {s.note && (
                      <span className="text-b1-muted ml-1 text-[11px] font-normal">{s.note}</span>
                    )}
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
