// 임시 시안 비교 페이지 — 데스크톱 WorshipTimes 레이아웃 탐색용. 확정 후 삭제.
import { DayAgenda } from '@/domains/home/components/widgets/WorshipTimes/_variants/DayAgenda';
import { RedAgenda } from '@/domains/home/components/widgets/WorshipTimes/_variants/RedAgenda';
import { RedPosterAgenda } from '@/domains/home/components/widgets/WorshipTimes/_variants/RedPosterAgenda';
import { RedSplitPoster } from '@/domains/home/components/widgets/WorshipTimes/_variants/RedSplitPoster';

const VARIANTS = [
  { id: 'E', tag: '기존', name: '요일별 아젠다 (기존)', el: <DayAgenda /> },
  { id: 'E2', tag: '레드+포스터', name: '레드 포스터 헤드 + 아젠다', el: <RedPosterAgenda /> },
  { id: 'E3', tag: '레드+포스터', name: '빅 레드 타이포 (화이트)', el: <RedAgenda /> },
  { id: 'E4', tag: '레드+포스터', name: '레드 세로 포스터 + 스트립', el: <RedSplitPoster /> },
];

const tagClass = (tag: string) => {
  const base = 'b1-mono rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em]';
  if (tag === '기존') return `${base} bg-b1-placeholder text-b1-muted`;
  return `${base} bg-[#b91c1c] text-white`;
};

export default function WorshipPreviewPage() {
  return (
    <main className="bg-b1-bg min-h-screen px-10 py-12">
      <h1 className="text-b1-text mb-2 text-[28px] font-bold tracking-[-0.02em]">
        WorshipTimes 데스크톱 시안 — 3차 (E 발전형)
      </h1>
      <p className="text-b1-sub mb-10 text-[14px]">
        붉은 주일 강조 · 1~5부 포스터 · 텍스트 확대 · 장소 진하게. 맨 위는 비교용 기존 E.
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
