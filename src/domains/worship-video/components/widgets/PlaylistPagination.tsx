import { prefetchWorshipVideos } from '@/domains/worship-video/api/worshipVideoPrefetch.server';
import { PlaylistTabs } from '@/domains/worship-video/components/features/PlaylistTabs';
import { HydrationBoundary } from '@tanstack/react-query';

// 재생목록과 모든 탭 영상을 서버에서 미리 받아 실어 보낸다(첫 탭은 HTML 로 그려 온다). 실패 처리는 prefetchWorshipVideos 참고 —
// 운영 중 재생성 실패는 던져 직전 페이지를 유지하고, 빌드(쿼터가 바닥난 날 포함)·개발 서버에서는 화면이 직접 받는다.
export default async function PlaylistPagination() {
  return (
    <HydrationBoundary state={await prefetchWorshipVideos()}>
      <PlaylistTabs />
    </HydrationBoundary>
  );
}
