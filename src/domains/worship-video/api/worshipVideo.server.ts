// 예배 설교 영상 모으기 — 서버 전용. 예배 페이지(`/worship/sunday` 등)와 Route Handler(`/api/worship-video/*`)만 import.
// 페이지에 연결한 재생목록(config/worshipPages)의 영상을 유튜브에서 모아 설교 목록으로 만든다. 응답은 1시간 Data Cache —
// 방문자 수와 무관하게 재생목록 쪽 수만큼만 유튜브를 부른다. 분류·날짜는 제목·설명에서 읽는다(sermonParse).

import 'server-only'; // 화면(클라이언트) 코드가 가져다 쓰면 빌드가 실패한다 — 키·쿼터는 서버에만

import { z } from 'zod';

import {
  pickThumbnail,
  validItems,
  youtubeGet,
  youtubeThumbnailsSchema,
} from '@/shared/api/youtubeApi.server';

import { WORSHIP_PAGES, type WorshipPage } from '../config/worshipPages';
import { sortSermons } from './sermonList';
import { dateInText, parseSermonDescription, parseSermonTitle } from './sermonParse';
import type { Sermon } from './worshipVideo.types';

const REVALIDATE = 3600;
// 50개 × 100쪽 = 5000개까지 모은다(주 1회 설교 기준 수십 년). 무한 토큰에서 쿼터를 지키는 안전장치일 뿐,
// 실제 재생목록이 이 한도에 닿을 일은 없다고 본다. 응답은 1시간 캐시라 쿼터는 재생목록당 시간당 최대 100유닛.
export const MAX_PLAYLIST_PAGES = 100;

// 응답 스키마 — 아래 코드가 빠진 값을 이미 걸러 내므로(id·썸네일·날짜 없음 → 제외) 전부 optional.
// 모양 자체가 다를 때(배열 자리에 객체 등)만 YoutubeShapeError 로 실패한다.
const playlistItemsSchema = z.object({
  items: validItems(
    'playlistItems',
    z.object({
      snippet: z
        .object({
          title: z.string().optional(),
          description: z.string().optional(),
          thumbnails: youtubeThumbnailsSchema.optional(),
          resourceId: z.object({ videoId: z.string().optional() }).optional(),
          // 재생목록에 넣은 시각 — 업로드 시각이 없을 때만 쓴다
          publishedAt: z.string().optional(),
        })
        .optional(),
      // 영상을 올린(공개한) 시각
      contentDetails: z.object({ videoPublishedAt: z.string().optional() }).optional(),
    })
  ),
  nextPageToken: z.string().optional(),
});

/**
 * UTC 시각 → 한국 달력 날짜(YYYY-MM-DD). 설교일은 «어느 주일»인지가 뜻이라 시각이 아닌 날짜로 다룬다 —
 * 서버(UTC)에서 그대로 자르면 토요일 밤(UTC)에 올린 주일 새벽(KST) 영상이 하루 어긋난다(ADR 0012: 시간대는 명시).
 */
const seoulDate = (iso: string | undefined): string | undefined => {
  if (!iso) return undefined;
  try {
    return Temporal.Instant.from(iso).toZonedDateTimeISO('Asia/Seoul').toPlainDate().toString();
  } catch {
    return undefined; // 시각 모양이 아닌 값
  }
};

type Collected = { sermons: Sermon[]; descriptions: Map<string, string> };

// 재생목록 하나를 끝까지 — 쪽은 토큰을 따라 차례로 받는다
const collectPlaylist = async (playlistId: string, into: Collected, seen: Set<string>) => {
  let pageToken: string | undefined;
  for (let page = 0; page < MAX_PLAYLIST_PAGES; page++) {
    const r = await youtubeGet(
      'playlistItems',
      {
        part: 'snippet,contentDetails',
        playlistId,
        maxResults: '50',
        ...(pageToken ? { pageToken } : {}),
      },
      REVALIDATE,
      playlistItemsSchema
    );
    for (const { snippet, contentDetails } of r.items) {
      const id = snippet?.resourceId?.videoId;
      // 삭제·비공개 영상은 id 가 남아도 썸네일이 비어 온다 — 빈 src 카드를 만들지 않게 뺀다
      const thumbnail = pickThumbnail(snippet?.thumbnails, [
        'high',
        'medium',
        'default',
        'standard',
        'maxres',
      ]);
      // 같은 영상이 두 재생목록(또는 한 목록에 두 번) 있어도 한 번만
      if (!id || !thumbnail || seen.has(id)) continue;

      const rawTitle = snippet?.title ?? '';
      const description = parseSermonDescription(snippet?.description ?? '');
      const sermonDate = description.date ?? dateInText(rawTitle);
      const date =
        sermonDate ??
        seoulDate(contentDetails?.videoPublishedAt) ??
        seoulDate(snippet?.publishedAt);
      if (!date) continue; // 날짜를 알 수 없으면 정렬할 수 없다 — 실제로는 삭제·비공개 영상뿐

      // 설교자(preacher)는 화면에 쓰지 않아 싣지 않는다
      const { series, no, occasion, title, passage } = parseSermonTitle(rawTitle);
      seen.add(id);
      into.descriptions.set(id, description.body);
      into.sermons.push({
        id,
        title,
        series,
        ...(no !== undefined && { no }),
        ...(occasion && { occasion }),
        ...(passage && { passage }),
        date,
        dateFrom: sermonDate ? 'sermon' : 'upload',
        thumbnail,
        // 플레이어 포스터는 큰 것부터 — maxres 는 16:9, high 는 4:3(위아래 검은 띠)이라 화면에서 잘라 쓴다
        poster: pickThumbnail(snippet?.thumbnails, [
          'maxres',
          'standard',
          'high',
          'medium',
          'default',
        ]),
      });
    }
    pageToken = r.nextPageToken;
    if (!pageToken) break;
  }
};

// 띄어쓰기만 다른 시리즈 이름(«마태복음 강해»·«마태복음강해»)은 한 시리즈다 — 가장 최근 편의 표기로 맞춘다.
// 맞추지 않으면 칩이 둘로 갈리고 편수·이전/다음 편이 반쪽씩 나뉜다. sorted 는 최신순.
const unifySeriesNames = (sorted: Sermon[]): Sermon[] => {
  const names = new Map<string, string>();
  return sorted.map(s => {
    const key = s.series.replace(/\s+/g, '');
    const name = names.get(key) ?? s.series;
    names.set(key, name);
    return name === s.series ? s : { ...s, series: name };
  });
};

// 목록과 설명이 같은 수집(같은 Data Cache 항목)에서 나온다 — 설명만 따로 유튜브에 묻지 않는다.
const collect = async (page: WorshipPage): Promise<Collected> => {
  const into: Collected = { sermons: [], descriptions: new Map() };
  const seen = new Set<string>();
  // 재생목록끼리는 차례로 — 두 목록에 다 있는 영상은 앞 목록 것을 쓴다(순서가 응답 도착 순서에 흔들리지 않게)
  for (const playlistId of WORSHIP_PAGES[page]) await collectPlaylist(playlistId, into, seen);
  return {
    sermons: unifySeriesNames(sortSermons(into.sermons)),
    descriptions: into.descriptions,
  };
};

/** 예배 페이지의 설교 전체 — 날짜 최신순. 설명 본문은 무거워 싣지 않는다(fetchSermonDescription). */
export const fetchSermonLibrary = async (page: WorshipPage): Promise<Sermon[]> =>
  (await collect(page)).sermons;

/**
 * 설교 한 편의 유튜브 설명 본문(설교일 줄은 뺀 것). 그 페이지 목록에 없는 id 는 null —
 * 임의 id 를 퍼부어도 유튜브를 더 부르지 않는다(쿼터는 공용, 일 10,000 — 바닥나면 홈 영상까지 죽는다).
 */
export const fetchSermonDescription = async (
  page: WorshipPage,
  videoId: string
): Promise<string | null> => (await collect(page)).descriptions.get(videoId) ?? null;
