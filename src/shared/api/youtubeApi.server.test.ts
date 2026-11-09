import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  pickThumbnail,
  youtubeGet,
  youtubeGetDated,
  YoutubeApiError,
  YoutubeNetworkError,
} from './youtubeApi.server';

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('YOUTUBE_API_KEY', 'test-key');
  vi.stubEnv('NEXT_PUBLIC_YOUTUBE_API_KEY', '');
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('youtubeGet', () => {
  it('Data API 경로에 파라미터를 붙이고, 키는 주소가 아닌 헤더로(캐시 파일에 남지 않게), Data Cache 재검증 주기·10초 제한을 넘긴다', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({ items: [1] }) });

    const r = await youtubeGet<{ items: number[] }>(
      'playlists',
      { part: 'snippet', maxResults: '5' },
      3600
    );

    expect(r).toEqual({ items: [1] });
    const [url, init] = fetchMock.mock.calls[0];
    const u = new URL(url);
    expect(u.origin + u.pathname).toBe('https://www.googleapis.com/youtube/v3/playlists');
    expect(Object.fromEntries(u.searchParams)).toEqual({ part: 'snippet', maxResults: '5' });
    expect(init.headers).toEqual({ 'X-goog-api-key': 'test-key' });
    expect(init.next).toEqual({ revalidate: 3600 });
    expect(init.signal).toBeInstanceOf(AbortSignal); // 유튜브가 멈추면 10초에 끊고 503 으로
  });

  it('200 이 아니면 경로·상태를 담아 throw 한다(실패 응답은 캐시되지 않는다)', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 403, json: async () => ({}) });
    await expect(youtubeGet('videos', {}, 60)).rejects.toThrow('videos 403');
  });

  it('실패하면 상태와 유튜브가 알려 준 이유(쿼터 소진 등)를 담은 YoutubeApiError 를 던진다', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: { errors: [{ reason: 'quotaExceeded' }] } }),
    });
    const e = await youtubeGet('videos', {}, 60).catch(x => x);
    expect(e).toBeInstanceOf(YoutubeApiError);
    expect(e).toMatchObject({ status: 403, reason: 'quotaExceeded' });
  });

  it('오류 본문을 못 읽어도 상태만으로 던진다', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('html');
      },
    });
    await expect(youtubeGet('videos', {}, 60)).rejects.toMatchObject({
      status: 500,
      reason: undefined,
    });
  });

  it('키는 서버 전용 이름(YOUTUBE_API_KEY)을 먼저, 없으면 옛 이름을 읽는다(Vercel 이름 바꾸기 전까지)', async () => {
    vi.stubEnv('YOUTUBE_API_KEY', '');
    vi.stubEnv('NEXT_PUBLIC_YOUTUBE_API_KEY', 'old-key');
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    await youtubeGet('videos', {}, 60);
    expect(fetchMock.mock.calls[0][1].headers).toEqual({ 'X-goog-api-key': 'old-key' });
  });

  it('youtubeGetDated 는 유튜브가 원래 응답한 시각(Date 헤더)을 함께 준다 — 캐시에서 꺼낸 옛 응답인지 알 수 있게', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ date: 'Mon, 09 Nov 2026 01:00:00 GMT' }),
      json: async () => ({ items: [] }),
    });
    const r = await youtubeGetDated('videos', {}, 60);
    expect(r.fetchedAt).toBe(Date.parse('Mon, 09 Nov 2026 01:00:00 GMT'));
    expect(r.data).toEqual({ items: [] });
  });

  it('유튜브에 닿지 못하면(망 오류) YoutubeNetworkError — 우리 코드 버그(TypeError)와 구분한다', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));
    await expect(youtubeGet('videos', {}, 60)).rejects.toBeInstanceOf(YoutubeNetworkError);
  });

  it('200 본문을 받다가 끊겨도(TypeError) YoutubeNetworkError — 503 으로 재시도되게', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new TypeError('terminated');
      },
    });

    await expect(youtubeGet('videos', {}, 60)).rejects.toBeInstanceOf(YoutubeNetworkError);
  });

  it('본문을 받다가 시간 제한에 걸려도(TimeoutError) YoutubeNetworkError, JSON 형식 오류는 그대로', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new DOMException('timed out', 'TimeoutError');
      },
    });
    await expect(youtubeGet('videos', {}, 60)).rejects.toBeInstanceOf(YoutubeNetworkError);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token <');
      },
    });
    await expect(youtubeGet('videos', {}, 60)).rejects.toBeInstanceOf(SyntaxError);
  });
});

describe('pickThumbnail', () => {
  const t = { default: { url: 'd' }, high: { url: 'h' }, maxres: { url: 'm' } };
  it('원하는 크기 순서대로 처음 있는 썸네일 주소', () => {
    expect(pickThumbnail(t, ['maxres', 'standard', 'high'])).toBe('m');
    expect(pickThumbnail(t, ['standard', 'high', 'default'])).toBe('h');
  });
  it('주소가 빈 크기는 건너뛰고, 하나도 없으면 빈 문자열', () => {
    expect(pickThumbnail({ high: { url: '' }, default: { url: 'd' } }, ['high', 'default'])).toBe(
      'd'
    );
    expect(pickThumbnail(undefined, ['high'])).toBe('');
  });
});
