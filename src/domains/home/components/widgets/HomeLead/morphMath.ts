// HomeLead 변형 무대의 순수 계산 — 구간 보간, 루프 주기 최단 경로, 전경 사진 연속 정렬. 테스트: morphMath.test.ts

export type Rect = { w: number; h: number; cx: number; cy: number };

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** p 를 구간 [a,b] 안에서 0~1 로 정규화(바깥은 클램프) */
export const seg = (p: number, [a, b]: [number, number]) => clamp01((p - a) / (b - a));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mixRect = (a: Rect, b: Rect, t: number): Rect => ({
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
  cx: lerp(a.cx, b.cx, t),
  cy: lerp(a.cy, b.cy, t),
});
export const fullRect = (vw: number, vh: number): Rect => ({
  w: vw,
  h: vh,
  cx: vw / 2,
  cy: vh / 2,
});

/** v 를 [0,m) 로 접는다 */
export const wrap = (v: number, m: number) => ((v % m) + m) % m;
/** 주기 m 에서 a→b 최단 부호 거리 */
export const shortest = (a: number, b: number, m: number) => {
  let d = wrap(b - a, m);
  if (d > m / 2) d -= m;
  return d;
};

/**
 * 전경 연속 정렬 — 히어로 사진 상자(우측 74%, object-position 55% 50%, cover) 위에, 왼쪽으로 g·vw 만큼 넓힌
 * 전체폭 전경 레이어(cover, 같은 object-position)를 겹치는 변환(origin = 레이어 좌상단). q=0 정렬, q=1 identity.
 */
export const exteriorAlign = (
  q: number,
  vw: number,
  vh: number,
  img: { w: number; h: number },
  g: number
) => {
  const wA = vw * 0.74;
  const sA = Math.max(wA / img.w, vh / img.h);
  const leftA = vw * 0.26 + (wA - img.w * sA) * 0.55;
  const topA = (vh - img.h * sA) * 0.5;
  const bx = -g * vw;
  const bw = (1 + g) * vw;
  const sB = Math.max(bw / img.w, vh / img.h);
  const leftB = bx + (bw - img.w * sB) * 0.55;
  const topB = (vh - img.h * sB) * 0.5;
  const k0 = sA / sB;
  const t = smooth(q);
  const k = k0 + (1 - k0) * t;
  const tx = (leftA - bx - (leftB - bx) * k0) * (1 - t);
  const ty = (topA - topB * k0) * (1 - t);
  return { k, tx, ty };
};
