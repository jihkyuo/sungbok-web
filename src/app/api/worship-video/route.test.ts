import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/domains/worship-video/api/worshipVideo.server', () => ({
  isChannelPlaylist: vi.fn(),
  fetchPlaylistVideos: vi.fn(),
}));

import {
  fetchPlaylistVideos,
  isChannelPlaylist,
} from '@/domains/worship-video/api/worshipVideo.server';

import { YoutubeApiError } from '@/shared/api/youtubeApi.server';

import { GET } from './route';

const req = (q: string) => new NextRequest(`http://localhost/api/worship-video${q}`);

beforeEach(() => {
  vi.mocked(isChannelPlaylist)
    .mockReset()
    .mockImplementation(async id => id === 'PL1');
  vi.mocked(fetchPlaylistVideos)
    .mockReset()
    .mockResolvedValue([{ id: 'v1', title: 't', thumbnail: '' }]);
});

describe('GET /api/worship-video', () => {
  it('우리 채널 재생목록이면 영상 목록을 돌려준다', async () => {
    const r = await GET(req('?playlistId=PL1'));
    expect(r.status).toBe(200);
    await expect(r.json()).resolves.toEqual([{ id: 'v1', title: 't', thumbnail: '' }]);
    expect(isChannelPlaylist).toHaveBeenCalledWith('PL1');
    expect(fetchPlaylistVideos).toHaveBeenCalledWith('PL1');
  });

  it('남의 채널 재생목록은 404 — 남의 재생목록으로 쿼터를 쓰지 못하게', async () => {
    const r = await GET(req('?playlistId=OTHER'));
    expect(r.status).toBe(404);
    expect(fetchPlaylistVideos).not.toHaveBeenCalled();
  });

  it('playlistId 가 없으면 400', async () => {
    expect((await GET(req(''))).status).toBe(400);
  });

  it('유튜브 실패는 종류대로 — 쿼터 소진 429, 일시 장애 503, 그 밖 502', async () => {
    vi.mocked(fetchPlaylistVideos).mockRejectedValue(
      new YoutubeApiError('playlistItems', 403, 'quotaExceeded')
    );
    expect((await GET(req('?playlistId=PL1'))).status).toBe(429);

    vi.mocked(fetchPlaylistVideos).mockRejectedValue(new YoutubeApiError('playlistItems', 500));
    expect((await GET(req('?playlistId=PL1'))).status).toBe(503);

    vi.mocked(fetchPlaylistVideos).mockRejectedValue(new YoutubeApiError('playlistItems', 400));
    expect((await GET(req('?playlistId=PL1'))).status).toBe(502);
  });

  it('실패 응답에는 내부 오류 메시지를 싣지 않는다(서버 로그에만)', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(fetchPlaylistVideos).mockRejectedValue(
      new TypeError("Cannot read properties of undefined (reading 'map')")
    );
    const r = await GET(req('?playlistId=PL1'));
    const body = JSON.stringify(await r.json());
    expect(body).not.toContain('Cannot read');
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
});
