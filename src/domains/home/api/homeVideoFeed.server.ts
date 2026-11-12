// 홈 영상 피드 — 유튜브 Data API 호출·조합. 서버 전용 — `src/app/api/home-video/route.ts`(브라우저 폴링)와 `homeVideoPrefetch.server.ts`(홈 ISR 미리 채우기)만 import.
// 클라이언트에서 부르면 쿼터가 방문자 수만큼 든다(스펙 §4). 호출 3회(playlistItems 2 + videos 1), 응답은 Next Data Cache 60초.

import 'server-only'; // 화면(클라이언트) 코드가 가져다 쓰면 빌드가 실패한다 — 키·쿼터는 서버에만

import { z } from 'zod';

import {
  NOTICE_PLAYLIST_ID,
  SERMON_PREACHER,
  UPLOADS_PLAYLIST_ID,
} from '@/domains/home/data/homeVideo';

import {
  isoDurationToSeconds,
  pickLatestSermon,
  pickLive,
  type HomeVideo,
  type HomeVideoFeedData,
} from './homeVideoFeed';

import {
  pickThumbnail,
  youtubeGet,
  youtubeGetDated,
  YoutubeApiError,
  YoutubeNetworkError,
  YoutubeShapeError,
  validItems,
  youtubeThumbnailsSchema,
} from '@/shared/api/youtubeApi.server';

// 응답 스키마 — 화면에 꼭 필요한 값(id·제목·게시 시각)은 필수, 나머지는 optional.
// 필수값이 빠진 항목은 validItems 가 그 항목만 뺀다(목록 전체는 산다).
const playlistItemsSchema = z.object({
  items: validItems(
    'playlistItems',
    z.object({ contentDetails: z.object({ videoId: z.string() }) })
  ),
});
const videoSchema = z.object({
  id: z.string(),
  snippet: z.object({
    title: z.string(),
    description: z.string().optional(),
    publishedAt: z.string(),
    thumbnails: youtubeThumbnailsSchema.optional(), // 라이브 시작 직후·처리 중엔 없을 수 있다 — 빈 썸네일로 둔다
    // 모르는 값이 새로 생겨도 피드 전체를 깨지 않는다 — «방송 아님»으로 본다(라이브로 잘못 띄우는 쪽보다 안전)
    liveBroadcastContent: z.enum(['none', 'live', 'upcoming']).catch('none'),
  }),
  contentDetails: z.object({ duration: z.string().optional() }).optional(),
  liveStreamingDetails: z.object({ actualStartTime: z.string().optional() }).optional(),
});
const videosSchema = z.object({ items: validItems('videos', videoSchema) });
type VideoItem = z.output<typeof videoSchema>;

// Data Cache 보관 시간(초) — 재생목록·영상 정보가 같은 주기로 새로 받도록 한 곳에서 정한다.
const REVALIDATE = 60;

const toVideo = (v: VideoItem): HomeVideo => ({
  id: v.id,
  title: v.snippet.title,
  description: v.snippet.description ?? '',
  publishedAt: v.snippet.publishedAt,
  // 홈은 크게 보여 주므로 큰 것부터
  thumbnail: pickThumbnail(v.snippet.thumbnails, [
    'maxres',
    'standard',
    'high',
    'medium',
    'default',
  ]),
  durationSec:
    v.snippet.liveBroadcastContent === 'none'
      ? isoDurationToSeconds(v.contentDetails?.duration)
      : null,
  broadcast: v.snippet.liveBroadcastContent,
  liveStart: v.liveStreamingDetails?.actualStartTime ?? null,
});

// 영상 정보(라이브 여부 포함)와 그 응답을 유튜브가 만든 시각 — 캐시에 남은 옛 응답이면 라이브를 믿지 않는다.
const videosById = async (ids: string[]) => {
  if (ids.length === 0) return { videos: new Map<string, HomeVideo>(), fetchedAt: Date.now() };
  const { data, fetchedAt } = await youtubeGetDated(
    'videos',
    { part: 'snippet,contentDetails,liveStreamingDetails', id: ids.join(','), maxResults: '50' },
    REVALIDATE,
    videosSchema
  );
  return { videos: new Map(data.items.map(v => [v.id, toVideo(v)])), fetchedAt };
};

const playlistIds = async (playlistId: string, max: number) => {
  const r = await youtubeGet(
    'playlistItems',
    { part: 'contentDetails', playlistId, maxResults: String(max) },
    REVALIDATE,
    playlistItemsSchema
  );
  return r.items.map(i => i.contentDetails.videoId);
};

// 피드와, 그 안 영상 정보를 유튜브가 만든 시각(라이브 만료 판단에 쓴다).
const fetchFeed = async (): Promise<{
  data: Omit<HomeVideoFeedData, 'staleMs'>;
  fetchedAt: number;
}> => {
  const [uploadIds, noticeIds] = await Promise.all([
    playlistIds(UPLOADS_PLAYLIST_ID, 15),
    playlistIds(NOTICE_PLAYLIST_ID, 10),
  ]);
  const { videos: all, fetchedAt } = await videosById([...new Set([...uploadIds, ...noticeIds])]);
  const uploads = uploadIds.map(id => all.get(id)).filter((v): v is HomeVideo => !!v);
  const notices = noticeIds.map(id => all.get(id)).filter((v): v is HomeVideo => !!v);
  // 설명은 설교 고르기(pickLatestSermon)에만 쓰고 화면엔 안 쓴다 — 응답·미리 채우기(페이지)에 실려 무거워지지 않게 비운다.
  const lean = (v: HomeVideo) => ({ ...v, description: '' });
  const live = pickLive(uploads);
  const sermon = pickLatestSermon(uploads, SERMON_PREACHER);
  return {
    data: {
      live: live && lean(live),
      sermon: sermon && lean(sermon),
      notices: notices.map(lean),
    },
    fetchedAt,
  };
};

// 응답에 영상 정보의 나이(staleMs)를 싣는다. Data Cache 는 다시 받기가 실패하면 옛 응답을 조용히 계속 내주는데,
// 라이브를 믿을지(끝난 라이브가 «ON AIR» 로 남지 않게)는 화면 훅이 이 값 하나로 판단한다 — 서버는 지우지 않는다.
const withAge = ({
  data,
  fetchedAt,
}: Awaited<ReturnType<typeof fetchFeed>>): HomeVideoFeedData => ({
  ...data,
  staleMs: Math.max(0, Date.now() - fetchedAt),
});

// Data Cache 는 200 만 저장한다 — 유튜브가 403/5xx·어긋난 모양을 내는 동안은 마지막 성공분으로 버틴다(stale-while-error).
// 마지막 성공분은 10분까지만, 유튜브 실패일 때만 대신 쓴다 — 우리 코드 버그는 가리지 않고, 그 뒤로는 실패를
// 그대로 알린다. 대신 줄 때도 staleMs 는 원래 응답 시각부터 세므로 라이브 만료가 밀리지 않는다.
const LAST_GOOD_MAX_AGE = 10 * 60_000;
let lastGood: { feed: Awaited<ReturnType<typeof fetchFeed>>; at: number } | null = null;

export const fetchHomeVideoFeed = async (): Promise<HomeVideoFeedData> => {
  try {
    const feed = await fetchFeed();
    lastGood = { feed, at: Date.now() };
    return withAge(feed);
  } catch (e) {
    // 응답 모양 오류도 유튜브 쪽 문제다 — 홈 영상을 비우지 않고 버틴다(우리 코드 버그만 그대로 드러낸다)
    const youtubeFailure =
      e instanceof YoutubeApiError ||
      e instanceof YoutubeNetworkError ||
      e instanceof YoutubeShapeError;
    if (youtubeFailure && lastGood && Date.now() - lastGood.at <= LAST_GOOD_MAX_AGE) {
      return withAge(lastGood.feed);
    }
    throw e;
  }
};
