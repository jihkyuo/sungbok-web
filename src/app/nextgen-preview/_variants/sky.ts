// 임시 시안 전용 — 확정 후 nextgen-preview 폴더째 삭제.
// 결정론적 별밭/성운 생성기 (Math.random 미사용 → SSR 하이드레이션 불일치 없음).

export interface Star {
  x: number; // %
  y: number; // %
  s: number; // px
  d: number; // twinkle delay (s)
  o: number; // base opacity
}

/** sine 해시 기반 결정론적 의사난수 0~1 */
const rnd = (i: number, seed: number) => {
  const v = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

/** 한 깊이 층의 별밭 */
export function starField(count: number, seed: number, sizeMin: number, sizeMax: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    x: rnd(i, seed) * 100,
    y: rnd(i, seed + 1) * 100,
    s: sizeMin + rnd(i, seed + 2) * (sizeMax - sizeMin),
    d: rnd(i, seed + 3) * 4,
    o: 0.4 + rnd(i, seed + 4) * 0.6,
  }));
}

export interface Blob {
  x: number;
  y: number;
  size: number; // vw
  color: string;
}

/** 성운 구름 — 색 배열을 순환 배치 */
export function nebula(seed: number, colors: string[], count = colors.length): Blob[] {
  return Array.from({ length: count }, (_, i) => ({
    x: rnd(i, seed) * 100,
    y: 14 + rnd(i, seed + 1) * 64,
    size: 30 + rnd(i, seed + 2) * 26,
    color: colors[i % colors.length],
  }));
}

/** translate3d 시차 표현식 (CSS 변수 기반, 리렌더 없이 매끄럽게) */
export const px = (f: number) =>
  `translate3d(calc(var(--px,0) * ${f}px), calc(var(--py,0) * ${f}px), 0)`;
