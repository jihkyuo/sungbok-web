import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/domains/worship-video/api/worshipVideo.server', () => ({
  fetchSermonDescription: vi.fn(),
}));

import { fetchSermonDescription } from '@/domains/worship-video/api/worshipVideo.server';
import { YoutubeApiError } from '@/shared/api/youtubeApi.server';

import { GET } from './route';

const req = (q: string) => new NextRequest(`http://localhost/api/worship-video/description${q}`);

beforeEach(() => {
  vi.mocked(fetchSermonDescription)
    .mockReset()
    .mockImplementation(async (_page, id) => (id === 'a' ? '본문' : id === 'empty' ? '' : null));
});

describe('GET /api/worship-video/description', () => {
  it('영상의 설명 글을 { body } 로 돌려준다 — 빈 설명도 200', async () => {
    const r = await GET(req('?page=sunday&v=a'));
    expect(r.status).toBe(200);
    await expect(r.json()).resolves.toEqual({ body: '본문' });
    expect(fetchSermonDescription).toHaveBeenCalledWith('sunday', 'a');

    const empty = await GET(req('?page=sunday&v=empty'));
    expect(empty.status).toBe(200);
    await expect(empty.json()).resolves.toEqual({ body: '' });
  });

  it('그 페이지 목록에 없는 영상은 404', async () => {
    expect((await GET(req('?page=sunday&v=nope'))).status).toBe(404);
  });

  it('page 가 설정에 없거나 v 가 없으면 400 — 서버 함수를 부르지 않는다', async () => {
    expect((await GET(req('?page=nope&v=a'))).status).toBe(400);
    expect((await GET(req('?page=sunday'))).status).toBe(400);
    expect((await GET(req('?v=a'))).status).toBe(400);
    expect(fetchSermonDescription).not.toHaveBeenCalled();
  });

  it('유튜브 실패는 종류대로 — 쿼터 소진 429', async () => {
    vi.mocked(fetchSermonDescription).mockRejectedValueOnce(
      new YoutubeApiError('playlistItems', 403, 'quotaExceeded')
    );
    expect((await GET(req('?page=sunday&v=a'))).status).toBe(429);
  });
});
