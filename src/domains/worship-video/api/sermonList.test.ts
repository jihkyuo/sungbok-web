import { describe, expect, it } from 'vitest';

import {
  buildSeries,
  dateLabel,
  filterSermons,
  highlightParts,
  listRows,
  neighbors,
  searchKey,
  seriesByYear,
  seriesSermons,
  sermonTag,
  sortSermons,
  topSeries,
  weekdayLabel,
} from './sermonList';
import { SINGLES } from './sermonParse';
import type { Sermon } from './worshipVideo.types';

const s = (over: Partial<Sermon> & Pick<Sermon, 'id'>): Sermon => ({
  title: `제목 ${over.id}`,
  series: SINGLES,
  date: '2026-01-01',
  dateFrom: 'sermon',
  thumbnail: `t/${over.id}`,
  poster: `p/${over.id}`,
  ...over,
});

// 최신순(서버가 주는 순서)
const LIB: Sermon[] = sortSermons([
  s({ id: 'a66', series: '사도행전 강해', no: 66, date: '2026-10-25', passage: '사도행전 13:4-7' }),
  s({ id: 'a65', series: '사도행전 강해', no: 65, date: '2026-10-18', passage: '사도행전 13:4-5' }),
  s({ id: 'h7', series: '죽음, 그리고 천국과 지옥', no: 7, date: '2026-07-12', title: '내세' }),
  s({ id: 'one1', occasion: '성찬식', date: '2026-11-01', passage: '사도행전 2:42-47' }),
  s({
    id: 'a12',
    series: '사도행전 강해',
    no: 12,
    date: '2025-04-27',
    passage: '사도행전 12:23-25',
  }),
  // 설명에 설교일이 없어 업로드 날짜를 쓴 편
  s({ id: 'a1', series: '사도행전 강해', no: 1, date: '2025-02-02', dateFrom: 'upload' }),
  s({
    id: 'm151',
    series: '마태복음강해',
    no: 151,
    date: '2025-01-26',
    passage: '마태복음 28:16-20',
  }),
  s({ id: 'm150', series: '마태복음강해', no: 150, date: '2025-01-19' }),
  s({ id: 'one0', date: '2024-12-31', title: '송구영신예배' }),
]);
const ids = (list: Sermon[]) => list.map(x => x.id);

describe('sortSermons', () => {
  it('날짜 최신순, 같은 날은 회차 큰 순 — 원본은 바꾸지 않는다', () => {
    const input = [
      s({ id: 'x1', no: 1, date: '2026-01-04' }),
      s({ id: 'y', date: '2026-01-11' }),
      s({ id: 'x2', no: 2, date: '2026-01-04' }),
    ];
    expect(ids(sortSermons(input))).toEqual(['y', 'x2', 'x1']);
    expect(ids(input)).toEqual(['x1', 'y', 'x2']);
  });
});

describe('searchKey', () => {
  it('«N장»·«N장 M절» 을 본문 표기(N: · N:M)로 바꾼다 — 빈 결과 안내문이 권하는 검색', () => {
    expect(searchKey('12장')).toBe('12:');
    expect(searchKey('사도행전 13장 4절')).toBe('사도행전 13:4');
    expect(searchKey('13장4')).toBe('13:4');
    expect(searchKey('  Acts  ')).toBe('acts');
  });
});

describe('filterSermons', () => {
  const all = { q: '', series: '', sort: 'new' as const };

  it('조건이 없으면 전체를 최신순 그대로', () => {
    expect(ids(filterSermons(LIB, all))).toEqual(ids(LIB));
    expect(ids(LIB)[0]).toBe('one1');
  });

  it('오래된 순 — 설교일과 업로드 날짜가 섞여도 날짜 순(15편 다음 144편이 오지 않는다)', () => {
    expect(ids(filterSermons(LIB, { ...all, sort: 'old' }))).toEqual([
      'one0',
      'm150',
      'm151',
      'a1',
      'a12',
      'h7',
      'a65',
      'a66',
      'one1',
    ]);
  });

  it('시리즈로 거른다 — 단편 설교도 하나의 분류', () => {
    expect(ids(filterSermons(LIB, { ...all, series: '마태복음강해' }))).toEqual(['m151', 'm150']);
    expect(ids(filterSermons(LIB, { ...all, series: SINGLES }))).toEqual(['one1', 'one0']);
  });

  it('검색 — 제목·본문·시리즈·회차·절기 이름, 대소문자·앞뒤 공백 무시', () => {
    expect(ids(filterSermons(LIB, { ...all, q: '내세' }))).toEqual(['h7']);
    expect(ids(filterSermons(LIB, { ...all, q: '마태복음 28' }))).toEqual(['m151']);
    expect(ids(filterSermons(LIB, { ...all, q: '천국과 지옥' }))).toEqual(['h7']);
    expect(ids(filterSermons(LIB, { ...all, q: '66편' }))).toEqual(['a66']);
    expect(ids(filterSermons(LIB, { ...all, q: '성찬식' }))).toEqual(['one1']);
    expect(ids(filterSermons(LIB, { ...all, q: '   ' }))).toEqual(ids(LIB));
  });

  it('«12장»·«13장 4절» 로 본문을 찾는다', () => {
    expect(ids(filterSermons(LIB, { ...all, q: '12장' }))).toEqual(['a12']);
    expect(ids(filterSermons(LIB, { ...all, q: '사도행전 13장 4절' }))).toEqual(['a66', 'a65']);
  });

  it('본문 표기의 «:» 앞뒤 공백이 달라도 찾는다(«10: 8-13»)', () => {
    const spaced = [s({ id: 'sp', date: '2026-01-01', passage: '마태복음 10: 8-13' })];
    expect(ids(filterSermons(spaced, { ...all, q: '마태복음 10장 8절' }))).toEqual(['sp']);
    expect(ids(filterSermons(spaced, { ...all, q: '10:8' }))).toEqual(['sp']);
    expect(ids(filterSermons(spaced, { ...all, q: '10 : 8' }))).toEqual(['sp']);
  });

  it('«2장» 으로 12장·22장이 걸리지 않는다 — 장 번호는 숫자 경계로 맞춘다', () => {
    const lib = [
      s({ id: 'c2', date: '2026-01-03', passage: '사도행전 2:1-13' }),
      s({ id: 'c12', date: '2026-01-02', passage: '사도행전 12:1-5' }),
      s({ id: 'c22', date: '2026-01-01', passage: '사도행전 22:3' }),
    ];
    expect(ids(filterSermons(lib, { ...all, q: '2장' }))).toEqual(['c2']);
    expect(ids(filterSermons(lib, { ...all, q: '사도행전 12장' }))).toEqual(['c12']);
  });

  it('범위로 친 검색(«12장 1-5절»)과 «N장 M절» 로 적힌 본문도 찾는다', () => {
    const lib = [
      s({ id: 'colon', date: '2026-01-02', passage: '사도행전 12:1-5' }),
      s({ id: 'jang', date: '2026-01-01', passage: '사도행전 5장 1-11절' }),
    ];
    expect(ids(filterSermons(lib, { ...all, q: '사도행전 12장 1-5절' }))).toEqual(['colon']);
    expect(ids(filterSermons(lib, { ...all, q: '5:1' }))).toEqual(['jang']);
    expect(ids(filterSermons(lib, { ...all, q: '5장 1절' }))).toEqual(['jang']);
  });

  it('0편(서론)도 회차로 찾힌다', () => {
    const lib = [s({ id: 'z', date: '2026-01-01', series: '사도행전 강해', no: 0 })];
    expect(ids(filterSermons(lib, { ...all, q: '0편' }))).toEqual(['z']);
    expect(sermonTag(lib[0])).toBe('사도행전 강해 0편');
  });

  it('검색과 시리즈를 함께 — 결과가 없으면 빈 배열', () => {
    expect(ids(filterSermons(LIB, { q: '13장', series: '사도행전 강해', sort: 'old' }))).toEqual([
      'a65',
      'a66',
    ]);
    expect(filterSermons(LIB, { ...all, q: '없는 말' })).toEqual([]);
  });
});

describe('buildSeries', () => {
  it('최근 편이 있는 시리즈부터, 단편 설교는 날짜와 상관없이 맨 뒤', () => {
    expect(buildSeries(LIB)).toEqual([
      { name: '사도행전 강해', count: 4, latest: '2026-10-25', thumbnail: 't/a66' },
      { name: '죽음, 그리고 천국과 지옥', count: 1, latest: '2026-07-12', thumbnail: 't/h7' },
      { name: '마태복음강해', count: 2, latest: '2025-01-26', thumbnail: 't/m151' },
      { name: SINGLES, count: 2, latest: '2026-11-01', thumbnail: 't/one1' },
    ]);
  });

  it('빈 목록이면 빈 배열', () => {
    expect(buildSeries([])).toEqual([]);
  });
});

describe('seriesSermons', () => {
  it('그 시리즈의 편만 최신순으로', () => {
    expect(ids(seriesSermons(LIB, '사도행전 강해'))).toEqual(['a66', 'a65', 'a12', 'a1']);
    expect(seriesSermons(LIB, '없는 시리즈')).toEqual([]);
  });
});

describe('topSeries', () => {
  const series = buildSeries([
    ...LIB,
    s({ id: 'g3', series: '거룩한 동행', no: 3, date: '2025-11-02' }),
    s({ id: 'f3', series: '진리 위에 세우는 가정', no: 3, date: '2026-05-10' }),
  ]);
  const names = (l: { name: string }[]) => l.map(x => x.name);

  it('최근 시리즈 4개', () => {
    expect(names(topSeries(series, '사도행전 강해'))).toEqual([
      '사도행전 강해',
      '죽음, 그리고 천국과 지옥',
      '진리 위에 세우는 가정',
      '거룩한 동행',
    ]);
  });

  it('보고 있는 시리즈가 4개 안에 없으면 마지막 자리에 넣는다 — 고른 칩이 줄에서 사라지지 않게', () => {
    expect(names(topSeries(series, SINGLES))).toEqual([
      '사도행전 강해',
      '죽음, 그리고 천국과 지옥',
      '진리 위에 세우는 가정',
      SINGLES,
    ]);
    expect(names(topSeries(series, '없는 시리즈'))).toHaveLength(4);
  });

  it('시리즈가 4개보다 적으면 있는 만큼', () => {
    expect(names(topSeries(series.slice(0, 2), '사도행전 강해'))).toHaveLength(2);
  });
});

describe('seriesByYear', () => {
  it('최근 편의 연도로 묶어 최근 연도부터, 단편 설교는 맨 뒤 묶음', () => {
    expect(
      seriesByYear(buildSeries(LIB)).map(([label, list]) => [label, list.map(x => x.name)])
    ).toEqual([
      ['2026년', ['사도행전 강해', '죽음, 그리고 천국과 지옥']],
      ['2025년', ['마태복음강해']],
      ['단편', [SINGLES]],
    ]);
  });
});

describe('neighbors', () => {
  it('같은 시리즈 안의 이전(오래된)·다음(최신) 편', () => {
    expect(neighbors(LIB, 'a65')).toEqual({
      older: LIB.find(x => x.id === 'a12'),
      newer: LIB.find(x => x.id === 'a66'),
    });
  });

  it('첫 편은 이전이 없고 최신 편은 다음이 없다', () => {
    expect(neighbors(LIB, 'a1').older).toBeUndefined();
    expect(neighbors(LIB, 'a66').newer).toBeUndefined();
  });

  it('이웃은 날짜가 아니라 회차로 정한다 — 업로드 날짜로 대체된 편이 섞여도 순서가 맞다', () => {
    // 1·2편은 설교일이 없어 나중에 올린 날짜(업로드)가 3·4편보다 최근이다
    const lib = sortSermons([
      s({ id: 'e1', series: '강해', no: 1, date: '2026-05-01', dateFrom: 'upload' }),
      s({ id: 'e2', series: '강해', no: 2, date: '2026-05-01', dateFrom: 'upload' }),
      s({ id: 'e3', series: '강해', no: 3, date: '2026-01-18' }),
      s({ id: 'e4', series: '강해', no: 4, date: '2026-01-25' }),
    ]);
    expect(ids(seriesSermons(lib, '강해'))).toEqual(['e4', 'e3', 'e2', 'e1']);
    expect(neighbors(lib, 'e3')).toEqual({
      older: lib.find(x => x.id === 'e2'),
      newer: lib.find(x => x.id === 'e4'),
    });
    expect(neighbors(lib, 'e1').older).toBeUndefined();
    expect(neighbors(lib, 'e4').newer).toBeUndefined();
  });

  it('단편 설교는 단편끼리 날짜 순으로 이웃한다 — 이전·다음 버튼이 어느 설교에서나 나온다', () => {
    expect(neighbors(LIB, 'one1')).toEqual({ older: LIB.find(x => x.id === 'one0') });
    expect(neighbors(LIB, 'one0')).toEqual({ newer: LIB.find(x => x.id === 'one1') });
  });

  it('없는 id 는 이웃이 없다', () => {
    expect(neighbors(LIB, 'nope')).toEqual({});
  });
});

describe('listRows', () => {
  const all = { q: '', series: '', sort: 'new' } as const;

  it('아무 조건 없는 첫 화면에서는 위에 크게 보인 최신 설교를 목록에서 뺀다 — 같은 설교를 두 번 그리지 않는다', () => {
    expect(ids(listRows(LIB, all))).toEqual(ids(LIB).slice(1));
  });

  it('검색·시리즈·오래된 순 중 하나라도 걸면 최신 설교도 목록에 나온다', () => {
    expect(ids(listRows(LIB, { ...all, sort: 'old' }))).toEqual(ids(LIB).reverse());
    expect(ids(listRows(LIB, { ...all, series: SINGLES }))).toEqual(['one1', 'one0']);
    expect(ids(listRows(LIB, { ...all, q: '성찬식' }))).toEqual(['one1']);
    // 공백만 친 검색어는 조건이 아니다
    expect(ids(listRows(LIB, { ...all, q: '  ' }))).toEqual(ids(LIB).slice(1));
  });

  it('빈 목록이면 빈 배열', () => {
    expect(listRows([], all)).toEqual([]);
  });
});

describe('weekdayLabel', () => {
  it('주일(일요일)은 «주일», 다른 날은 요일 이름 — 성탄·송구영신 예배는 주일이 아닐 수 있다', () => {
    expect(weekdayLabel('2026-11-08')).toBe('주일');
    expect(weekdayLabel('2026-12-31')).toBe('목요일');
    expect(weekdayLabel('2026-12-25')).toBe('금요일');
  });

  it('날짜 모양이 아니면 빈 문자열', () => {
    expect(weekdayLabel('nope')).toBe('');
  });
});

describe('dateLabel / sermonTag', () => {
  it('설교일은 날짜만, 업로드 날짜는 «업로드» 를 붙인다', () => {
    expect(dateLabel(LIB.find(x => x.id === 'a66')!)).toBe('2026.10.25');
    expect(dateLabel(LIB.find(x => x.id === 'a1')!)).toBe('업로드 2025.02.02');
  });

  it('시리즈는 «이름 N편», 단편은 절기 이름(없으면 단편 설교)', () => {
    expect(sermonTag(LIB.find(x => x.id === 'a66')!)).toBe('사도행전 강해 66편');
    expect(sermonTag(LIB.find(x => x.id === 'one1')!)).toBe('성찬식');
    expect(sermonTag(LIB.find(x => x.id === 'one0')!)).toBe(SINGLES);
  });
});

describe('highlightParts', () => {
  const hits = (text: string, q: string) =>
    highlightParts(text, q)
      .filter(p => p.hit)
      .map(p => p.text);

  it('검색어와 맞는 조각을 표시한다 — 대소문자 무시, 원문 글자는 그대로', () => {
    expect(highlightParts('구원을 위한 도장깨기', '도장')).toEqual([
      { text: '구원을 위한 ', hit: false },
      { text: '도장', hit: true },
      { text: '깨기', hit: false },
    ]);
    expect(hits('Acts 강해 acts', 'ACTS')).toEqual(['Acts', 'acts']);
  });

  it('«12장» 으로 찾으면 본문의 «12:» 를 표시한다', () => {
    expect(hits('사도행전 12:23-25', '12장')).toEqual(['12:']);
    expect(hits('사도행전 13:4-7', '사도행전 13장 4절')).toEqual(['사도행전 13:4']);
  });

  it('«2장» 강조가 «12:» 안의 «2:» 에 찍히지 않는다', () => {
    expect(hits('사도행전 12:1-5', '2장')).toEqual([]);
    expect(hits('사도행전 2:1-13', '2장')).toEqual(['2:']);
  });

  it('«:» 앞뒤 공백이 다른 본문도 표시한다', () => {
    expect(hits('마태복음 10: 8-13', '10장 8절')).toEqual(['10: 8']);
  });

  it('검색어가 비었거나 맞는 곳이 없으면 통째로 한 조각', () => {
    expect(highlightParts('제목', '  ')).toEqual([{ text: '제목', hit: false }]);
    expect(highlightParts('제목', '없음')).toEqual([{ text: '제목', hit: false }]);
  });

  it('정규식 기호가 든 검색어도 글자 그대로 찾는다', () => {
    expect(hits('은혜(恩惠)의 능력?', '(恩惠)')).toEqual(['(恩惠)']);
    expect(hits('a.b', '.')).toEqual(['.']);
  });
});
