// 예배 페이지의 설교 목록과 처음 보일(최신) 설교의 설명을 서버에서 미리 받아 react-query 상태로 실어 보낸다 —
// 서버 전용(widgets/SermonLibrary 만 import). 첫 화면이 HTML 로 그려져 오고, 고르기·검색·정렬은 실린 목록으로 화면에서 한다.
// 설명 글은 최신 한 편만 싣는다(전부 실으면 수백 KB) — 다른 편은 고를 때 화면이 받는다.
// 유튜브 응답은 1시간 Data Cache 라 쿼터는 방문자 수와 무관하다(재생목록 쪽 수만큼).

import 'server-only'; // 화면(클라이언트) 코드가 가져다 쓰면 빌드가 실패한다 — 키·쿼터는 서버에만

import { prefetchForIsr } from '@/shared/api/prefetchForIsr.server';

import type { WorshipPage } from '../config/worshipPages';
import { fetchSermonDescription, fetchSermonLibrary } from './worshipVideo.server';
import type { Sermon } from './worshipVideo.types';
import { sermonDescriptionQueryKey, sermonLibraryQueryKey } from './worshipVideoQueries';

// 실패 규칙은 prefetchForIsr — 운영 재생성 실패만 던지고, 빌드·개발 서버에서는 화면이 직접 받는다.
export const prefetchSermonLibrary = (page: WorshipPage) =>
  prefetchForIsr(async client => {
    await client.prefetchQuery({
      queryKey: sermonLibraryQueryKey(page),
      queryFn: () => fetchSermonLibrary(page),
    });
    // 목록은 최신순 — 첫 편이 처음 보일 설교다
    const latest = client.getQueryData<Sermon[]>(sermonLibraryQueryKey(page))?.[0];
    if (!latest) return;
    await client.prefetchQuery({
      queryKey: sermonDescriptionQueryKey(page, latest.id),
      queryFn: async () => (await fetchSermonDescription(page, latest.id)) ?? '',
    });
  });
