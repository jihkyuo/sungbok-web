// 주일예배 영상 훅 — 서버 Route Handler 에서 받는다(유튜브는 직접 부르지 않는다: 키·쿼터는 서버에만).
// 서버가 미리 채워 둔 상태(worshipVideoPrefetch.server → HydrationBoundary)가 있으면 그대로 쓴다.
// useQuery(서스펜스 아님): 서버 렌더 중에는 요청하지 않고, 실패한 쿼리는 다시 열 때(재마운트) 알아서 다시 받는다.
'use client';

import { fetchJson, retryTransient } from '@/shared/api/fetchJson';
import { useQuery } from '@tanstack/react-query';

import {
  PLAYLISTS_QUERY_KEY,
  playlistVideosQueryKey,
  toPlaylists,
  toVideos,
} from './worshipVideoQueries';

// 서버 응답은 1시간 Data Cache — 화면은 10분 지나면 다시 열 때 새로 묻는다.
const STALE = 10 * 60_000;

export const usePlaylists = () =>
  useQuery({
    queryKey: PLAYLISTS_QUERY_KEY,
    queryFn: async () => toPlaylists(await fetchJson('/api/worship-video/playlists')),
    staleTime: STALE,
    retry: retryTransient,
  });

// 취소 신호(signal)는 넘기지 않는다 — 넘기면 탭을 떠날 때(관찰자가 모두 빠질 때) react-query 가 진행 중 요청을 취소해
// 돌아왔을 때 처음부터 다시 받는다. 떠나도 끝까지 받아 캐시에 남긴다.
export const usePlaylistVideos = (playlistId: string) =>
  useQuery({
    queryKey: playlistVideosQueryKey(playlistId),
    queryFn: async () =>
      toVideos(await fetchJson(`/api/worship-video?playlistId=${encodeURIComponent(playlistId)}`)),
    staleTime: STALE,
    retry: retryTransient,
  });
