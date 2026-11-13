'use client';

import { buildSeries } from '@/domains/worship-video/api/sermonList';
import { takeListReturn } from '@/domains/worship-video/api/sermonListState';
import { useSermonLibrary } from '@/domains/worship-video/api/useSermonLibrary';
import type { Sermon } from '@/domains/worship-video/api/worshipVideo.types';
import { SermonLatest } from '@/domains/worship-video/components/features/SermonLatest';
import { SermonList } from '@/domains/worship-video/components/features/SermonList';
import { FOCUS } from '@/domains/worship-video/components/features/sermonStyles';
import { QueryStatus } from '@/domains/worship-video/components/features/StatusText';
import type { WorshipPage } from '@/domains/worship-video/config/worshipPages';
import { cn } from '@/shared/lib/utils';
import { useLenis } from 'lenis/react';
import { useLayoutEffect, useMemo } from 'react';

interface Props {
  page: WorshipPage;
}

const ListView = ({ page, sermons }: Props & { sermons: Sermon[] }) => {
  const series = useMemo(() => buildSeries(sermons), [sermons]);
  const lenis = useLenis(); // 사이트 스크롤은 Lenis 가 맡는다(_provider)

  // 설교 페이지의 «목록» 으로 돌아왔으면 보던 자리로 간다(그 링크는 화면을 맨 위로 올리지 않는다 — SermonInfo).
  // 브라우저 «뒤로» 는 브라우저·Next 가 자리를 되찾아 주고, 메뉴로 새로 들어온 경우는 맨 위에서 시작한다.
  // 그리기 전에 옮긴다(useLayoutEffect) — 설교 페이지의 화면 위치로 한 번 그려졌다가 튀지 않게.
  useLayoutEffect(() => {
    const y = takeListReturn(page);
    if (y === undefined) return;
    if (lenis) {
      // Lenis 는 페이지 크기를 나중에(크기 변화 감지로) 다시 잰다 — 그대로 가면 방금 떠난 설교 페이지(더 짧다)의
      // 스크롤 한도에 잘려 엉뚱한 곳에 선다. 지금 크기로 먼저 다시 재게 한다.
      lenis.resize();
      lenis.scrollTo(y, { immediate: true, force: true });
    } else window.scrollTo({ top: y, behavior: 'instant' });
  }, [page, lenis]);

  return (
    <>
      {/* 목록은 최신순 — 첫 편이 최신 설교 */}
      <SermonLatest page={page} sermon={sermons[0]} />
      <SermonList page={page} sermons={sermons} series={series} />
    </>
  );
};

/**
 * 설교 목록 페이지(/worship/sunday) — 최신 설교 한 편 + 검색·시리즈·정렬이 되는 설교 목록.
 * 서버가 설교 목록을 미리 채워 두면(HydrationBoundary) 첫 화면이 HTML 로 그려져 오고, 못 채웠으면(빌드 중 실패 등) 화면이 받는다.
 * 검색·시리즈·정렬은 받은 목록으로 화면에서 한다 — 유튜브를 다시 부르지 않는다. 설교를 누르면 그 설교 페이지로 넘어간다.
 */
export const SermonListPage = ({ page }: Props) => {
  const q = useSermonLibrary(page);
  if (q.data?.length) return <ListView page={page} sermons={q.data} />;
  return (
    // 상태 문구를 같은 상자 안에서 바꿔 끼운다 — «다시 시도» 뒤 포커스가 이 상자에 남아 문서 맨 위로 튀지 않는다
    <div data-focus-host tabIndex={-1} className={cn('rounded', FOCUS)}>
      <QueryStatus query={q} empty="아직 등록된 설교 영상이 없습니다." />
    </div>
  );
};
