// 주일예배 재생목록과 모든 탭 영상을 서버에서 미리 받아 react-query 상태로 실어 보낸다 — 서버 전용(PlaylistPagination 만 import).
// 첫 탭은 HTML 로 그려져 오고, 다른 탭은 데이터가 이미 실려 있어 눌러도 요청 없이 바로 그린다.
// 쪽 나누기는 화면이 하므로 재생목록 영상 전체가 페이지에 실린다(항목당 id·제목·썸네일 주소만 — 2026-11 기준 5개 탭 합쳐 약 20KB).
// 유튜브 응답은 1시간 Data Cache 라 탭을 다 받아도 쿼터는 방문자 수와 무관하다(재생목록당 시간당 쪽 수만큼).

import 'server-only'; // 화면(클라이언트) 코드가 가져다 쓰면 빌드가 실패한다 — 키·쿼터는 서버에만

import { prefetchForIsr } from '@/shared/api/prefetchForIsr.server';

import { fetchPlaylists, fetchPlaylistVideos } from './worshipVideo.server';
import type { PlaylistSummary } from './worshipVideo.types';
import { PLAYLISTS_QUERY_KEY, playlistVideosQueryKey } from './worshipVideoQueries';

// 실패 규칙은 prefetchForIsr — 운영 재생성 실패만 던지고, 빌드·개발 서버에서는 화면이 직접 받는다.
export const prefetchWorshipVideos = () =>
  prefetchForIsr(async client => {
    await client.prefetchQuery({ queryKey: PLAYLISTS_QUERY_KEY, queryFn: () => fetchPlaylists() });
    const playlists = client.getQueryData<PlaylistSummary[]>(PLAYLISTS_QUERY_KEY) ?? [];
    // 동시에 — 탭 수만큼 페이지 만들기가 늘어지지 않게
    await Promise.all(
      playlists.map(({ id }) =>
        client.prefetchQuery({
          queryKey: playlistVideosQueryKey(id),
          queryFn: () => fetchPlaylistVideos(id),
        })
      )
    );
  });
