// 홈 영상 피드 — 유튜브 Data API 호출·조합. 서버 전용 — `src/app/api/home-video/route.ts` 만 import.
// 클라이언트에서 부르면 쿼터가 방문자 수만큼 든다(스펙 §4). 호출 3회(playlistItems 2 + videos 1), 응답은 Next Data Cache 60초.

import { NOTICE_PLAYLIST_ID, SERMON_PREACHER, UPLOADS_PLAYLIST_ID } from '@/domains/home/data/homeVideo';

import { isoDurationToSeconds, pickLatestSermon, pickLive, type HomeVideo, type HomeVideoFeedData } from './homeVideoFeed';

const API = 'https://www.googleapis.com/youtube/v3/';

type Thumbs = Record<string, { url: string; width: number; height: number } | undefined>;
type PlaylistItem = { contentDetails: { videoId: string } };
type VideoItem = {
  id: string;
  snippet: { title: string; description: string; publishedAt: string; thumbnails: Thumbs; liveBroadcastContent: 'none' | 'live' | 'upcoming' };
  contentDetails?: { duration?: string };
  liveStreamingDetails?: { actualStartTime?: string };
};

const get = async <T,>(path: string, params: Record<string, string>): Promise<T> => {
  const u = new URL(API + path);
  Object.entries({ ...params, key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY ?? '' }).forEach(([k, v]) => u.searchParams.set(k, v));
  const r = await fetch(u.toString(), { next: { revalidate: 60 } });
  if (!r.ok) throw new Error(`${path} ${r.status}`);
  return (await r.json()) as T;
};

const bestThumb = (t: Thumbs) =>
  (t.maxres ?? t.standard ?? t.high ?? t.medium ?? t.default)?.url ?? '';

const toVideo = (v: VideoItem): HomeVideo => ({
  id: v.id,
  title: v.snippet.title,
  description: v.snippet.description ?? '',
  publishedAt: v.snippet.publishedAt,
  thumbnail: bestThumb(v.snippet.thumbnails),
  durationSec: v.snippet.liveBroadcastContent === 'none' ? isoDurationToSeconds(v.contentDetails?.duration) : null,
  broadcast: v.snippet.liveBroadcastContent,
  liveStart: v.liveStreamingDetails?.actualStartTime ?? null,
});

const videosById = async (ids: string[]) => {
  if (ids.length === 0) return new Map<string, HomeVideo>();
  const r = await get<{ items: VideoItem[] }>('videos', {
    part: 'snippet,contentDetails,liveStreamingDetails',
    id: ids.join(','),
    maxResults: '50',
  });
  return new Map(r.items.map((v) => [v.id, toVideo(v)]));
};

const playlistIds = async (playlistId: string, max: number) => {
  const r = await get<{ items: PlaylistItem[] }>('playlistItems', {
    part: 'contentDetails',
    playlistId,
    maxResults: String(max),
  });
  return r.items.map((i) => i.contentDetails.videoId);
};

const fetchFeed = async (): Promise<HomeVideoFeedData> => {
  const [uploadIds, noticeIds] = await Promise.all([playlistIds(UPLOADS_PLAYLIST_ID, 15), playlistIds(NOTICE_PLAYLIST_ID, 10)]);
  const all = await videosById([...new Set([...uploadIds, ...noticeIds])]);
  const uploads = uploadIds.map((id) => all.get(id)).filter((v): v is HomeVideo => !!v);
  const notices = noticeIds.map((id) => all.get(id)).filter((v): v is HomeVideo => !!v);
  return { live: pickLive(uploads), sermon: pickLatestSermon(uploads, SERMON_PREACHER), notices };
};

// Data Cache 는 200 만 저장한다 — 유튜브가 403/5xx 를 내는 동안은 마지막 성공분으로 버틴다(stale-while-error).
let lastGood: HomeVideoFeedData | null = null;

export const fetchHomeVideoFeed = async (): Promise<HomeVideoFeedData> => {
  try {
    lastGood = await fetchFeed();
    return lastGood;
  } catch (e) {
    if (lastGood) return lastGood;
    throw e;
  }
};
