import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/domains/worship-video/api/worshipVideo.server', () => ({ fetchPlaylists: vi.fn() }));

import { fetchPlaylists } from '@/domains/worship-video/api/worshipVideo.server';
import { YoutubeApiError } from '@/shared/api/youtubeApi.server';

import { GET } from './route';

beforeEach(() => vi.mocked(fetchPlaylists).mockReset());

describe('GET /api/worship-video/playlists', () => {
  it('주일예배 탭으로 보일 재생목록을 돌려준다', async () => {
    vi.mocked(fetchPlaylists).mockResolvedValue([{ id: 'A', title: '주일' }]);
    const r = await GET();
    expect(r.status).toBe(200);
    await expect(r.json()).resolves.toEqual([{ id: 'A', title: '주일' }]);
  });

  it('유튜브 실패는 종류대로 — 쿼터 소진 429', async () => {
    vi.mocked(fetchPlaylists).mockRejectedValueOnce(
      new YoutubeApiError('playlists', 403, 'quotaExceeded')
    );
    expect((await GET()).status).toBe(429);
  });
});
