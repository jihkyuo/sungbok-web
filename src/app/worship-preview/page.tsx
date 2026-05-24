// 임시 시안 비교 페이지 — 데스크톱 WorshipTimes 레이아웃 탐색용. 확정 후 삭제.
import { BigSectionHeaders } from '@/domains/home/components/widgets/WorshipTimes/_variants/BigSectionHeaders';
import { HorizontalTimeline } from '@/domains/home/components/widgets/WorshipTimes/_variants/HorizontalTimeline';
import { TicketStub } from '@/domains/home/components/widgets/WorshipTimes/_variants/TicketStub';
import { TimeGenMatrix } from '@/domains/home/components/widgets/WorshipTimes/_variants/TimeGenMatrix';
import { TwoPanel } from '@/domains/home/components/widgets/WorshipTimes/_variants/TwoPanel';
import { WeekCalendar } from '@/domains/home/components/widgets/WorshipTimes/_variants/WeekCalendar';

const VARIANTS = [
  { id: 'I5', tag: '킵', name: '가로 타임라인 (킵)', el: <HorizontalTimeline /> },
  { id: 'K1', tag: '신규', name: '주간 캘린더 (일~토)', el: <WeekCalendar /> },
  { id: 'K2', tag: '신규', name: '티켓 스텁 카드', el: <TicketStub /> },
  { id: 'K3', tag: '신규', name: '빅 섹션 헤더', el: <BigSectionHeaders /> },
  { id: 'K4', tag: '신규', name: '2-업 패널 (장년 | 다음세대)', el: <TwoPanel /> },
  { id: 'K5', tag: '신규', name: '시간×세대 매트릭스', el: <TimeGenMatrix /> },
];

const tagClass = (tag: string) => {
  const base = 'b1-mono rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em]';
  return tag === '킵' ? `${base} bg-b1-accent text-white` : `${base} bg-b1-placeholder text-b1-muted`;
};

export default function WorshipPreviewPage() {
  return (
    <main className="bg-b1-bg min-h-screen px-10 py-12">
      <h1 className="text-b1-text mb-2 text-[28px] font-bold tracking-[-0.02em]">
        WorshipTimes 데스크톱 시안 — 8차 (킵 I5 + 신규 5종)
      </h1>
      <p className="text-b1-sub mb-10 text-[14px]">
        맨 위는 킵한 I5(비교용). 아래 K1~K5가 이번 신규. 공통 규칙 전부 유지.
      </p>
      {VARIANTS.map((v) => (
        <section key={v.id} id={`variant-${v.id}`} className="mb-16">
          <div className="mb-4 flex items-center gap-3">
            <span className="bg-b1-text text-b1-bg flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-[14px] font-bold">
              {v.id}
            </span>
            <h2 className="text-b1-text m-0 text-[18px] font-bold">{v.name}</h2>
            <span className={tagClass(v.tag)}>{v.tag}</span>
          </div>
          {v.el}
        </section>
      ))}
    </main>
  );
}
