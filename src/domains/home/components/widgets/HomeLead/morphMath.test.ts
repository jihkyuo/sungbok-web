import { describe, expect, it } from 'vitest';

import { exteriorAlign, fullRect, mixRect, seg, shortest, smooth, wrap } from './morphMath';

describe('seg / smooth', () => {
  it('seg 는 구간 [a,b] 를 0~1 로 정규화하고 바깥은 클램프한다', () => {
    expect(seg(0.05, [0.05, 0.8])).toBe(0);
    expect(seg(0.8, [0.05, 0.8])).toBe(1);
    expect(seg(0.425, [0.05, 0.8])).toBeCloseTo(0.5);
    expect(seg(-1, [0, 1])).toBe(0);
    expect(seg(2, [0, 1])).toBe(1);
  });
  it('smooth 는 양 끝을 고정하고 중앙은 0.5', () => {
    expect(smooth(0)).toBe(0);
    expect(smooth(1)).toBe(1);
    expect(smooth(0.5)).toBe(0.5);
  });
});

describe('mixRect / fullRect', () => {
  it('t=0 은 a, t=1 은 b, 중간은 선형', () => {
    const a = fullRect(1000, 800);
    const b = { w: 100, h: 50, cx: 300, cy: 200 };
    expect(mixRect(a, b, 0)).toEqual(a);
    expect(mixRect(a, b, 1)).toEqual(b);
    expect(mixRect(a, b, 0.5)).toEqual({ w: 550, h: 425, cx: 400, cy: 300 });
  });
});

describe('wrap / shortest (루프 주기)', () => {
  it('wrap 은 음수도 [0,m) 로 접는다', () => {
    expect(wrap(-10, 100)).toBe(90);
    expect(wrap(250, 100)).toBe(50);
  });
  it('shortest 는 주기 기준 최단 부호 거리', () => {
    expect(shortest(10, 30, 100)).toBe(20);
    expect(shortest(90, 10, 100)).toBe(20); // 앞으로 감는 게 짧다
    expect(shortest(10, 90, 100)).toBe(-20); // 뒤로 감는 게 짧다
  });
});

describe('exteriorAlign (전경 연속 정렬)', () => {
  // 히어로 사진 상자: 우측 74%, object-position 55% 50%, cover. 전체폭 레이어는 왼쪽 g 만큼 넓힘.
  const img = { w: 1920, h: 937 };
  it('q=1 이면 identity', () => {
    const r = exteriorAlign(1, 1440, 900, img, 0.24);
    expect(r.k).toBeCloseTo(1);
    expect(r.tx).toBeCloseTo(0);
    expect(r.ty).toBeCloseTo(0);
  });
  it('q=0 이면 레이어 안의 사진이 히어로 사진 상자와 같은 배율·위치가 된다', () => {
    const vw = 1440;
    const vh = 900;
    const g = 0.24;
    const { k, tx, ty } = exteriorAlign(0, vw, vh, img, g);
    // 레이어 상자 B
    const bx = -g * vw;
    const bw = (1 + g) * vw;
    const sB = Math.max(bw / img.w, vh / img.h);
    const leftB = bx + (bw - img.w * sB) * 0.55;
    const topB = (vh - img.h * sB) * 0.5;
    // 히어로 상자 A
    const wA = vw * 0.74;
    const sA = Math.max(wA / img.w, vh / img.h);
    const leftA = vw * 0.26 + (wA - img.w * sA) * 0.55;
    const topA = (vh - img.h * sA) * 0.5;
    // 변환 후 사진 배율·좌상단(origin = 레이어 좌상단 bx,0)
    expect(sB * k).toBeCloseTo(sA);
    expect(bx + tx + (leftB - bx) * k).toBeCloseTo(leftA);
    expect(ty + topB * k).toBeCloseTo(topA);
  });
});
