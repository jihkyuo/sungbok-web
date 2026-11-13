import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const server = vi.hoisted(() => ({
  fetchSermonLibrary: vi.fn(),
  fetchSermonDescription: vi.fn(),
}));
vi.mock('./worshipVideo.server', () => server);

import { YoutubeApiError } from '@/shared/api/youtubeApi.server';

import { prefetchSermonLibrary, prefetchSermonWatch } from './worshipVideoPrefetch.server';
import { sermonDescriptionQueryKey, sermonLibraryQueryKey } from './worshipVideoQueries';

const keysOf = (s: Awaited<ReturnType<typeof prefetchSermonLibrary>>) =>
  s.queries.map(q => q.queryKey);
const sermon = (id: string, date: string) => ({
  id,
  title: 't',
  series: '단편 설교',
  date,
  dateFrom: 'sermon',
  thumbnail: 'h',
  poster: 'h',
});

beforeEach(() => {
  server.fetchSermonLibrary
    .mockReset()
    .mockResolvedValue([sermon('new', '2026-11-01'), sermon('old', '2026-10-25')]);
  server.fetchSermonDescription.mockReset().mockResolvedValue('본문');
});
afterEach(() => vi.unstubAllEnvs());

describe('prefetchSermonLibrary — 목록 페이지', () => {
  it('설교 목록만 미리 받아 실어 보낸다 — 설명 글은 목록 페이지에 쓰이지 않는다', async () => {
    const s = await prefetchSermonLibrary('sunday');
    expect(keysOf(s)).toEqual([sermonLibraryQueryKey('sunday')]);
    expect(server.fetchSermonLibrary).toHaveBeenCalledWith('sunday');
    expect(server.fetchSermonDescription).not.toHaveBeenCalled();
  });

  it('빌드 중 유튜브가 실패해도(쿼터 소진 등) 던지지 않는다 — 배포를 막지 않고 화면이 직접 받게', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PHASE', 'phase-production-build');
    server.fetchSermonLibrary.mockRejectedValueOnce(
      new YoutubeApiError('playlistItems', 403, 'quotaExceeded')
    );
    const s = await prefetchSermonLibrary('sunday');
    expect(keysOf(s)).toEqual([]); // 실패한 쿼리는 싣지 않는다 — 화면이 이어서 받는다
  });

  it('운영 중 다시 만들 때 실패하면 던진다 — Next 가 직전에 성공한 페이지를 계속 보여 준다', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PHASE', 'phase-production-server');
    server.fetchSermonLibrary.mockRejectedValueOnce(new YoutubeApiError('playlistItems', 500));
    await expect(prefetchSermonLibrary('sunday')).rejects.toMatchObject({ status: 500 });
  });
});

describe('prefetchSermonWatch — 설교 한 편 페이지', () => {
  it('설교 목록과 그 설교의 설명을 미리 받아 실어 보낸다', async () => {
    const { state, found } = await prefetchSermonWatch('sunday', 'old');
    expect(found).toBe(true);
    expect(keysOf(state)).toEqual([
      sermonLibraryQueryKey('sunday'),
      sermonDescriptionQueryKey('sunday', 'old'),
    ]);
    expect(server.fetchSermonDescription).toHaveBeenCalledTimes(1);
    expect(server.fetchSermonDescription).toHaveBeenCalledWith('sunday', 'old');
  });

  it('목록에 없는 영상이면 found=false — 페이지가 404 를 낸다. 설명은 받지 않는다', async () => {
    const { state, found } = await prefetchSermonWatch('sunday', 'nope');
    expect(found).toBe(false);
    expect(keysOf(state)).toEqual([sermonLibraryQueryKey('sunday')]);
    expect(server.fetchSermonDescription).not.toHaveBeenCalled();
  });

  it('목록에 있는데 설명을 못 찾으면(null) 빈 글로 싣는다 — 화면이 404 를 받으러 가지 않게', async () => {
    server.fetchSermonDescription.mockResolvedValueOnce(null);
    const { state } = await prefetchSermonWatch('sunday', 'new');
    expect(state.queries[1].state.data).toBe('');
  });

  it('빌드 중 목록을 못 받으면 found 는 모름(undefined) — 404 로 단정하지 않고 화면이 직접 받게', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PHASE', 'phase-production-build');
    server.fetchSermonLibrary.mockRejectedValueOnce(
      new YoutubeApiError('playlistItems', 403, 'quotaExceeded')
    );
    const { state, found } = await prefetchSermonWatch('sunday', 'new');
    expect(found).toBeUndefined();
    expect(keysOf(state)).toEqual([]);
    expect(server.fetchSermonDescription).not.toHaveBeenCalled();
  });

  it('운영 중에도 실패를 던지지 않는다 — 설교 페이지는 처음 열릴 때 만들어 직전 성공본이 없을 수 있다(던지면 오류 화면)', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PHASE', 'phase-production-server');
    server.fetchSermonLibrary.mockRejectedValueOnce(new YoutubeApiError('playlistItems', 500));
    const { state, found } = await prefetchSermonWatch('sunday', 'new');
    expect(found).toBeUndefined();
    expect(keysOf(state)).toEqual([]); // 화면이 /api 로 이어서 받는다
  });

  it('설명만 못 받았으면 목록은 싣고 설명은 화면이 받게 둔다', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PHASE', 'phase-production-server');
    server.fetchSermonDescription.mockRejectedValueOnce(new YoutubeApiError('playlistItems', 500));
    const { state, found } = await prefetchSermonWatch('sunday', 'new');
    expect(found).toBe(true);
    expect(keysOf(state)).toEqual([sermonLibraryQueryKey('sunday')]);
  });
});
