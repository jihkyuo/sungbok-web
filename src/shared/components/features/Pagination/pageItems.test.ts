import { describe, expect, it } from 'vitest';

import { pageItems, type PageItem } from './pageItems';

// 칸을 짧은 글자로 — 숫자는 쪽, «<» «>» 는 앞·뒤 건너뛰기. 괄호는 휴대폰에서 숨는 칸, 대괄호는 휴대폰에서만 보이는 칸.
const show = (items: PageItem[]) =>
  items
    .map(it => {
      const label = it.kind === 'page' ? String(it.page) : it.kind === 'jump-back' ? '<' : '>';
      if (it.desktop && it.mobile) return label;
      return it.desktop ? `(${label})` : `[${label}]`;
    })
    .join(' ');

const desktop = (items: PageItem[]) => items.filter(it => it.desktop);
const mobile = (items: PageItem[]) => items.filter(it => it.mobile);

describe('pageItems', () => {
  it('5쪽 이하는 PC·휴대폰 모두 전부 보인다', () => {
    expect(show(pageItems(5, 3))).toBe('1 2 3 4 5');
  });

  it('가운데 쪽: PC 는 지금 ±2, 휴대폰은 지금 쪽만 — 양쪽 건너뛰기는 함께', () => {
    expect(show(pageItems(12, 6))).toBe('1 < (4) (5) 6 (7) (8) > 12');
  });

  it('휴대폰은 화살표 포함 7칸 이하 — 375px 한 줄(44px 칸)에 들어간다', () => {
    for (let total = 1; total <= 30; total++) {
      for (let page = 1; page <= total; page++) {
        expect(mobile(pageItems(total, page)).length).toBeLessThanOrEqual(5);
      }
    }
  });

  it('PC 에서 건너뛰기가 없어도 휴대폰에서 쪽이 가려지면 휴대폰 전용 건너뛰기를 둔다', () => {
    // PC: 1 2 3 4 5 6 > 20 / 휴대폰: 1 < 4 > 20
    expect(show(pageItems(20, 4))).toBe('1 [<] (2) (3) 4 (5) (6) > 20');
  });

  it('건너뛰기가 한 쪽만 가리게 되면 그 쪽 번호를 보인다(PC·휴대폰 같은 규칙)', () => {
    expect(show(pageItems(20, 3))).toBe('1 2 3 (4) (5) > 20');
    expect(show(pageItems(20, 18))).toBe('1 < (16) (17) 18 19 20');
  });

  it('첫 쪽·끝 쪽', () => {
    expect(show(pageItems(10, 1))).toBe('1 (2) (3) > 10');
    expect(show(pageItems(10, 10))).toBe('1 < (8) (9) 10');
  });

  it('PC 칸은 예전 규칙 그대로 — 1 … (지금 ±2) … 끝', () => {
    const pages = (items: PageItem[]) =>
      desktop(items).map(it => (it.kind === 'page' ? it.page : it.kind));
    expect(pages(pageItems(20, 5))).toEqual([1, 2, 3, 4, 5, 6, 7, 'jump-forward', 20]);
    expect(pages(pageItems(20, 10))).toEqual([
      1,
      'jump-back',
      8,
      9,
      10,
      11,
      12,
      'jump-forward',
      20,
    ]);
  });
});
