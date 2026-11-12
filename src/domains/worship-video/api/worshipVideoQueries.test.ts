import { describe, expect, it } from 'vitest';

import {
  sermonDescriptionQueryKey,
  sermonLibraryQueryKey,
  toDescription,
  toSermons,
} from './worshipVideoQueries';

const ok = {
  id: 'a',
  title: '제목',
  series: '사도행전 강해',
  no: 66,
  passage: '사도행전 13:4-7',
  date: '2026-10-25',
  dateFrom: 'sermon',
  thumbnail: 'h/a',
  poster: 'x/a',
};

describe('쿼리 키 — 서버 미리 받기와 화면 훅이 같은 키를 쓴다', () => {
  it('예배 페이지별 설교 목록·영상별 설명', () => {
    expect(sermonLibraryQueryKey('sunday')).toEqual(['worship-library', 'sunday']);
    expect(sermonDescriptionQueryKey('sunday', 'v1')).toEqual([
      'worship-description',
      'sunday',
      'v1',
    ]);
  });
});

describe('toSermons', () => {
  it('응답이 배열이 아니면(프록시 오류 봉투 등) 실패로 처리한다 — 화면을 깨뜨리지 않게', () => {
    expect(toSermons([ok])).toEqual([ok]);
    expect(() => toSermons({ items: [] })).toThrow();
    expect(() => toSermons(null)).toThrow();
  });

  it('모양이 맞지 않는 항목은 걸러낸다 — 한 항목 때문에 목록 전체가 깨지지 않게', () => {
    expect(
      toSermons([
        ok,
        null,
        { ...ok, id: '' },
        { ...ok, thumbnail: '' },
        { ...ok, series: '' },
        { ...ok, date: '2026.10.25' }, // 정렬이 깨지는 날짜 모양
        { ...ok, dateFrom: 'guess' },
        { ...ok, no: '66' },
        { ...ok, passage: 3 },
      ])
    ).toEqual([ok]);
  });

  it('회차·본문·절기 이름은 없어도 된다(단편 설교)', () => {
    const single = {
      id: 'b',
      title: '송구영신예배',
      series: '단편 설교',
      occasion: '송구영신예배',
      date: '2024-12-31',
      dateFrom: 'upload',
      thumbnail: 'h/b',
      poster: 'h/b',
    };
    expect(toSermons([single])).toEqual([single]);
  });
});

describe('toDescription', () => {
  it('{ body } 의 글을 꺼낸다 — 빈 설명도 정상', () => {
    expect(toDescription({ body: '본문' })).toBe('본문');
    expect(toDescription({ body: '' })).toBe('');
  });

  it('모양이 다르면 실패', () => {
    expect(() => toDescription({})).toThrow();
    expect(() => toDescription(null)).toThrow();
    expect(() => toDescription({ body: 3 })).toThrow();
  });
});
