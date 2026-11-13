// 서브페이지 머리 글로우 — 속이 빈 반원 "고리" 파면이 한 번 지나가고 두 번째 고리가 안착한다(총 2.2초, 섹션 진입 시 1회).
// 형태: 타원 중심이 레이어 위 바깥(-260px), 바깥 반경 가로 879·세로 554px, 마루는 화면 y≈145~175px. 안쪽은 천천히 차오르고 바깥은 빠르게 빠지는 비대칭 프로파일.
// 고리는 자기 중심에 놓인 큰 상자(1960×1260)에 그리고 그 중심으로 scale 한다 — 상자가 고리보다 커야 호가 잘리지 않는다.
// 모션은 transform·opacity 만(필터 없음). will-change 는 두지 않는다 — 2.2초짜리 1회 모션인데 큰 상자 2장이 층으로 계속 남는다. reduced-motion 에서는 파면은 숨기고 안착 고리만 최종 상태로 둔다.
// 근거: 2026-10-18 section-glow-preview 라운드, 시안 H2(배율 70%) 승격.

const PEAK = 'var(--color-b1-glow)';
const T = (a: number) => `color-mix(in srgb, ${PEAK} ${a}%, transparent)`;
const RING = `radial-gradient(879px 554px at 50% 50%,
  transparent 47%, ${T(13)} 51%, ${T(27)} 57%, ${T(42)} 62%, ${T(58)} 66%, ${T(71)} 70%, ${T(87)} 73%,
  ${T(100)} 77%, ${T(100)} 85%, ${T(71)} 89%, ${T(42)} 92%, ${T(27)} 96%, transparent 100%)`;

const KEYFRAMES = `
  @keyframes b1-glow-pass {0%{transform:scale(.55);opacity:0}25%{opacity:.9}100%{transform:scale(1.18);opacity:0}}
  @keyframes b1-glow-settle {0%{transform:scale(.55);opacity:0}35%{opacity:1}100%{transform:scale(1);opacity:1}}
  .b1-glow-pass{animation:b1-glow-pass 1500ms cubic-bezier(.3,.2,.5,1) both}
  .b1-glow-settle{animation:b1-glow-settle 1700ms cubic-bezier(.16,1,.3,1) 450ms both}
  @media (prefers-reduced-motion: reduce){.b1-glow-pass,.b1-glow-settle{animation:none!important}.b1-glow-pass{opacity:0!important}}
`;

const Ring = ({ className }: { className: string }) => (
  <div
    className={`${className} absolute h-[1260px] w-[1960px]`}
    style={{ background: RING, left: 'calc(50% - 980px)', top: '-890px', transformOrigin: '50% 50%' }}
  />
);

export const HeaderGlow = () => (
  <>
    <style>{KEYFRAMES}</style>
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[600px] overflow-hidden">
      <Ring className="b1-glow-pass" />
      <Ring className="b1-glow-settle" />
    </div>
  </>
);
