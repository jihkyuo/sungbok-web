// 주일예배 영상(재생목록) 조회 — 서버 전용. 페이지(`/worship/sunday`)와 Route Handler(`/api/worship-video`)만 import.
// 예전엔 브라우저가 gapi 로 방문자마다 재생목록 전 페이지를 불렀다. 이제 서버가 fetch 로 모아 1시간 Data Cache 에 둔다.

import 'server-only'; // 화면(클라이언트) 코드가 가져다 쓰면 빌드가 실패한다 — 키·쿼터는 서버에만

import { z } from 'zod';

import {
  pickThumbnail,
  validItems,
  youtubeGet,
  youtubeThumbnailsSchema,
  type YoutubeThumbnails,
} from '@/shared/api/youtubeApi.server';

import type { PlaylistSummary, PlaylistVideo } from './worshipVideo.types';

const REVALIDATE = 3600;
// `/worship/sunday` 탭으로 보여주는 채널 재생목록 수.
export const SUNDAY_PLAYLIST_COUNT = 5;
// 50개 × 100쪽 = 5000개까지 모은다(주 1회 설교 기준 수십 년). 무한 토큰에서 쿼터를 지키는 안전장치일 뿐,
// 실제 재생목록이 이 한도에 닿을 일은 없다고 본다. 응답은 1시간 캐시라 쿼터는 재생목록당 시간당 최대 100유닛.
export const MAX_PLAYLIST_PAGES = 100;

// 응답 스키마 — 아래 코드가 빠진 값을 이미 걸러 내므로(제목 없음 → '', id·썸네일 없음 → 제외) 전부 optional.
// 모양 자체가 다를 때(배열 자리에 객체 등)만 YoutubeShapeError 로 실패한다.
const playlistsSchema = z.object({
  items: validItems(
    'playlists',
    z.object({
      id: z.string().optional(),
      snippet: z.object({ title: z.string().optional() }).optional(),
    })
  ),
});
const playlistItemsSchema = z.object({
  items: validItems(
    'playlistItems',
    z.object({
      snippet: z
        .object({
          title: z.string().optional(),
          thumbnails: youtubeThumbnailsSchema.optional(),
          resourceId: z.object({ videoId: z.string().optional() }).optional(),
        })
        .optional(),
    })
  ),
  nextPageToken: z.string().optional(),
});

// 목록 카드는 작게 보여 주므로 high(480px)부터 — 큰 것은 받는 양만 늘린다
const thumb = (t?: YoutubeThumbnails) =>
  pickThumbnail(t, ['high', 'medium', 'default', 'standard', 'maxres']);

// 채널 재생목록 상위 50개(API 한 번의 최대치). 표시(상위 5개)와 허용 검사가 **같은 요청 = 같은 캐시 항목**을
// 나눠 쓴다 — 따로 부르면 캐시 시각이 어긋나 새로 보인 탭이 허용 목록에 아직 없어 404 가 날 수 있다.
const CHANNEL_WINDOW = 50;
const fetchChannelPlaylists = async (): Promise<PlaylistSummary[]> => {
  const r = await youtubeGet(
    'playlists',
    {
      part: 'snippet',
      channelId: process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID ?? '',
      maxResults: String(CHANNEL_WINDOW),
    },
    REVALIDATE,
    playlistsSchema
  );
  return r.items.filter(p => p.id).map(p => ({ id: p.id!, title: p.snippet?.title ?? '' }));
};

export const fetchPlaylists = async (max = SUNDAY_PLAYLIST_COUNT): Promise<PlaylistSummary[]> =>
  (await fetchChannelPlaylists()).slice(0, max);

// Route Handler 허용 검사 — 우리 채널 재생목록인지. 상위 5개에서 밀려난(이미 떠 있는) 탭도 50개 창 안이면 열린다.
// id 별로 유튜브에 묻지 않는다 — 임의 id 를 퍼부으면 쿼터(공용, 일 10,000)가 바닥나 홈 영상까지 죽는다.
export const isChannelPlaylist = async (playlistId: string): Promise<boolean> =>
  (await fetchChannelPlaylists()).some(p => p.id === playlistId);

export const fetchPlaylistVideos = async (playlistId: string): Promise<PlaylistVideo[]> => {
  const videos: PlaylistVideo[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < MAX_PLAYLIST_PAGES; page++) {
    const r = await youtubeGet(
      'playlistItems',
      { part: 'snippet', playlistId, maxResults: '50', ...(pageToken ? { pageToken } : {}) },
      REVALIDATE,
      playlistItemsSchema
    );
    for (const { snippet } of r.items) {
      const id = snippet?.resourceId?.videoId;
      const thumbnail = thumb(snippet?.thumbnails);
      // 삭제·비공개 영상은 id 가 남아도 썸네일이 비어 온다 — 빈 src 카드를 만들지 않게 뺀다
      if (id && thumbnail) videos.push({ id, title: snippet?.title ?? '', thumbnail });
    }
    pageToken = r.nextPageToken;
    if (!pageToken) break;
  }
  return videos;
};
