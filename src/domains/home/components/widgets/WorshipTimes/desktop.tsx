import {
  isGenService,
  periodKo,
  stripPeriod,
  SUNDAY_TIMES,
  sundayAt,
  WEEKDAY_SECTIONS,
  type WorshipServiceSummary,
} from '@/domains/home/data/worshipTimes';
import { Reveal } from '@/shared/components/features/Reveal';
import { cn } from '@/shared/lib/utils';

const cols = { gridTemplateColumns: `repeat(${SUNDAY_TIMES.length}, minmax(0, 1fr))` };

const SundayHeader = () => (
  <div className="flex items-center gap-3">
    <span className="bg-b1-sunday h-8 w-[5px] rounded-full" />
    <h3 className="text-b1-sunday m-0 text-[32px] font-bold tracking-[-0.01em]">주일</h3>
  </div>
);

/** genOnly: 그 시각에 다음세대 예배만 있음 → 테두리 없이 연한 채움으로 구분 */
const TimePill = ({ time, genOnly }: { time: string; genOnly: boolean }) => (
  <span
    className={cn(
      'text-b1-accent b1-mono flex items-baseline gap-1.5 rounded-full border-2 px-4 py-1.5 text-title font-bold',
      genOnly ? 'bg-b1-accent-soft border-transparent' : 'bg-b1-surface border-b1-accent'
    )}
  >
    <span className="text-caption">{periodKo(time)}</span>
    {stripPeriod(time)}
  </span>
);

/** 레인 라벨 + 가로 구분선 */
const LaneLabel = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-b1-sub text-caption font-semibold whitespace-nowrap">{label}</span>
    <span className="bg-b1-border h-px flex-1" />
  </div>
);

const ServiceCard = ({ service }: { service: WorshipServiceSummary }) => {
  const gen = isGenService(service);
  return (
    <div
      className={cn(
        'rounded-xl px-4 py-3 text-center',
        gen ? 'bg-b1-accent-soft' : 'bg-b1-bg border-b1-border border'
      )}
    >
      <div className={cn('text-body-sm font-semibold', gen ? 'text-b1-accent' : 'text-b1-text')}>
        {service.name}
      </div>
      <div className="text-b1-sub text-caption">{service.place}</div>
    </div>
  );
};

const WeekdayStrip = () => (
  <div className="bg-b1-border border-b1-border grid grid-cols-3 gap-px overflow-hidden rounded-2xl border">
    {WEEKDAY_SECTIONS.map((sec) => (
      <div key={sec.day} className="bg-b1-surface px-7 py-6">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="bg-b1-accent h-5 w-[4px] rounded-full" />
          <h4 className="text-b1-text m-0 text-[19px] font-bold">{sec.day}</h4>
        </div>
        <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
          {sec.services.map((s) => (
            <li key={s.name} className="flex items-baseline gap-3">
              <span className="b1-mono text-b1-accent text-title font-bold whitespace-nowrap">
                {s.time}
              </span>
              <div>
                <div className="text-b1-text text-body-sm font-semibold">
                  {s.name}
                  {s.note && (
                    <span className="text-b1-muted ml-1 text-caption font-normal">{s.note}</span>
                  )}
                </div>
                <div className="text-b1-sub text-caption">{s.place}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

export const WorshipTimesDesktop = () => {
  return (
    <div className="flex flex-col gap-6">
      <Reveal className="bg-b1-surface border-b1-border rounded-2xl border px-8 py-7">
        <SundayHeader />

        {/* 정류장 선 + 핀 */}
        <div className="relative my-9">
          <div className="bg-b1-accent absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full" />
          <div className="relative grid" style={cols}>
            {SUNDAY_TIMES.map((t) => (
              <div key={t} className="flex justify-center">
                <TimePill time={t} genOnly={sundayAt(t).every(isGenService)} />
              </div>
            ))}
          </div>
        </div>

        {/* 1행 = 장년 주일 N부 전용. 장년 예배가 없는 시각(오후 2:00)은 비워 둔다 */}
        <LaneLabel label="장년" />
        <div className="mt-3 grid items-start gap-x-4" style={cols}>
          {SUNDAY_TIMES.map((t) => (
            <div key={t} className="flex flex-col gap-2.5">
              {sundayAt(t)
                .filter((s) => !isGenService(s))
                .map((s) => (
                  <ServiceCard key={s.name} service={s} />
                ))}
            </div>
          ))}
        </div>

        {/* 2행 이하 = 다음세대 전용 */}
        <div className="mt-6">
          <LaneLabel label="다음세대" />
        </div>
        <div className="mt-3 grid items-start gap-x-4" style={cols}>
          {SUNDAY_TIMES.map((t) => (
            <div key={t} className="flex flex-col gap-2.5">
              {sundayAt(t)
                .filter(isGenService)
                .map((s) => (
                  <ServiceCard key={s.name} service={s} />
                ))}
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={80}>
        <WeekdayStrip />
      </Reveal>
    </div>
  );
};
