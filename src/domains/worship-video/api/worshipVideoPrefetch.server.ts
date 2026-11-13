// 예배 페이지가 처음 그릴 데이터를 서버에서 미리 받아 react-query 상태로 실어 보낸다 — 서버 전용(widgets 만 import).
// 첫 화면이 HTML 로 그려져 오고, 고르기·검색·정렬은 실린 목록으로 화면에서 한다.
//  · 목록 페이지(/worship/sunday): 설교 목록
//  · 설교 한 편(/worship/sunday/영상id): 설교 목록(옆 목록·이전/다음에 쓴다) + 그 설교의 설명 글
// 설명 글은 그 한 편만 싣는다(전부 실으면 수백 KB). 유튜브 응답은 1시간 Data Cache 라 쿼터는 방문자 수·페이지 수와
// 무관하다(재생목록 쪽 수만큼).

import 'server-only'; // 화면(클라이언트) 코드가 가져다 쓰면 빌드가 실패한다 — 키·쿼터는 서버에만

import { dehydrate, QueryClient, type DehydratedState } from '@tanstack/react-query';

import { prefetchForIsr } from '@/shared/api/prefetchForIsr.server';

import type { WorshipPage } from '../config/worshipPages';
import { fetchSermonDescription, fetchSermonLibrary } from './worshipVideo.server';
import type { Sermon } from './worshipVideo.types';
import { sermonDescriptionQueryKey, sermonLibraryQueryKey } from './worshipVideoQueries';

/** 목록 페이지 — 설교 목록. 실패 규칙은 prefetchForIsr: 운영 재생성 실패만 던지고(직전 페이지 유지), 빌드·개발 서버에서는 화면이 직접 받는다. */
export const prefetchSermonLibrary = (page: WorshipPage) =>
  prefetchForIsr(client =>
    client.prefetchQuery({
      queryKey: sermonLibraryQueryKey(page),
      queryFn: () => fetchSermonLibrary(page),
    })
  );

/**
 * 설교 한 편 페이지 — 설교 목록과 그 설교의 설명 글.
 * found: 목록에 그 영상이 있으면 true, 목록은 받았는데 없으면 false(페이지가 404 를 낸다),
 * 목록을 못 받았으면 undefined(없다고 단정하지 않는다 — 화면이 이어서 받는다).
 *
 * 목록 페이지와 달리 **실패해도 던지지 않는다**. 설교 페이지는 빌드 때 만들지 않고 처음 열릴 때 만든다 —
 * «던지면 Next 가 직전 성공본을 계속 보여 준다» 는 직전 성공본이 있을 때만 성립하고, 처음 열리는 설교는 그게 없어
 * 오류 화면이 된다. 못 받은 것은 싣지 않고 화면이 /api 로 받게 한다(Route Handler 는 지난 캐시로도 답한다).
 */
export const prefetchSermonWatch = async (
  page: WorshipPage,
  videoId: string
): Promise<{ state: DehydratedState; found: boolean | undefined }> => {
  // prefetchQuery 는 실패를 삼키고 쿼리 상태에 남긴다 — dehydrate 는 성공한 쿼리만 싣는다
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await client.prefetchQuery({
    queryKey: sermonLibraryQueryKey(page),
    queryFn: () => fetchSermonLibrary(page),
  });
  const sermons = client.getQueryData<Sermon[]>(sermonLibraryQueryKey(page));
  const found = sermons?.some(s => s.id === videoId);
  if (found) {
    await client.prefetchQuery({
      queryKey: sermonDescriptionQueryKey(page, videoId),
      queryFn: async () => (await fetchSermonDescription(page, videoId)) ?? '',
    });
  }
  return { state: dehydrate(client), found };
};
