// 주일예배 재생목록과 첫 탭 영상을 서버에서 미리 받아 react-query 상태로 실어 보낸다 — 서버 전용(PlaylistPagination 만 import).
// 첫 화면부터 영상이 차 있고, 다른 탭은 열 때 화면이 `/api/worship-video` 로 받는다.
// 쪽 나누기는 화면이 하므로 첫 재생목록 영상 전체가 페이지에 실린다(항목당 id·제목·썸네일 주소만, 수백 개면 수십 KB).

import 'server-only'; // 화면(클라이언트) 코드가 가져다 쓰면 빌드가 실패한다 — 키·쿼터는 서버에만

import { prefetchForIsr } from '@/shared/api/prefetchForIsr.server';

import { fetchPlaylists, fetchPlaylistVideos } from './worshipVideo.server';
import type { PlaylistSummary } from './worshipVideo.types';
import { PLAYLISTS_QUERY_KEY, playlistVideosQueryKey } from './worshipVideoQueries';

// 실패 규칙은 prefetchForIsr — 운영 재생성 실패만 던지고, 빌드·개발 서버에서는 화면이 직접 받는다.
export const prefetchWorshipVideos = () =>
  prefetchForIsr(async client => {
    await client.prefetchQuery({ queryKey: PLAYLISTS_QUERY_KEY, queryFn: () => fetchPlaylists() });
    const first = client.getQueryData<PlaylistSummary[]>(PLAYLISTS_QUERY_KEY)?.[0];
    if (!first) return;
    await client.prefetchQuery({
      queryKey: playlistVideosQueryKey(first.id),
      queryFn: () => fetchPlaylistVideos(first.id),
    });
  });
