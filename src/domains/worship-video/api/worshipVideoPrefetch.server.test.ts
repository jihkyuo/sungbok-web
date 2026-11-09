import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const server = vi.hoisted(() => ({ fetchPlaylists: vi.fn(), fetchPlaylistVideos: vi.fn() }));
vi.mock('./worshipVideo.server', () => server);

import { YoutubeApiError } from '@/shared/api/youtubeApi.server';

import { prefetchWorshipVideos } from './worshipVideoPrefetch.server';
import { PLAYLISTS_QUERY_KEY, playlistVideosQueryKey } from './worshipVideoQueries';

const keysOf = (s: Awaited<ReturnType<typeof prefetchWorshipVideos>>) =>
  s.queries.map(q => q.queryKey);

beforeEach(() => {
  server.fetchPlaylists.mockReset().mockResolvedValue([
    { id: 'A', title: '주일' },
    { id: 'B', title: '수요' },
  ]);
  server.fetchPlaylistVideos
    .mockReset()
    .mockResolvedValue([{ id: 'v', title: 't', thumbnail: 'x' }]);
});
afterEach(() => vi.unstubAllEnvs());

describe('prefetchWorshipVideos', () => {
  it('재생목록과 모든 탭 영상을 미리 받아 실어 보낸다 — 탭을 옮겨도 화면이 따로 받지 않는다', async () => {
    const s = await prefetchWorshipVideos();
    expect(keysOf(s)).toEqual([
      PLAYLISTS_QUERY_KEY,
      playlistVideosQueryKey('A'),
      playlistVideosQueryKey('B'),
    ]);
    expect(server.fetchPlaylistVideos).toHaveBeenCalledTimes(2);
  });

  it('탭 영상은 동시에 받는다 — 탭 수만큼 페이지 만들기가 늘어지지 않게', async () => {
    let started = 0;
    server.fetchPlaylistVideos.mockImplementation(async () => {
      started++;
      await new Promise(r => setTimeout(r, 0));
      return [{ id: 'v', title: 't', thumbnail: 'x' }];
    });
    const p = prefetchWorshipVideos();
    await new Promise(r => setTimeout(r, 0));
    expect(started).toBe(2);
    await p;
  });

  it('빌드 중 유튜브가 실패해도(쿼터 소진 등) 던지지 않는다 — 배포를 막지 않고 화면이 직접 받게', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PHASE', 'phase-production-build');
    server.fetchPlaylists.mockRejectedValueOnce(
      new YoutubeApiError('playlists', 403, 'quotaExceeded')
    );
    const s = await prefetchWorshipVideos();
    expect(keysOf(s)).toEqual([]); // 실패한 쿼리는 싣지 않는다 — 화면이 이어서 받는다
  });

  it('한 탭 영상만 실패하면 나머지는 싣고 넘긴다(빌드·개발) — 그 탭은 화면이 직접 받는다', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    server.fetchPlaylistVideos.mockImplementation(async (id: string) => {
      if (id === 'A') throw new YoutubeApiError('playlistItems', 500);
      return [{ id: 'v', title: 't', thumbnail: 'x' }];
    });
    const s = await prefetchWorshipVideos();
    expect(keysOf(s)).toEqual([PLAYLISTS_QUERY_KEY, playlistVideosQueryKey('B')]);
  });

  it('운영 중 다시 만들 때 실패하면 던진다 — Next 가 직전에 성공한 페이지를 계속 보여 준다', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PHASE', 'phase-production-server');
    server.fetchPlaylistVideos.mockRejectedValueOnce(new YoutubeApiError('playlistItems', 500));
    await expect(prefetchWorshipVideos()).rejects.toMatchObject({ status: 500 });
  });

  it('재생목록이 0개면 영상은 받지 않는다', async () => {
    server.fetchPlaylists.mockResolvedValueOnce([]);
    const s = await prefetchWorshipVideos();
    expect(keysOf(s)).toEqual([PLAYLISTS_QUERY_KEY]);
    expect(server.fetchPlaylistVideos).not.toHaveBeenCalled();
  });
});
