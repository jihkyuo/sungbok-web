import { beforeEach, describe, expect, it, vi } from 'vitest';

// 호출만 가짜로 — 썸네일 고르기·목록 검사 등 나머지는 실제 것을 쓴다
vi.mock('@/shared/api/youtubeApi.server', async importOriginal => ({
  ...(await importOriginal<typeof import('@/shared/api/youtubeApi.server')>()),
  youtubeGet: vi.fn(),
}));
// 재생목록 설정은 시험용으로 — 실제 id 에 묶이지 않게
vi.mock('../config/worshipPages', () => ({
  WORSHIP_PAGES: { sunday: ['PL-SUN'], both: ['PL-A', 'PL-B'] },
}));

import { YoutubeApiError, youtubeGet } from '@/shared/api/youtubeApi.server';

import type { WorshipPage } from '../config/worshipPages';
import { SINGLES } from './sermonParse';
import {
  fetchSermonDescription,
  fetchSermonLibrary,
  MAX_PLAYLIST_PAGES,
} from './worshipVideo.server';

const get = vi.mocked(youtubeGet);
const BOTH = 'both' as WorshipPage;

type Over = {
  title?: string;
  description?: string;
  thumbnails?: Record<string, { url: string }>;
  uploaded?: string;
  added?: string;
};
const item = (id: string, over: Over = {}) => ({
  snippet: {
    title: over.title ?? `시리즈 1 | 제목 ${id} | 요한복음 3:16 | 이요셉 목사`,
    description: over.description ?? '2026년 10월 25일 성복교회 주일예배\n\n본문 내용',
    thumbnails: over.thumbnails ?? { high: { url: `h/${id}` }, maxres: { url: `x/${id}` } },
    resourceId: { videoId: id },
    publishedAt: over.added,
  },
  contentDetails: { videoPublishedAt: over.uploaded ?? '2026-10-26T03:00:00Z' },
});

// 중괄호 필수 — mockReset() 은 mock 자신을 돌려주는데, beforeEach 가 함수를 돌려받으면 정리 훅으로 여겨 테스트 뒤에 부른다
beforeEach(() => {
  get.mockReset();
});

describe('fetchSermonLibrary', () => {
  it('제목·설명에서 설교 정보를 읽어 돌려준다 — 목록 썸네일은 high, 포스터는 큰 것부터', async () => {
    get.mockResolvedValueOnce({
      items: [
        item('a', {
          title:
            '사도행전 강해 66 | 구원을 위한 영과 육의 도장깨기 | 사도행전 13:4-7 | 이요셉 목사',
        }),
      ],
    });

    await expect(fetchSermonLibrary('sunday')).resolves.toEqual([
      {
        id: 'a',
        title: '구원을 위한 영과 육의 도장깨기',
        series: '사도행전 강해',
        no: 66,
        passage: '사도행전 13:4-7',
        date: '2026-10-25',
        dateFrom: 'sermon',
        thumbnail: 'h/a',
        poster: 'x/a',
      },
    ]);
    // 설명·업로드 시각까지 한 번에(쿼터는 쪽당 1로 같다), 1시간 캐시
    expect(get).toHaveBeenCalledWith(
      'playlistItems',
      { part: 'snippet,contentDetails', playlistId: 'PL-SUN', maxResults: '50' },
      3600,
      expect.any(Object)
    );
  });

  it('설명에 설교일이 없으면 업로드 시각을 한국 날짜로 바꿔 쓰고 출처를 upload 로 남긴다', async () => {
    get.mockResolvedValueOnce({
      // UTC 10/24 15:30 = 한국 10/25 00:30
      items: [item('a', { description: '[절기설교]', uploaded: '2026-10-24T15:30:00Z' })],
    });
    const [a] = await fetchSermonLibrary('sunday');
    expect(a).toMatchObject({ date: '2026-10-25', dateFrom: 'upload' });
  });

  it('설명에 없어도 제목에 날짜가 있으면 그 날짜가 설교일이다', async () => {
    get.mockResolvedValueOnce({
      items: [item('a', { title: '2024년 12월 31일 성복교회 송구영신예배', description: '' })],
    });
    const [a] = await fetchSermonLibrary('sunday');
    expect(a).toMatchObject({ date: '2024-12-31', dateFrom: 'sermon', series: SINGLES });
  });

  it('업로드 시각도 없으면 재생목록에 넣은 시각을 쓰고, 날짜를 알 수 없는 영상은 뺀다', async () => {
    get.mockResolvedValueOnce({
      items: [
        item('a', { description: '', uploaded: 'not-a-date', added: '2026-03-01T00:00:00Z' }),
        item('b', { description: '', uploaded: '' }),
      ],
    });
    await expect(fetchSermonLibrary('sunday')).resolves.toMatchObject([
      { id: 'a', date: '2026-03-01', dateFrom: 'upload' },
    ]);
  });

  it('nextPageToken 을 따라 끝까지 모아 날짜 최신순으로 준다', async () => {
    get
      .mockResolvedValueOnce({
        items: [item('old', { description: '2025년 1월 5일 주일예배' })],
        nextPageToken: 'p2',
      })
      .mockResolvedValueOnce({ items: [item('new', { description: '2026년 11월 1일 주일예배' })] });

    expect((await fetchSermonLibrary('sunday')).map(s => s.id)).toEqual(['new', 'old']);
    expect(get).toHaveBeenNthCalledWith(
      2,
      'playlistItems',
      { part: 'snippet,contentDetails', playlistId: 'PL-SUN', maxResults: '50', pageToken: 'p2' },
      3600,
      expect.any(Object)
    );
  });

  it('삭제·비공개 영상(영상 id 나 썸네일 없음)은 뺀다 — 빈 이미지 카드를 만들지 않게', async () => {
    get.mockResolvedValueOnce({
      items: [
        item('a'),
        item('gone', { thumbnails: {} }),
        { snippet: { title: 'Private video', thumbnails: {} } },
      ],
    });
    expect((await fetchSermonLibrary('sunday')).map(s => s.id)).toEqual(['a']);
  });

  it('여러 재생목록을 쓰는 페이지는 합치고, 두 목록에 다 있는 영상은 한 번만 넣는다', async () => {
    get.mockImplementation(async (_path, params) =>
      params.playlistId === 'PL-A'
        ? { items: [item('a'), item('same')] }
        : { items: [item('same'), item('b')] }
    );
    expect((await fetchSermonLibrary(BOTH)).map(s => s.id).sort()).toEqual(['a', 'b', 'same']);
  });

  it('띄어쓰기만 다른 시리즈 이름은 한 시리즈로 묶는다 — 가장 최근 편의 표기를 쓴다', async () => {
    get.mockResolvedValueOnce({
      items: [
        item('m151', {
          title: '마태복음강해 151 | 지상대위임령 | 이요셉 목사',
          description: '2025년 1월 26일 주일예배',
        }),
        item('m150', {
          title: '마태복음 강해 150 | 부활의 능력 | 이요셉 목사',
          description: '2025년 1월 19일 주일예배',
        }),
      ],
    });
    const lib = await fetchSermonLibrary('sunday');
    expect(lib.map(s => [s.id, s.series])).toEqual([
      ['m151', '마태복음강해'],
      ['m150', '마태복음강해'],
    ]);
  });

  it('응답 스키마는 삭제·비공개 영상이 섞인 응답을 받아들이고, 모양이 다른 응답은 거른다', async () => {
    get.mockResolvedValueOnce({ items: [] });
    await fetchSermonLibrary('sunday');
    const schema = get.mock.calls[0][3];
    const real = {
      items: [item('a'), { snippet: { title: 'Private video', thumbnails: {} } }],
      nextPageToken: 'p2',
    };
    expect(schema.safeParse(real).success).toBe(true);
    expect(schema.safeParse({ items: {} }).success).toBe(false);
  });

  it('토큰이 끝없이 이어져도 MAX_PLAYLIST_PAGES 쪽에서 멈춘다(쿼터 보호)', async () => {
    let n = 0;
    get.mockImplementation(async () => ({ items: [item(`v${n++}`)], nextPageToken: 'again' }));
    const r = await fetchSermonLibrary('sunday');
    expect(get).toHaveBeenCalledTimes(MAX_PLAYLIST_PAGES);
    expect(r).toHaveLength(MAX_PLAYLIST_PAGES);
  });

  it('유튜브 실패는 그대로 던진다 — 응답 상태는 부르는 쪽(Route Handler)이 가른다', async () => {
    get.mockRejectedValueOnce(new YoutubeApiError('playlistItems', 403, 'quotaExceeded'));
    await expect(fetchSermonLibrary('sunday')).rejects.toBeInstanceOf(YoutubeApiError);
  });
});

describe('fetchSermonDescription', () => {
  it('설명 본문을 준다 — 설교일 줄은 뺀 것', async () => {
    get.mockResolvedValue({
      items: [
        item('a', { description: '2026년 10월 25일 주일예배\n\n[사도행전 강해 66]\n#성복교회' }),
      ],
    });
    await expect(fetchSermonDescription('sunday', 'a')).resolves.toBe(
      '[사도행전 강해 66]\n#성복교회'
    );
  });

  it('설명이 빈 영상은 빈 문자열, 목록에 없는 id 는 null — 임의 id 로 유튜브를 더 부르지 않는다', async () => {
    get.mockResolvedValue({ items: [item('a', { description: '' })] });
    await expect(fetchSermonDescription('sunday', 'a')).resolves.toBe('');
    await expect(fetchSermonDescription('sunday', 'nope')).resolves.toBeNull();
    // 목록을 모으는 요청뿐(영상별 요청 없음)
    expect(get.mock.calls.every(([path]) => path === 'playlistItems')).toBe(true);
  });
});
