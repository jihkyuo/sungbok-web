import { describe, expect, it } from 'vitest';

import {
  formatKoDate,
  isLiveStale,
  isoDurationToSeconds,
  LIVE_MAX_AGE,
  liveServiceName,
  parseSermonTitle,
  pickLatestSermon,
  pickLive,
  watchHref,
  type HomeVideo,
} from './homeVideoFeed';

const v = (p: Partial<HomeVideo> & { id: string }): HomeVideo => ({
  title: '',
  description: '',
  publishedAt: '2026-10-11T04:20:00Z',
  thumbnail: `https://i.ytimg.com/vi/${p.id}/hqdefault.jpg`,
  durationSec: 60,
  broadcast: 'none',
  liveStart: null,
  ...p,
});

describe('parseSermonTitle', () => {
  it('4분절: 시리즈 | 제목 | 본문 | 설교자', () => {
    expect(
      parseSermonTitle(
        '사도행전 강해 64 | 예상을 깨는 성령님의 뜻 앞에 서게 될 때 | 사도행전 13:1-3 | 이요셉 목사'
      )
    ).toEqual({
      series: '사도행전 강해 64',
      title: '예상을 깨는 성령님의 뜻 앞에 서게 될 때',
      scripture: '사도행전 13:1-3',
      preacher: '이요셉 목사',
    });
  });
  it('3분절: 제목 | 본문 | 설교자 (시리즈 없음)', () => {
    expect(
      parseSermonTitle(
        '성령의 음성과 사단의 음성을 정확히 구별하는 법 | 요한계시록 12:10, 요한복음 16:8 | 이요셉 목사'
      )
    ).toEqual({
      series: null,
      title: '성령의 음성과 사단의 음성을 정확히 구별하는 법',
      scripture: '요한계시록 12:10, 요한복음 16:8',
      preacher: '이요셉 목사',
    });
  });
  it('규칙 밖 제목은 null', () => {
    expect(parseSermonTitle('2026년 10월 9일 성복교회 새벽예배')).toBeNull();
  });
});

describe('pickLive / pickLatestSermon', () => {
  const list: HomeVideo[] = [
    v({
      id: 'up',
      title: '2026년 10월 11일 성복교회 주일예배',
      broadcast: 'upcoming',
      publishedAt: '2026-10-11T07:23:00Z',
    }),
    v({
      id: 'dawn',
      title: '2026년 10월 9일 성복교회 새벽예배',
      publishedAt: '2026-10-11T05:00:00Z',
    }),
    v({
      id: 'acts64',
      title: '사도행전 강해 64 | 예상을 깨는 성령님의 뜻 | 사도행전 13:1-3 | 이요셉 목사',
      publishedAt: '2026-10-11T04:20:00Z',
    }),
    v({
      id: 'acts63',
      title: '사도행전 강해 63 | 상처 입은 치유자 | 사도행전 13:1 | 이요셉 목사',
      publishedAt: '2026-10-04T04:22:00Z',
    }),
  ];
  it('라이브가 없으면 null (upcoming 은 라이브가 아니다)', () => {
    expect(pickLive(list)).toBeNull();
  });
  it('liveBroadcastContent=live 인 첫 영상', () => {
    const live = v({ id: 'L', title: '2026년 10월 14일 성복교회 수요예배', broadcast: 'live' });
    expect(pickLive([list[0], live, ...list.slice(1)])?.id).toBe('L');
  });
  it('최신 설교 = 설교자 규칙을 만족하는 가장 최근 업로드(새벽예배·예정 건너뜀)', () => {
    expect(pickLatestSermon(list, '이요셉 목사')?.id).toBe('acts64');
  });
  it('설명란 "*설교: 이요셉 목사" 로도 판별', () => {
    const d = v({
      id: 'desc',
      title: '규칙 밖 제목',
      description: '[시리즈]\n*설교제목: x\n*설교: 이요셉 목사',
      publishedAt: '2026-10-12T00:00:00Z',
    });
    expect(pickLatestSermon([d, ...list], '이요셉 목사')?.id).toBe('desc');
  });
  it('publishedAt 역순으로 고른다(입력 순서 무관)', () => {
    expect(pickLatestSermon([list[3], list[2]], '이요셉 목사')?.id).toBe('acts64');
  });
});

describe('helpers', () => {
  it('ISO 8601 duration → 초', () => {
    expect(isoDurationToSeconds('PT40M52S')).toBe(2452);
    expect(isoDurationToSeconds('PT1H17M59S')).toBe(4679);
    expect(isoDurationToSeconds('P0D')).toBe(0);
    expect(isoDurationToSeconds(null)).toBeNull();
  });
  it('KST 날짜 2026.10.11', () => {
    expect(formatKoDate('2026-10-10T21:39:31Z')).toBe('2026.10.11');
  });
  it('라이브 제목에서 예배명', () => {
    expect(liveServiceName('2026년 10월 11일 성복교회 주일예배')).toBe('주일예배');
    expect(liveServiceName('2026년 9월 6일 성복교회 주일 5부 예배 [정형준 선교사]')).toBe(
      '주일 5부 예배'
    );
    expect(liveServiceName('사도행전 강해 64 | x | y | 이요셉 목사')).toBe('라이브');
  });
  it('유튜브 시청 페이지 URL', () => {
    expect(watchHref('abc')).toBe('https://www.youtube.com/watch?v=abc');
  });
});

describe('isLiveStale', () => {
  it('영상 정보 나이(서버가 잰 것) + 그 뒤 흐른 시간이 10분을 넘으면 라이브를 믿지 않는다', () => {
    expect(LIVE_MAX_AGE).toBe(10 * 60_000);
    expect(isLiveStale(9 * 60_000, 0)).toBe(false);
    expect(isLiveStale(9 * 60_000, 2 * 60_000)).toBe(true); // 서버 대신 응답 9분 + 화면 실패 2분 = 11분
    expect(isLiveStale(0, 11 * 60_000)).toBe(true);
    expect(isLiveStale(LIVE_MAX_AGE, 0)).toBe(false); // 딱 10분은 아직
  });
});
