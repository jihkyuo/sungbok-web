import { prefetchSermonLibrary } from '@/domains/worship-video/api/worshipVideoPrefetch.server';
import { SermonListPage } from '@/domains/worship-video/components/features/SermonListPage';
import type { WorshipPage } from '@/domains/worship-video/config/worshipPages';
import { HydrationBoundary } from '@tanstack/react-query';

// 설교 목록 페이지 — 설교 목록을 서버에서 미리 받아 실어 보낸다(첫 화면이 HTML 로 그려져 온다).
// 실패 처리는 prefetchSermonLibrary 참고 — 운영 중 재생성 실패는 던져 직전 페이지를 유지하고,
// 빌드(쿼터가 바닥난 날 포함)·개발 서버에서는 화면이 직접 받는다.
export default async function SermonLibrary({ page }: { page: WorshipPage }) {
  return (
    <HydrationBoundary state={await prefetchSermonLibrary(page)}>
      <SermonListPage page={page} />
    </HydrationBoundary>
  );
}
