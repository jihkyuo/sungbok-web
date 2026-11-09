// 주일예배 영상 쿼리 공용 모듈(순수) — 서버 미리 받기(worshipVideoPrefetch.server)와 화면 훅(usePlaylistVideos)이 함께 쓴다.
// 'use client' 파일에 두면 서버에서는 실제 값이 아니라 클라이언트 참조로 바뀌어 키가 어긋난다 — 그래서 여기.
import type { PlaylistSummary, PlaylistVideo } from './worshipVideo.types';

export const PLAYLISTS_QUERY_KEY = ['worship-playlists'] as const;
export const playlistVideosQueryKey = (playlistId: string) =>
  ['worship-video', playlistId] as const;

const isVideo = (v: unknown): v is PlaylistVideo => {
  if (typeof v !== 'object' || v === null) return false;
  const { id, title, thumbnail } = v as Record<string, unknown>;
  return (
    typeof id === 'string' &&
    !!id &&
    typeof title === 'string' &&
    typeof thumbnail === 'string' &&
    !!thumbnail
  );
};

/**
 * 응답 본문을 영상 목록으로 — 배열이 아니면(프록시·CDN 오류 봉투 같은 200) 실패로 처리하고,
 * 모양이 맞지 않는 항목(썸네일 빠짐 등)은 걸러 한 항목 때문에 목록 전체가 깨지지 않게 한다.
 */
export const toVideos = (body: unknown): PlaylistVideo[] => {
  if (!Array.isArray(body)) throw new Error('worship-video: 영상 배열이 아닌 응답');
  return body.filter(isVideo);
};

/** 응답 본문을 재생목록 목록으로 — 배열이 아니면 실패, id 없는 항목은 거른다(제목은 비어도 된다). */
export const toPlaylists = (body: unknown): PlaylistSummary[] => {
  if (!Array.isArray(body)) throw new Error('worship-video: 재생목록 배열이 아닌 응답');
  return body.flatMap(p => {
    const { id, title } = (p ?? {}) as Record<string, unknown>;
    return typeof id === 'string' && id
      ? [{ id, title: typeof title === 'string' ? title : '' }]
      : [];
  });
};
