// 주일예배 영상 훅 — 서버 Route Handler 에서 받는다(유튜브는 직접 부르지 않는다: 키·쿼터는 서버에만).
// 서버가 미리 채워 둔 상태(worshipVideoPrefetch.server → HydrationBoundary)가 있으면 그대로 쓴다.
// useQuery(서스펜스 아님): 서버 렌더 중에는 요청하지 않고, 실패한 쿼리는 다시 열 때(재마운트) 알아서 다시 받는다.
'use client';

import { fetchJson, retryTransient } from '@/shared/api/fetchJson';
import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

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
// 화면 훅과 미리 받기가 같은 키·요청·신선 기간·재시도 정책을 쓰도록 한곳에 둔다.
const playlistVideosOptions = (playlistId: string) =>
  queryOptions({
    queryKey: playlistVideosQueryKey(playlistId),
    queryFn: async () =>
      toVideos(await fetchJson(`/api/worship-video?playlistId=${encodeURIComponent(playlistId)}`)),
    staleTime: STALE,
    retry: retryTransient,
  });

export const usePlaylistVideos = (playlistId: string) =>
  useQuery(playlistVideosOptions(playlistId));

/**
 * 보고 있는 탭(currentId)의 영상을 다 받은 뒤 나머지 탭(ids)도 받아 캐시에 둔다 — 탭을 옮기면 기다리지 않고 바로 보인다.
 * 보고 있는 탭을 받는 동안엔 손대지 않는다(지금 보는 영상이 먼저). 그 탭이 실패하면(쿼터 소진 등) 미리 받지 않는다 —
 * 요청만 늘린다. 이미 신선하게 받아 둔 탭·받는 중인 탭은 prefetchQuery 가 다시 부르지 않는다.
 */
export const usePrefetchPlaylistVideos = (
  ids: readonly string[],
  currentId: string | undefined
) => {
  const client = useQueryClient();
  // 보고 있는 탭의 상태만 지켜본다 — 같은 키라 Playlist 의 요청과 합쳐진다(따로 부르지 않는다)
  const current = useQuery({ ...playlistVideosOptions(currentId ?? ''), enabled: !!currentId });
  const ready = !!currentId && current.isSuccess;
  const rest = ids.filter(id => id !== currentId).join('\n'); // 배열 새로 만들기마다 다시 돌지 않게 값으로 비교

  useEffect(() => {
    if (!ready || !rest) return;
    for (const id of rest.split('\n')) void client.prefetchQuery(playlistVideosOptions(id));
  }, [client, ready, rest]);
};
