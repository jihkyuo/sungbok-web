// 시안 I4 — 악센트 라인 리스트. 각 행 좌측 컬러 룰 + 큰 시간 + 이름/장소. 모던·타이포 중심.
// 장년=진한 룰, 다음세대=연한 룰로 구분(빨강 아님). 빨강은 '주일' 글자만.
import type { WorshipServiceSummary } from '@/domains/home/data/worshipTimes';
import { cn } from '@/shared/lib/utils';
import { GEN_SERVICES, SUNDAY_PARTS, WEEKDAY_SERVICES } from './groups';

const Item = ({ s, rule }: { s: WorshipServiceSummary; rule: 'strong' | 'soft' }) => (
  <div className="flex items-stretch gap-4">
    <span
      className={cn('w-[3px] shrink-0 rounded-full', rule === 'strong' ? 'bg-b1-accent' : 'bg-b1-accent2/45')}
    />
    <div className="flex flex-1 items-baseline gap-4 py-1">
      <span className="b1-mono text-b1-text w-[104px] shrink-0 text-[20px] font-bold tracking-[-0.01em]">
        {s.time}
      </span>
      <div>
        <div className="text-b1-text text-[17px] font-semibold">
          {s.name}
          {s.note && <span className="text-b1-muted ml-1.5 text-[12px] font-normal">{s.note}</span>}
        </div>
        <div className="text-b1-sub text-[14px]">{s.place}</div>
      </div>
    </div>
  </div>
);

const Group = ({ title, red, children }: { title: React.ReactNode; red?: boolean; children: React.ReactNode }) => (
  <div>
    <div className="mb-4 flex items-baseline gap-2.5">
      {red && <span className="size-2.5 self-center rounded-full bg-[#dc2626]" />}
      <h3 className="text-b1-text m-0 text-[19px] font-bold">{title}</h3>
    </div>
    <div className="flex flex-col gap-3.5">{children}</div>
  </div>
);

export const AccentRuleList = () => (
  <div className="bg-b1-surface border-b1-border flex flex-col gap-8 rounded-2xl border px-9 py-8">
    <Group red title={<><span className="text-[#dc2626]">주일</span>예배 <span className="text-b1-sub text-[13px] font-normal">· 1~5부</span></>}>
      {SUNDAY_PARTS.map((s) => (
        <Item key={s.name} s={s} rule="strong" />
      ))}
    </Group>

    <Group title={<>다음세대예배 <span className="text-b1-sub text-[13px] font-normal">· 주일</span></>}>
      <div className="grid grid-cols-2 gap-x-10 gap-y-3.5">
        {GEN_SERVICES.map((s) => (
          <Item key={s.name} s={s} rule="soft" />
        ))}
      </div>
    </Group>

    <Group title="주중·새벽예배">
      <div className="grid grid-cols-2 gap-x-10 gap-y-3.5">
        {WEEKDAY_SERVICES.map((s) => (
          <Item key={s.name} s={s} rule="strong" />
        ))}
      </div>
    </Group>
  </div>
);
