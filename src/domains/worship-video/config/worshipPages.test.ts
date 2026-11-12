import { describe, expect, it } from 'vitest';

import { isWorshipPage, WORSHIP_PAGES } from './worshipPages';

describe('worshipPages', () => {
  it('주일예배는 «주일 예배 설교» 재생목록을 쓴다', () => {
    expect(WORSHIP_PAGES.sunday).toEqual(['PLE3XUsm60vXSn-fvZtoUk-VrDlESt0jDJ']);
  });

  it('모든 페이지에 재생목록이 하나 이상 있고 id 는 유튜브 재생목록 모양이다', () => {
    for (const ids of Object.values(WORSHIP_PAGES)) {
      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) expect(id).toMatch(/^PL[\w-]{16,}$/);
    }
  });

  it('isWorshipPage — 설정에 있는 페이지 이름만 통과(주소 값 검사용)', () => {
    expect(isWorshipPage('sunday')).toBe(true);
    expect(isWorshipPage('nope')).toBe(false);
    expect(isWorshipPage('toString')).toBe(false); // 객체에 원래 있는 이름에 속지 않는다
    expect(isWorshipPage(null)).toBe(false);
    expect(isWorshipPage(undefined)).toBe(false);
  });
});
