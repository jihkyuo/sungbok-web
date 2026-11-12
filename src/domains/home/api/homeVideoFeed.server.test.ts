import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NOTICE_PLAYLIST_ID, UPLOADS_PLAYLIST_ID } from '@/domains/home/data/homeVideo';

import { fetchHomeVideoFeed } from './homeVideoFeed.server';

const playlistItem = (videoId: string) => ({ contentDetails: { videoId } });
const videoItem = (
  id: string,
  p: {
    title?: string;
    live?: 'none' | 'live' | 'upcoming';
    duration?: string;
    publishedAt?: string;
    thumbs?: Record<string, { url: string }>;
  } = {}
) => ({
  id,
  snippet: {
    title: p.title ?? id,
    description: `${id} 의 긴 설명`,
    publishedAt: p.publishedAt ?? '2026-10-11T04:20:00Z',
    thumbnails: p.thumbs ?? { default: { url: `d/${id}` }, high: { url: `h/${id}` } },
    liveBroadcastContent: p.live ?? 'none',
  },
  contentDetails: { duration: p.duration ?? 'PT1M' },
  ...(p.live === 'live'
    ? { liveStreamingDetails: { actualStartTime: '2026-10-11T01:00:00Z' } }
    : {}),
});

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response;

// 업로드: 라이브 L · 새벽예배 dawn · 설교 acts64 · acts63 / 광고: n2, n1, acts63(겹침), gone(videos 응답에 없음)
const UPLOADS = ['L', 'dawn', 'acts64', 'acts63'];
const NOTICES = ['n2', 'n1', 'acts63', 'gone'];
const VIDEOS = [
  videoItem('n1'),
  videoItem('acts63', {
    title: '사도행전 강해 63 | 상처 입은 치유자 | 사도행전 13:1 | 이요셉 목사',
    publishedAt: '2026-10-04T04:22:00Z',
  }),
  videoItem('n2'),
  videoItem('L', {
    title: '2026년 10월 11일 성복교회 주일예배',
    live: 'live',
    thumbs: { default: { url: 'd/L' }, maxres: { url: 'max/L' }, high: { url: 'h/L' } },
  }),
  videoItem('dawn', {
    title: '2026년 10월 9일 성복교회 새벽예배',
    publishedAt: '2026-10-11T05:00:00Z',
  }),
  videoItem('acts64', {
    title: '사도행전 강해 64 | 예상을 깨는 성령님의 뜻 | 사도행전 13:1-3 | 이요셉 목사',
    duration: 'PT40M52S',
  }),
];

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(async (input: string) => {
    const u = new URL(input);
    if (u.pathname.endsWith('/playlistItems')) {
      const pl = u.searchParams.get('playlistId');
      return ok({
        items: (pl === UPLOADS_PLAYLIST_ID
          ? UPLOADS
          : pl === NOTICE_PLAYLIST_ID
            ? NOTICES
            : []
        ).map(playlistItem),
      });
    }
    return ok({ items: VIDEOS });
  });
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchHomeVideoFeed', () => {
  it('유튜브를 3회 부른다 — 키(헤더) 포함 · Data Cache 60초', async () => {
    await fetchHomeVideoFeed();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    for (const [, init] of fetchMock.mock.calls) {
      expect(init.headers).toHaveProperty('X-goog-api-key');
      expect(init.next).toEqual({ revalidate: 60 });
    }
  });

  it('영상 정보를 유튜브가 만든 뒤 지난 시간(staleMs)을 싣는다 — 라이브 만료는 화면이 이 값 하나로 판단한다', async () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-11-09T01:00:00Z'));
    const base = fetchMock.getMockImplementation()!;
    fetchMock.mockImplementation(async (input: string, init: unknown) => {
      const r = await base(input, init);
      return new URL(input).pathname.endsWith('/videos') // 캐시에 남은 11분 된 응답
        ? { ...r, headers: new Headers({ date: 'Mon, 09 Nov 2026 00:49:00 GMT' }) }
        : r;
    });
    const feed = await fetchHomeVideoFeed();
    expect(feed.staleMs).toBe(11 * 60_000);
    expect(feed.live?.id).toBe('L'); // 서버는 라이브를 지우지 않는다 — 판단은 화면 한 곳에서
    now.mockRestore();
  });

  it('모양이 어긋난 항목 하나는 빼고 나머지로 피드를 만든다 — 영상 하나 때문에 홈 영상 전체가 비지 않게', async () => {
    fetchMock.mockImplementation(async (input: string) => {
      const u = new URL(input);
      if (u.pathname.endsWith('/playlistItems'))
        return ok({ items: [playlistItem('n1'), {}, playlistItem('n2')] }); // 가운데는 videoId 없음
      const broken = { id: 'n2', snippet: { title: 'n2' } }; // 게시 시각·썸네일 없음
      return ok({ items: [videoItem('n1'), broken] });
    });
    const feed = await fetchHomeVideoFeed();
    expect(feed.notices.map(v => v.id)).toEqual(['n1']);
  });

  it('썸네일이 아직 없는 영상(라이브 시작 직후·처리 중)도 빼지 않는다 — 썸네일만 빈 채로', async () => {
    fetchMock.mockImplementation(async (input: string) => {
      const u = new URL(input);
      if (u.pathname.endsWith('/playlistItems')) return ok({ items: [playlistItem('L')] });
      const v = videoItem('L', { title: '2026년 10월 11일 성복교회 주일예배', live: 'live' });
      return ok({ items: [{ ...v, snippet: { ...v.snippet, thumbnails: undefined } }] });
    });
    const feed = await fetchHomeVideoFeed();
    expect(feed.live).toMatchObject({ id: 'L', thumbnail: '' });
  });

  it('재생목록이 비어 items 가 없는 응답이어도 터지지 않는다', async () => {
    fetchMock.mockImplementation(async () => ok({}));
    await expect(fetchHomeVideoFeed()).resolves.toMatchObject({
      live: null,
      sermon: null,
      notices: [],
    });
  });

  it('videos 조회 id 는 두 재생목록의 합집합(중복 제거)', async () => {
    await fetchHomeVideoFeed();
    const videosCall = fetchMock.mock.calls.find(([url]) =>
      new URL(url).pathname.endsWith('/videos')
    )!;
    expect(new URL(videosCall[0]).searchParams.get('id')!.split(',')).toEqual([
      'L',
      'dawn',
      'acts64',
      'acts63',
      'n2',
      'n1',
      'gone',
    ]);
  });

  it('영상 설명은 응답에서 뺀다 — 서버에서 설교 고르기에만 쓰고 화면엔 안 쓰는데, 페이지(미리 채우기)에 실려 무거워지지 않게', async () => {
    const feed = await fetchHomeVideoFeed();
    for (const v of [feed.live, feed.sermon, ...feed.notices]) expect(v?.description).toBe('');
  });

  it('live · 최신 설교 · 광고(재생목록 순서) 로 조합한다', async () => {
    const feed = await fetchHomeVideoFeed();
    expect(feed.live?.id).toBe('L');
    expect(feed.sermon?.id).toBe('acts64');
    expect(feed.notices.map(v => v.id)).toEqual(['n2', 'n1', 'acts63']);
  });

  it('videos 응답에 없는 id 는 빠지고, 라이브는 durationSec null, 썸네일은 maxres 우선', async () => {
    const feed = await fetchHomeVideoFeed();
    expect(feed.notices.some(v => v.id === 'gone')).toBe(false);
    expect(feed.live?.durationSec).toBeNull();
    expect(feed.live?.liveStart).toBe('2026-10-11T01:00:00Z');
    expect(feed.live?.thumbnail).toBe('max/L');
    expect(feed.sermon?.durationSec).toBe(2452);
    expect(feed.sermon?.thumbnail).toBe('h/acts64');
  });
});

// Data Cache 는 200 만 저장한다 — 유튜브가 실패하는 동안은 마지막 성공분으로 버틴다.
// 모듈 스코프 상태를 테스트마다 초기화하기 위해 resetModules + 동적 import.
describe('fetchHomeVideoFeed — stale-while-error', () => {
  const fresh = async () => {
    vi.resetModules();
    return (await import('./homeVideoFeed.server')).fetchHomeVideoFeed;
  };
  const fail = () =>
    fetchMock.mockResolvedValue({ ok: false, status: 503, json: async () => ({}) } as Response);

  it('성공 뒤 실패 → 이전 성공 데이터를 돌려준다', async () => {
    const fn = await fresh();
    const { live, sermon, notices } = await fn();
    fail();
    await expect(fn()).resolves.toMatchObject({ live, sermon, notices }); // staleMs 는 흐른 만큼 늘어난다
  });

  it('마지막 성공분은 10분까지만 대신 쓴다 — 끝난 라이브가 몇 시간씩 «ON AIR» 로 남지 않게', async () => {
    const now = vi.spyOn(Date, 'now');
    now.mockReturnValue(1_000_000);
    const fn = await fresh();
    await fn();
    fail();
    now.mockReturnValue(1_000_000 + 9 * 60_000);
    await expect(fn()).resolves.toBeTruthy(); // 9분 — 아직 대신 쓴다
    now.mockReturnValue(1_000_000 + 11 * 60_000);
    await expect(fn()).rejects.toThrow('503'); // 11분 — 실패를 그대로 알린다
    now.mockRestore();
  });

  it('마지막 성공분을 대신 줄 때 staleMs 는 원래 응답 시각부터 센다 — 대신 줄수록 나이가 늘어 라이브 만료가 밀리지 않게', async () => {
    const now = vi.spyOn(Date, 'now');
    now.mockReturnValue(Date.parse('2026-11-09T01:00:00Z'));
    const fn = await fresh();
    const base = fetchMock.getMockImplementation()!;
    fetchMock.mockImplementation(async (input: string, init: unknown) => {
      const r = await base(input, init);
      return new URL(input).pathname.endsWith('/videos') // 9분 된 캐시 응답
        ? { ...r, headers: new Headers({ date: 'Mon, 09 Nov 2026 00:51:00 GMT' }) }
        : r;
    });
    expect((await fn()).staleMs).toBe(9 * 60_000);
    fail();
    now.mockReturnValue(Date.parse('2026-11-09T01:03:00Z'));
    const fallback = await fn();
    expect(fallback.staleMs).toBe(12 * 60_000);
    expect(fallback.sermon?.id).toBe('acts64');
    now.mockRestore();
  });

  it('응답 모양 오류도 마지막 성공분으로 버틴다 — 유튜브 쪽 문제라 홈 영상을 비우지 않는다', async () => {
    const fn = await fresh();
    const first = await fn();
    fetchMock.mockResolvedValue(ok({ items: {} })); // 배열 자리에 객체 — 응답 전체의 모양이 다르다
    await expect(fn()).resolves.toMatchObject({ notices: first.notices });
  });

  it('우리 코드 버그(TypeError 등)는 마지막 성공분으로 가리지 않는다', async () => {
    let broken = false;
    vi.doMock('./homeVideoFeed', async importOriginal => {
      const real = await importOriginal<typeof import('./homeVideoFeed')>();
      return {
        ...real,
        pickLive: (...a: Parameters<typeof real.pickLive>) => {
          if (broken) throw new TypeError('bug');
          return real.pickLive(...a);
        },
      };
    });
    try {
      const fn = await fresh();
      await fn();
      broken = true;
      await expect(fn()).rejects.toBeInstanceOf(TypeError);
    } finally {
      vi.doUnmock('./homeVideoFeed'); // 실패해도 다음 테스트에 가짜가 남지 않게
    }
  });

  it('모르는 방송 상태(liveBroadcastContent)가 와도 피드 전체를 깨지 않고 «방송 아님»으로 본다', async () => {
    const fn = await fresh();
    fetchMock.mockImplementation(async (input: string) => {
      const u = new URL(input);
      if (u.pathname.endsWith('/playlistItems')) return ok({ items: [playlistItem('x')] });
      const v = videoItem('x', { title: '사도행전 강해 1 | 제목 | 사도행전 1:1 | 이요셉 목사' });
      return ok({
        items: [{ ...v, snippet: { ...v.snippet, liveBroadcastContent: 'completed' } }],
      });
    });
    const feed = await fn();
    expect(feed.live).toBeNull();
    expect(feed.notices[0]).toMatchObject({ id: 'x', broadcast: 'none', durationSec: 60 });
  });

  it('첫 호출부터 실패(non-2xx) → throw', async () => {
    const fn = await fresh();
    fail();
    await expect(fn()).rejects.toThrow('503');
  });
});
