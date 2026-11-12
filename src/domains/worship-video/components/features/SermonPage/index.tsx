'use client';

import { buildSeries, neighbors } from '@/domains/worship-video/api/sermonList';
import { useSermonLibrary } from '@/domains/worship-video/api/useSermonLibrary';
import { useVideoParam, useVideoParamRouterSync } from '@/domains/worship-video/api/useVideoParam';
import type { Sermon } from '@/domains/worship-video/api/worshipVideo.types';
import { SermonInfo } from '@/domains/worship-video/components/features/SermonInfo';
import { SermonPlayer } from '@/domains/worship-video/components/features/SermonPlayer';
import { SermonSearchList } from '@/domains/worship-video/components/features/SermonSearchList';
import { SermonSidebar } from '@/domains/worship-video/components/features/SermonSidebar';
import { FOCUS } from '@/domains/worship-video/components/features/sermonStyles';
import { QueryStatus } from '@/domains/worship-video/components/features/StatusText';
import type { WorshipPage } from '@/domains/worship-video/config/worshipPages';
import { usePrefersReducedMotion } from '@/shared/lib/hooks/usePrefersReducedMotion';
import { cn } from '@/shared/lib/utils';
import { useLenis } from 'lenis/react';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';

interface Props {
  page: WorshipPage;
}

// 라우터가 바꾼 주소를 따라가게 하는 빈 부품 — Suspense 안에 둔다(useVideoParamRouterSync 참고)
const VideoParamRouterSync = () => {
  useVideoParamRouterSync();
  return null;
};

const SermonView = ({ page, sermons }: Props & { sermons: Sermon[] }) => {
  // 고른 영상은 주소(?v=)에 둔다. 주소에 없거나 목록에 없는 id(삭제·오타)면 최신 설교
  const [videoId, pickVideo] = useVideoParam();
  // 재생을 시작한 영상 — 포스터를 눌렀거나 목록에서 고른 것. 처음 들어왔을 땐(공유 주소 포함) 없다(포스터부터).
  const [playingId, setPlayingId] = useState<string>();
  const current = sermons.find(s => s.id === videoId) ?? sermons[0];
  const playing = playingId === current.id;
  // 포스터로 재생을 시작하면 그 영상을 주소에 남긴다(방문 기록은 쌓지 않는다) — 주소에 v 가 없으면 «최신 설교» 라,
  // 보는 동안 새 설교가 올라와 목록 맨 앞이 바뀌면(다시 받기) 보던 영상이 새 영상의 포스터로 바뀐다.
  const play = () => {
    setPlayingId(current.id);
    pickVideo(current.id, 'replace');
  };
  // 칩으로 둘러보는 시리즈 — 영상을 고르면 비워 재생 중인 설교의 시리즈를 따라간다
  const [browsing, setBrowsing] = useState<string>();
  const series = useMemo(() => buildSeries(sermons), [sermons]);
  const { older, newer } = neighbors(sermons, current.id);

  const playerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const reduced = usePrefersReducedMotion();
  const lenis = useLenis(); // 사이트 스크롤은 Lenis 가 맡는다(_provider) — 같은 경로로 움직여 서로 끊기지 않게
  // 예약한 스크롤·포커스 — 그 프레임 전에 페이지를 떠나면(언마운트) 취소한다
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // focusTitle: 아래 찾기 목록에서 골랐을 때만 — 화면을 플레이어로 올린 뒤 키보드 포커스도 제목으로 옮긴다
  // (목록에 남으면 다음 Tab 에 다시 끌려 내려간다). 이전/다음 편·옆 회차 목록은 누른 버튼에 그대로 둔다(이어서 넘길 수 있게).
  const pick = (id: string, focusTitle = false) => {
    setPlayingId(id); // 지금 떠 있는 영상을 다시 골라도 재생이 시작된다
    setBrowsing(undefined);
    pickVideo(id);
    // 플레이어가 화면에 다 보이지 않으면(아래 목록에서 골랐을 때) 플레이어로 올린다. 다 보이면 그대로 둔다.
    // 재는 건 다음 프레임 — 새 영상으로 그려진 뒤에.
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const player = playerRef.current;
      if (!player) return;
      // 고정 헤더 여백은 전역 scroll-padding-top(globals.css)을 읽어 쓴다 — 홈 앵커와 같은 기준
      const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const rect = player.getBoundingClientRect();
      if (rect.top >= offset && rect.bottom <= window.innerHeight) return;
      // 목표 위치는 직접 계산한다 — lenis.scrollTo(요소)는 Lenis 가 기억하는 스크롤 값으로 계산하는데, 방금 영상이
      // 바뀌며 위쪽 높이가 달라져 브라우저가 스크롤을 보정한 직후에는 그 값이 실제와 달라 엉뚱한 곳에 선다.
      const top = Math.max(0, rect.top + window.scrollY - offset);
      if (lenis) lenis.scrollTo(top, { immediate: reduced });
      // 'instant' — 'auto' 는 CSS scroll-behavior 를 따르므로 동작 줄이기에서도 부드럽게 갈 수 있다
      else window.scrollTo({ top, behavior: reduced ? 'instant' : 'smooth' });
      if (focusTitle) titleRef.current?.focus({ preventScroll: true });
    });
  };

  return (
    <>
      <Suspense fallback={null}>
        <VideoParamRouterSync />
      </Suspense>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-7">
        <div className="min-w-0">
          <div ref={playerRef}>
            <SermonPlayer sermon={current} playing={playing} onPlay={play} />
          </div>
          <SermonInfo
            page={page}
            sermon={current}
            older={older}
            newer={newer}
            onPick={pick}
            titleRef={titleRef}
          />
        </div>
        <SermonSidebar
          sermons={sermons}
          series={series}
          current={current}
          playing={playing}
          seriesName={browsing ?? current.series}
          onSeries={setBrowsing}
          onPick={pick}
        />
      </div>
      <SermonSearchList
        sermons={sermons}
        series={series}
        currentId={current.id}
        playing={playing}
        onPick={id => pick(id, true)}
      />
    </>
  );
};

/**
 * 예배 설교 영상 화면(G안) — 페이지 안 플레이어 + 설명란 + 설교 목록(시리즈) + 찾기 목록.
 * 서버가 설교 목록을 미리 채워 두면(HydrationBoundary) 첫 화면이 HTML 로 그려져 오고, 못 채웠으면(빌드 중 실패 등) 화면이 받는다.
 * 고르기·검색·정렬은 받은 목록으로 화면에서 한다 — 유튜브를 다시 부르지 않는다.
 */
export const SermonPage = ({ page }: Props) => {
  const q = useSermonLibrary(page);
  if (q.data?.length) return <SermonView page={page} sermons={q.data} />;
  return (
    // 상태 문구를 같은 상자 안에서 바꿔 끼운다 — «다시 시도» 뒤 포커스가 이 상자에 남아 문서 맨 위로 튀지 않는다
    <div data-focus-host tabIndex={-1} className={cn('rounded', FOCUS)}>
      <QueryStatus query={q} empty="아직 등록된 설교 영상이 없습니다." />
    </div>
  );
};
