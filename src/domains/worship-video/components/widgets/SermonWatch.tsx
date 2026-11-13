import { prefetchSermonWatch } from '@/domains/worship-video/api/worshipVideoPrefetch.server';
import { SermonWatchPage } from '@/domains/worship-video/components/features/SermonWatchPage';
import type { WorshipPage } from '@/domains/worship-video/config/worshipPages';
import { HydrationBoundary } from '@tanstack/react-query';
import { notFound } from 'next/navigation';

// 설교 한 편 페이지 — 설교 목록(옆 목록·이전/다음)과 이 설교의 설명 글을 서버에서 미리 받아 실어 보낸다.
// 목록에 없는 영상(지워졌거나 잘못된 주소)이면 404. 목록을 못 받았으면(빌드 중 실패·개발 서버) 없다고 단정하지 않고
// 화면이 직접 받게 한다 — 실패 규칙은 prefetchSermonWatch 참고.
export default async function SermonWatch({
  page,
  videoId,
}: {
  page: WorshipPage;
  videoId: string;
}) {
  const { state, found } = await prefetchSermonWatch(page, videoId);
  if (found === false) notFound();
  return (
    <HydrationBoundary state={state}>
      <SermonWatchPage page={page} videoId={videoId} />
    </HydrationBoundary>
  );
}
