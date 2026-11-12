import { beforeEach, describe, expect, it, vi } from 'vitest';

// 호출만 가짜로 — 썸네일 고르기 등 나머지는 실제 것을 쓴다
vi.mock('@/shared/api/youtubeApi.server', async importOriginal => ({
  ...(await importOriginal<typeof import('@/shared/api/youtubeApi.server')>()),
  youtubeGet: vi.fn(),
}));

import { youtubeGet } from '@/shared/api/youtubeApi.server';

import {
  fetchPlaylists,
  fetchPlaylistVideos,
  isChannelPlaylist,
  MAX_PLAYLIST_PAGES,
} from './worshipVideo.server';

const get = vi.mocked(youtubeGet);

const item = (
  id: string,
  thumbs: Record<string, { url: string }> = { high: { url: `h/${id}` } }
) => ({
  snippet: { title: `t-${id}`, thumbnails: thumbs, resourceId: { videoId: id } },
});

beforeEach(() => {
  get.mockReset();
  vi.stubEnv('NEXT_PUBLIC_YOUTUBE_CHANNEL_ID', 'CH');
});

describe('fetchPlaylists', () => {
  it('채널의 재생목록을 id·제목만 남겨 돌려준다 — 1시간 캐시', async () => {
    get.mockResolvedValue({
      items: [
        { id: 'PL1', snippet: { title: '주일예배' } },
        { id: 'PL2', snippet: {} },
      ],
    });

    await expect(fetchPlaylists(5)).resolves.toEqual([
      { id: 'PL1', title: '주일예배' },
      { id: 'PL2', title: '' },
    ]);
  });

  it('표시(5개)와 허용 검사(50개)가 같은 요청(=같은 캐시 항목)을 쓴다 — 새 탭이 404 나지 않게', async () => {
    get.mockResolvedValue({
      items: Array.from({ length: 8 }, (_, i) => ({ id: `PL${i}`, snippet: { title: `t${i}` } })),
    });

    await expect(fetchPlaylists(5)).resolves.toHaveLength(5);
    await expect(isChannelPlaylist('PL7')).resolves.toBe(true);

    const params = get.mock.calls.map(([, p]) => p);
    expect(params).toEqual([
      { part: 'snippet', channelId: 'CH', maxResults: '50' },
      { part: 'snippet', channelId: 'CH', maxResults: '50' },
    ]);
  });
});

describe('fetchPlaylistVideos', () => {
  it('nextPageToken 을 따라 끝까지 모아 id·제목·썸네일로 줄인다', async () => {
    get
      .mockResolvedValueOnce({ items: [item('a'), item('b')], nextPageToken: 'p2' })
      .mockResolvedValueOnce({ items: [item('c', { medium: { url: 'm/c' } })] });

    await expect(fetchPlaylistVideos('PL1')).resolves.toEqual([
      { id: 'a', title: 't-a', thumbnail: 'h/a' },
      { id: 'b', title: 't-b', thumbnail: 'h/b' },
      { id: 'c', title: 't-c', thumbnail: 'm/c' },
    ]);
    expect(get).toHaveBeenNthCalledWith(
      1,
      'playlistItems',
      { part: 'snippet', playlistId: 'PL1', maxResults: '50' },
      3600,
      expect.any(Object) // 응답 스키마
    );
    expect(get).toHaveBeenNthCalledWith(
      2,
      'playlistItems',
      { part: 'snippet', playlistId: 'PL1', maxResults: '50', pageToken: 'p2' },
      3600,
      expect.any(Object)
    );
  });

  it('응답 스키마는 삭제·비공개 영상(id·썸네일 없음)이 섞인 응답을 받아들이고, 모양이 다른 응답은 거른다', async () => {
    get.mockResolvedValueOnce({ items: [] });
    await fetchPlaylistVideos('PL1');
    const schema = get.mock.calls[0][3];
    const real = {
      items: [item('a'), { snippet: { title: 'Private video', thumbnails: {} } }],
      nextPageToken: 'p2',
    };
    expect(schema.safeParse(real).success).toBe(true);
    expect(schema.safeParse({ items: {} }).success).toBe(false);
  });

  it('비공개·삭제 영상(영상 id 없음)은 뺀다', async () => {
    get.mockResolvedValueOnce({
      items: [item('a'), { snippet: { title: 'Private video', thumbnails: {} } }],
    });
    await expect(fetchPlaylistVideos('PL1')).resolves.toEqual([
      { id: 'a', title: 't-a', thumbnail: 'h/a' },
    ]);
  });

  it('영상 id 는 남아 있어도 썸네일이 없는 항목(삭제·비공개)은 뺀다 — 빈 src 이미지 카드를 만들지 않게', async () => {
    get.mockResolvedValueOnce({ items: [item('a'), item('gone', {})] });
    await expect(fetchPlaylistVideos('PL1')).resolves.toEqual([
      { id: 'a', title: 't-a', thumbnail: 'h/a' },
    ]);
  });

  it('토큰이 끝없이 이어져도 MAX_PLAYLIST_PAGES 쪽에서 멈춘다(쿼터 보호)', async () => {
    get.mockResolvedValue({ items: [item('x')], nextPageToken: 'again' });
    const r = await fetchPlaylistVideos('PL1');
    expect(get).toHaveBeenCalledTimes(MAX_PLAYLIST_PAGES);
    expect(r).toHaveLength(MAX_PLAYLIST_PAGES);
  });
});

describe('isChannelPlaylist', () => {
  const channelList = {
    items: [
      { id: 'NEW1', snippet: { title: 'n' } },
      { id: 'OLD', snippet: { title: 'o' } },
    ],
  };

  it('채널 재생목록 넓은 창(50개)에 있으면 true — 상위 5개에서 밀려난 탭도 열린다', async () => {
    get.mockResolvedValue(channelList);
    await expect(isChannelPlaylist('OLD')).resolves.toBe(true);
    expect(get).toHaveBeenCalledWith(
      'playlists',
      { part: 'snippet', channelId: 'CH', maxResults: '50' },
      3600,
      expect.any(Object) // 응답 스키마
    );
  });

  it('id 를 바꿔 가며 불러도 id 별 유튜브 호출을 만들지 않는다(쿼터 보호) — 없는 id 는 false', async () => {
    get.mockResolvedValue(channelList);
    await expect(isChannelPlaylist('RANDOM1')).resolves.toBe(false);
    await expect(isChannelPlaylist('RANDOM2')).resolves.toBe(false);
    for (const [, params] of get.mock.calls) expect(params).not.toHaveProperty('id');
  });
});
