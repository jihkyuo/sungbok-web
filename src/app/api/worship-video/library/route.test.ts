import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/domains/worship-video/api/worshipVideo.server', () => ({ fetchSermonLibrary: vi.fn() }));

import { fetchSermonLibrary } from '@/domains/worship-video/api/worshipVideo.server';
import { YoutubeApiError, YoutubeNetworkError } from '@/shared/api/youtubeApi.server';

import { GET } from './route';

const req = (q: string) => new NextRequest(`http://localhost/api/worship-video/library${q}`);
const sermon = {
  id: 'a',
  title: 't',
  series: '단편 설교',
  date: '2026-10-25',
  dateFrom: 'sermon' as const,
  thumbnail: 'h/a',
  poster: 'h/a',
};

beforeEach(() => {
  vi.mocked(fetchSermonLibrary).mockReset().mockResolvedValue([sermon]);
});

describe('GET /api/worship-video/library', () => {
  it('예배 페이지의 설교 목록을 돌려준다', async () => {
    const r = await GET(req('?page=sunday'));
    expect(r.status).toBe(200);
    await expect(r.json()).resolves.toEqual([sermon]);
    expect(fetchSermonLibrary).toHaveBeenCalledWith('sunday');
  });

  it('설정에 없는 페이지·빠진 page 는 400 — 임의 값으로 유튜브를 부르지 않는다', async () => {
    expect((await GET(req('?page=nope'))).status).toBe(400);
    expect((await GET(req(''))).status).toBe(400);
    expect(fetchSermonLibrary).not.toHaveBeenCalled();
  });

  it('유튜브 실패는 종류대로 — 쿼터 소진 429, 일시 장애 503, 그 밖 502', async () => {
    vi.mocked(fetchSermonLibrary).mockRejectedValueOnce(
      new YoutubeApiError('playlistItems', 403, 'quotaExceeded')
    );
    expect((await GET(req('?page=sunday'))).status).toBe(429);
    vi.mocked(fetchSermonLibrary).mockRejectedValueOnce(
      new YoutubeNetworkError('playlistItems', new Error('timeout'))
    );
    expect((await GET(req('?page=sunday'))).status).toBe(503);
    vi.mocked(fetchSermonLibrary).mockRejectedValueOnce(new TypeError('bug'));
    expect((await GET(req('?page=sunday'))).status).toBe(502);
  });
});
