import { describe, expect, it } from 'vitest';

import { dateInText, parseSermonDescription, parseSermonTitle, SINGLES } from './sermonParse';

// 표본은 교회 채널 «주일 예배 설교» 재생목록의 실제 제목(2026-11 확인).
describe('parseSermonTitle', () => {
  it('«시리즈 N | 제목 | 본문 | 설교자» — 시리즈·회차·제목·본문·설교자', () => {
    expect(
      parseSermonTitle(
        '사도행전 강해 66 | 구원을 위한 영과 육의 도장깨기 | 사도행전 13:4-7 | 이요셉 목사'
      )
    ).toEqual({
      series: '사도행전 강해',
      no: 66,
      title: '구원을 위한 영과 육의 도장깨기',
      passage: '사도행전 13:4-7',
      preacher: '이요셉 목사',
    });
  });

  it('본문 칸이 없거나 비어 있어도 시리즈·회차를 읽는다', () => {
    expect(parseSermonTitle('마태복음강해 127 | 권세 논쟁을 끝내라! | 이요셉 목사')).toEqual({
      series: '마태복음강해',
      no: 127,
      title: '권세 논쟁을 끝내라!',
      preacher: '이요셉 목사',
    });
    expect(
      parseSermonTitle(
        '인생의 목적이자 사명! 은, 거, 영 2 | 예수님의 은혜로 거룩한 삶을 사십시오! |  | 이요셉 목사'
      )
    ).toEqual({
      series: '인생의 목적이자 사명! 은, 거, 영',
      no: 2,
      title: '예수님의 은혜로 거룩한 삶을 사십시오!',
      preacher: '이요셉 목사',
    });
  });

  it('첫 칸에 회차가 없으면 단편 — 첫 칸은 절기·주제 이름으로 남긴다', () => {
    expect(
      parseSermonTitle(
        '성찬식 | 성찬을 통해 은혜를 공급받고, 삶으로 응답하다 | 사도행전 2:42-47 | 이요셉 목사'
      )
    ).toEqual({
      series: SINGLES,
      occasion: '성찬식',
      title: '성찬을 통해 은혜를 공급받고, 삶으로 응답하다',
      passage: '사도행전 2:42-47',
      preacher: '이요셉 목사',
    });
    expect(parseSermonTitle('살게하는 능력 | 부흥하게 하옵소서 | 이요셉 목사')).toEqual({
      series: SINGLES,
      occasion: '살게하는 능력',
      title: '부흥하게 하옵소서',
      preacher: '이요셉 목사',
    });
  });

  it('«제목 | 본문 | 설교자» — 제목만 있는 단편', () => {
    expect(parseSermonTitle('동성애는 죄다! | 로마서 1:24-27 | 이요셉 목사')).toEqual({
      series: SINGLES,
      title: '동성애는 죄다!',
      passage: '로마서 1:24-27',
      preacher: '이요셉 목사',
    });
  });

  it('본문은 «N장»·«시편 N편»·여러 구절 표기도 알아본다', () => {
    expect(parseSermonTitle('믿음 3 | 제목 | 창세기 12장 | 이요셉 목사').passage).toBe(
      '창세기 12장'
    );
    expect(parseSermonTitle('제목 | 시편 23편 | 이요셉 목사').passage).toBe('시편 23편');
    expect(parseSermonTitle('제목 | 요한계시록 12:10, 요한복음 16:8 | 이요셉 목사').passage).toBe(
      '요한계시록 12:10, 요한복음 16:8'
    );
  });

  it('형식 밖 제목(칸 나눔 없음·옛 대괄호 형식)은 제목 전체를 그대로 — 목록에서 빠지지 않는다', () => {
    expect(parseSermonTitle('2024년 12월 31일 성복교회 송구영신예배')).toEqual({
      series: SINGLES,
      title: '2024년 12월 31일 성복교회 송구영신예배',
    });
    expect(parseSermonTitle("[가정] '범사에 잘되는 가정'   「이요셉 목사」")).toEqual({
      series: SINGLES,
      title: "[가정] '범사에 잘되는 가정'   「이요셉 목사」",
    });
    expect(parseSermonTitle('  ')).toEqual({ series: SINGLES, title: '' });
  });

  it('본문·설교자 칸이 빠졌을 때 제목을 본문·설교자로 잘못 떼지 않는다', () => {
    // 제목에 구절이 들어 있어도(본문 칸 없음) 제목이다 — 본문 칸은 구절로 끝난다
    expect(parseSermonTitle('믿음 3 | 요한복음 3:16의 약속 | 이요셉 목사')).toEqual({
      series: '믿음',
      no: 3,
      title: '요한복음 3:16의 약속',
      preacher: '이요셉 목사',
    });
    // 시리즈 편은 제목이 꼭 있다 — 칸이 둘뿐이면 둘째 칸이 구절 모양이어도 제목
    expect(parseSermonTitle('믿음 3 | 요한복음 3:16 | 이요셉 목사')).toEqual({
      series: '믿음',
      no: 3,
      title: '요한복음 3:16',
      preacher: '이요셉 목사',
    });
    // «…목사» 로 끝나는 제목은 설교자가 아니다 — 설교자 칸은 이름 + 직분
    expect(parseSermonTitle('믿음 3 | 하나님이 부르신 목사')).toEqual({
      series: '믿음',
      no: 3,
      title: '하나님이 부르신 목사',
    });
    // 이름처럼 짧은 «…목사» 제목도, 시리즈 편의 하나뿐인 제목 칸이면 설교자로 떼지 않는다
    expect(parseSermonTitle('믿음 3 | 신실한 목사')).toEqual({
      series: '믿음',
      no: 3,
      title: '신실한 목사',
    });
    expect(parseSermonTitle('제목 | 로마서 1:1 | 이요셉 담임목사').preacher).toBe(
      '이요셉 담임목사'
    );
  });

  it('첫 칸 끝의 연도·날짜는 회차가 아니다 — 가짜 시리즈를 만들지 않는다', () => {
    expect(parseSermonTitle('송구영신예배 2026 | 은혜를 주옵소서! | 요한복음 1:14-17')).toEqual({
      series: SINGLES,
      occasion: '송구영신예배 2026',
      title: '은혜를 주옵소서!',
      passage: '요한복음 1:14-17',
    });
    expect(parseSermonTitle('2026.11.08 | 제목 | 이요셉 목사')).toMatchObject({
      series: SINGLES,
      occasion: '2026.11.08',
      title: '제목',
    });
    // 세 자리 회차까지는 시리즈(마태복음강해 151)
    expect(parseSermonTitle('마태복음강해 151 | 지상대위임령 | 이요셉 목사')).toMatchObject({
      series: '마태복음강해',
      no: 151,
    });
  });

  it('네 칸 형식이면 마지막 칸은 직분 낱말과 상관없이 설교자다 — 초청 설교자·소속이 붙은 표기', () => {
    expect(
      parseSermonTitle('사도행전 강해 66 | 제목 | 사도행전 13:4-7 | 성복교회 이요셉 목사')
    ).toEqual({
      series: '사도행전 강해',
      no: 66,
      title: '제목',
      passage: '사도행전 13:4-7',
      preacher: '성복교회 이요셉 목사',
    });
    expect(parseSermonTitle('특별집회 | 제목 | 요한복음 3:16 | 홍길동 집사')).toEqual({
      series: SINGLES,
      occasion: '특별집회',
      title: '제목',
      passage: '요한복음 3:16',
      preacher: '홍길동 집사',
    });
  });

  it('«N편» 은 시편만 본문이다 — «감사 2편» 같은 제목은 본문이 아니다', () => {
    expect(parseSermonTitle('추수감사주일 | 감사 2편')).toEqual({
      series: SINGLES,
      occasion: '추수감사주일',
      title: '감사 2편',
    });
  });

  it('제목 안에 | 가 더 있어도 제목으로 합친다', () => {
    expect(parseSermonTitle('창세기 강해 3 | 처음 | 그리고 끝 | 창세기 1:1 | 이요셉 목사')).toEqual(
      {
        series: '창세기 강해',
        no: 3,
        title: '처음 | 그리고 끝',
        passage: '창세기 1:1',
        preacher: '이요셉 목사',
      }
    );
  });
});

describe('dateInText', () => {
  it('«YYYY년 M월 D일» 을 YYYY-MM-DD 로', () => {
    expect(dateInText('2026년 10월 25일 성복교회 주일예배')).toBe('2026-10-25');
    expect(dateInText('2026년 9월 7일')).toBe('2026-09-07');
    expect(dateInText('  2025년  1월  5일 ')).toBe('2025-01-05');
  });

  it('날짜가 없거나 달력에 없는 날이면 undefined', () => {
    expect(dateInText('성복교회 주일예배')).toBeUndefined();
    expect(dateInText('2026년 13월 40일')).toBeUndefined();
    expect(dateInText('')).toBeUndefined();
  });
});

describe('parseSermonDescription', () => {
  it('첫 줄의 날짜를 설교일로 읽고, 본문에서는 그 줄과 이어진 빈 줄을 뺀다', () => {
    expect(
      parseSermonDescription(
        '2026년 10월 25일 성복교회 주일예배\n\n[사도행전 강해 66]\n*설교본문: 사도행전 13:4-7'
      )
    ).toEqual({ date: '2026-10-25', body: '[사도행전 강해 66]\n*설교본문: 사도행전 13:4-7' });
  });

  it('첫 줄에 날짜가 없으면 본문을 그대로 둔다 — 중간 줄의 날짜는 설교일로 보지 않는다', () => {
    const raw = '[절기설교]\n지난 2026년 10월 25일 설교의 후속입니다.';
    expect(parseSermonDescription(raw)).toEqual({ body: raw });
  });

  it('설명이 빈 줄로 시작해도 첫 글줄의 날짜를 설교일로 읽는다', () => {
    expect(parseSermonDescription('\n \n2026년 10월 25일 성복교회 주일예배\n\n본문')).toEqual({
      date: '2026-10-25',
      body: '본문',
    });
  });

  it('빈 설명·윈도우 줄바꿈', () => {
    expect(parseSermonDescription('')).toEqual({ body: '' });
    expect(parseSermonDescription('2026년 9월 7일 주일예배\r\n\r\n본문')).toEqual({
      date: '2026-09-07',
      body: '본문',
    });
  });
});
