// 임시 시안 비교 페이지 — 헤더 네비게이션 독(Dock) 탐색용. 확정 후 삭제.
import { DockCapsule } from '@/shared/components/layout/Header/_variants/DockCapsule';

const worship = [
  ['주일 1부', '오전 9시 · 본당'],
  ['주일 2부', '오전 11시 · 본당'],
  ['주일 오후', '오후 2시 · 비전홀'],
];
const nextGen = [
  ['영아·유아부', '예배와 돌봄'],
  ['유초등부', '주일 오전'],
  ['청소년부', '주일 오후'],
];

export default function NavPreviewPage() {
  return (
    <div className="bg-b1-bg min-h-screen">
      {/* 이 임시 페이지에서만 글로벌 헤더/푸터를 숨겨 독을 단독 평가 */}
      <style>{`header.sticky{display:none!important}body>footer,footer{display:none!important}`}</style>

      <DockCapsule />

      {/* 히어로 — 글래스 위 반투명 확인용 */}
      <section className="b1-lead-gradient flex min-h-[560px] flex-col justify-center px-[8vw]">
        <p className="text-b1-sub mb-3 text-[12px] font-bold tracking-[0.18em] uppercase opacity-70">
          Sungbok Church
        </p>
        <h1 className="text-b1-text max-w-[640px] text-[46px] leading-[1.16] font-extrabold tracking-[-0.03em]">
          하나님의 은혜 안에서
          <br />
          함께 자라가는 공동체
        </h1>
        <p className="text-b1-sub mt-[18px] max-w-[460px] text-[16px] leading-[1.6]">
          스크롤을 내려보세요 — 캡슐이 히어로 위 반투명에서 또렷한 솔리드로 전환됩니다. 메뉴에 마우스를
          올리면 인디케이터가 따라 움직입니다.
        </p>
      </section>

      {/* 콘텐츠 (스크롤 거리 확보) */}
      <section className="px-[8vw] py-16">
        <h2 className="text-b1-text mb-6 text-[26px] font-extrabold tracking-[-0.02em]">예배 안내</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {worship.map(([t, s]) => (
            <div
              key={t}
              className="border-b1-border bg-b1-surface min-h-[160px] rounded-[14px] border p-7"
            >
              <h3 className="text-b1-text mb-2.5 text-[17px] font-bold">{t}</h3>
              <p className="text-b1-sub text-[14px]">{s}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-b1-surface border-b1-border border-t px-[8vw] py-16">
        <h2 className="text-b1-text mb-6 text-[26px] font-extrabold tracking-[-0.02em]">다음세대</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {nextGen.map(([t, s]) => (
            <div
              key={t}
              className="border-b1-border bg-b1-bg min-h-[160px] rounded-[14px] border p-7"
            >
              <h3 className="text-b1-text mb-2.5 text-[17px] font-bold">{t}</h3>
              <p className="text-b1-sub text-[14px]">{s}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
