import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NOTICE_PLAYLIST_ID, UPLOADS_PLAYLIST_ID } from '@/domains/home/data/homeVideo';

import { fetchHomeVideoFeed } from './homeVideoFeed.server';

const playlistItem = (videoId: string) => ({ contentDetails: { videoId } });
const videoItem = (
  id: string,
  p: { title?: string; live?: 'none' | 'live' | 'upcoming'; duration?: string; publishedAt?: string; thumbs?: Record<string, { url: string }> } = {},
) => ({
  id,
  snippet: {
    title: p.title ?? id,
    description: '',
    publishedAt: p.publishedAt ?? '2026-10-11T04:20:00Z',
    thumbnails: p.thumbs ?? { default: { url: `d/${id}` }, high: { url: `h/${id}` } },
    liveBroadcastContent: p.live ?? 'none',
  },
  contentDetails: { duration: p.duration ?? 'PT1M' },
  ...(p.live === 'live' ? { liveStreamingDetails: { actualStartTime: '2026-10-11T01:00:00Z' } } : {}),
});

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response;

// 업로드: 라이브 L · 새벽예배 dawn · 설교 acts64 · acts63 / 광고: n2, n1, acts63(겹침), gone(videos 응답에 없음)
const UPLOADS = ['L', 'dawn', 'acts64', 'acts63'];
const NOTICES = ['n2', 'n1', 'acts63', 'gone'];
const VIDEOS = [
  videoItem('n1'),
  videoItem('acts63', { title: '사도행전 강해 63 | 상처 입은 치유자 | 사도행전 13:1 | 이요셉 목사', publishedAt: '2026-10-04T04:22:00Z' }),
  videoItem('n2'),
  videoItem('L', { title: '2026년 10월 11일 성복교회 주일예배', live: 'live', thumbs: { default: { url: 'd/L' }, maxres: { url: 'max/L' }, high: { url: 'h/L' } } }),
  videoItem('dawn', { title: '2026년 10월 9일 성복교회 새벽예배', publishedAt: '2026-10-11T05:00:00Z' }),
  videoItem('acts64', { title: '사도행전 강해 64 | 예상을 깨는 성령님의 뜻 | 사도행전 13:1-3 | 이요셉 목사', duration: 'PT40M52S' }),
];

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(async (input: string) => {
    const u = new URL(input);
    if (u.pathname.endsWith('/playlistItems')) {
      const pl = u.searchParams.get('playlistId');
      return ok({ items: (pl === UPLOADS_PLAYLIST_ID ? UPLOADS : pl === NOTICE_PLAYLIST_ID ? NOTICES : []).map(playlistItem) });
    }
    return ok({ items: VIDEOS });
  });
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchHomeVideoFeed', () => {
  it('유튜브를 3회 부른다 — 키 포함 · Data Cache 60초', async () => {
    await fetchHomeVideoFeed();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    for (const [url, init] of fetchMock.mock.calls) {
      expect(new URL(url).searchParams.has('key')).toBe(true);
      expect(init).toEqual({ next: { revalidate: 60 } });
    }
  });

  it('videos 조회 id 는 두 재생목록의 합집합(중복 제거)', async () => {
    await fetchHomeVideoFeed();
    const videosCall = fetchMock.mock.calls.find(([url]) => new URL(url).pathname.endsWith('/videos'))!;
    expect(new URL(videosCall[0]).searchParams.get('id')!.split(',')).toEqual(['L', 'dawn', 'acts64', 'acts63', 'n2', 'n1', 'gone']);
  });

  it('live · 최신 설교 · 광고(재생목록 순서) 로 조합한다', async () => {
    const feed = await fetchHomeVideoFeed();
    expect(feed.live?.id).toBe('L');
    expect(feed.sermon?.id).toBe('acts64');
    expect(feed.notices.map((v) => v.id)).toEqual(['n2', 'n1', 'acts63']);
  });

  it('videos 응답에 없는 id 는 빠지고, 라이브는 durationSec null, 썸네일은 maxres 우선', async () => {
    const feed = await fetchHomeVideoFeed();
    expect(feed.notices.some((v) => v.id === 'gone')).toBe(false);
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
  const fail = () => fetchMock.mockResolvedValue({ ok: false, status: 503, json: async () => ({}) } as Response);

  it('성공 뒤 실패 → 이전 성공 데이터를 돌려준다', async () => {
    const fn = await fresh();
    const first = await fn();
    fail();
    await expect(fn()).resolves.toEqual(first);
  });

  it('첫 호출부터 실패(non-2xx) → throw', async () => {
    const fn = await fresh();
    fail();
    await expect(fn()).rejects.toThrow('503');
  });
});
