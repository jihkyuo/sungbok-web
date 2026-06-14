// 결정론적 별밭/성운 생성기 (Math.random 미사용 → SSR 하이드레이션 불일치 없음).

export interface Star {
  x: number; // %
  y: number; // %
  s: number; // px
  d: number; // twinkle delay (s)
  o: number; // base opacity
  dur: number; // twinkle duration (s) — 별마다 다른 반짝임 속도
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
    dur: 2.6 + rnd(i, seed + 5) * 4.2,
  }));
}

/** 은하수 띠 — 대각선(base + x*slope)을 따라 별이 밀집한 군집. "진짜 밤하늘" 시그니처. */
export function bandField(
  count: number,
  seed: number,
  slope = 0.42,
  base = 16,
  thickness = 22,
): Star[] {
  return Array.from({ length: count }, (_, i) => {
    const x = rnd(i, seed) * 100;
    const y = base + x * slope + (rnd(i, seed + 1) - 0.5) * thickness;
    return {
      x,
      y: Math.max(0, Math.min(100, y)),
      s: 0.4 + rnd(i, seed + 2) * 1.1,
      d: rnd(i, seed + 3) * 4,
      o: 0.25 + rnd(i, seed + 4) * 0.5,
      dur: 2.6 + rnd(i, seed + 5) * 4.2,
    };
  });
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
