import { describe, expect, it } from 'vitest';

import { clampPage, pageCount, pageSlice, pageStart } from './clampPage';

describe('pageCount', () => {
  it('항목 수를 쪽당 개수로 나눠 올림', () => {
    expect(pageCount(25, 10)).toBe(3);
  });

  it('0개여도 1쪽', () => {
    expect(pageCount(0, 10)).toBe(1);
  });

  it('쪽당 0개·NaN 처럼 계산이 안 되는 값이면 1쪽(NaN·Infinity 쪽을 만들지 않는다)', () => {
    expect(pageCount(10, 0)).toBe(1);
    expect(pageCount(0, 0)).toBe(1);
    expect(pageCount(Number.NaN, 10)).toBe(1);
  });
});

describe('clampPage', () => {
  it('범위 안의 쪽은 그대로', () => {
    expect(clampPage(3, 50, 10)).toBe(3);
  });

  it('항목이 줄어 사라진 쪽은 마지막 쪽으로 당긴다', () => {
    expect(clampPage(5, 15, 10)).toBe(2);
  });

  it('1보다 작으면 1쪽, 0개여도 1쪽', () => {
    expect(clampPage(0, 50, 10)).toBe(1);
    expect(clampPage(4, 0, 10)).toBe(1);
  });

  it('소수 쪽은 정수로 내린다', () => {
    expect(clampPage(2.5, 50, 10)).toBe(2);
  });

  it('숫자가 아닌 값이 와도 1쪽', () => {
    expect(clampPage(3, 10, 0)).toBe(1);
    expect(clampPage(3, Number.NaN, 10)).toBe(1);
    expect(clampPage(Number.NaN, 50, 10)).toBe(1);
  });
});

describe('pageSlice', () => {
  const list = Array.from({ length: 23 }, (_, i) => i + 1);
  it('그 쪽의 항목만 자른다', () => {
    expect(pageSlice(list, 1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(pageSlice(list, 3, 10)).toEqual([21, 22, 23]);
  });
  it('범위 밖 쪽은 빈 배열', () => {
    expect(pageSlice(list, 4, 10)).toEqual([]);
  });
});

describe('pageStart', () => {
  it('그 쪽 첫 항목의 전체 목록 기준 위치(0부터)', () => {
    expect(pageStart(1, 10)).toBe(0);
    expect(pageStart(3, 10)).toBe(20);
  });
});
