'use client';

import { clearPlay, wantsPlay } from '@/domains/worship-video/api/playIntent';
import { buildSeries, neighbors } from '@/domains/worship-video/api/sermonList';
import { useSermonLibrary } from '@/domains/worship-video/api/useSermonLibrary';
import { useYoutubePlayState } from '@/domains/worship-video/api/useYoutubePlayState';
import type { Sermon } from '@/domains/worship-video/api/worshipVideo.types';
import { SermonInfo } from '@/domains/worship-video/components/features/SermonInfo';
import { SermonPlayer } from '@/domains/worship-video/components/features/SermonPlayer';
import { SermonSidebar } from '@/domains/worship-video/components/features/SermonSidebar';
import { FOCUS, OUTLINE_BTN } from '@/domains/worship-video/components/features/sermonStyles';
import { QueryStatus, STATUS_CLASS } from '@/domains/worship-video/components/features/StatusText';
import { sermonPath, type WorshipPage } from '@/domains/worship-video/config/worshipPages';
import { cn } from '@/shared/lib/utils';
import { useLenis } from 'lenis/react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Props {
  page: WorshipPage;
  videoId: string;
}

const WatchView = ({
  page,
  sermons,
  current,
}: Pick<Props, 'page'> & { sermons: Sermon[]; current: Sermon }) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const lenis = useLenis(); // 사이트 스크롤은 Lenis 가 맡는다(_provider) — 같은 경로로 움직여 서로 끊기지 않게

  // 눌러서 넘어온 설교인지 — 들어올 때 한 번 정한다. 이 화면은 설교마다 새로 만들어진다(Next 가 주소의 영상 id 로
  // 화면을 가른다) — 그래서 요청은 여기서 읽고 지운다: 지우지 않으면 뒤로·앞으로 가기로 다시 들어왔을 때도
  // 누르지 않았는데 재생되고, 브라우저가 되찾아 준 화면 위치도 아래 맞추기가 덮어 버린다.
  const [arrivedToPlay] = useState(() => wantsPlay(current.id));
  useEffect(() => {
    clearPlay(current.id);
  }, [current.id]);
  // 재생 중인지는 플레이어가 알려 준다. 끝내 알려 주지 않으면(광고 차단기 등) 눌러서 넘어온 설교를 재생 중으로 본다
  const playing = useYoutubePlayState(frameRef, current.id) ?? arrivedToPlay;

  // 칩으로 둘러보는 시리즈 — 고르지 않았으면 보고 있는 설교의 시리즈. 다른 설교로 넘어가면 화면이 새로 만들어져 잊힌다
  const [browsing, setBrowsing] = useState<string>();
  const seriesName = browsing ?? current.series;
  const series = useMemo(() => buildSeries(sermons), [sermons]);
  const { older, newer } = neighbors(sermons, current.id);

  // 눌러서 넘어왔으면 플레이어부터 «이전 · 목록 · 다음» 까지 한 화면에 들어오게 맞춘다 — 서브페이지 머리(제목·메뉴)가 커서
  // 노트북 화면에서는 플레이어 아래가 잘린다. 주소로 바로 들어온 경우는 맨 위 그대로 둔다.
  useEffect(() => {
    if (!arrivedToPlay) return;
    // 재는 건 다음 프레임 — 페이지가 바뀐 뒤의 스크롤 위치(Next 가 맞춘다)가 자리 잡은 뒤에
    const frame = requestAnimationFrame(() => {
      const player = playerRef.current;
      const nav = navRef.current;
      if (!player || !nav) return;
      // 고정 헤더 여백은 전역 scroll-padding-top(globals.css)을 읽어 쓴다 — 홈 앵커와 같은 기준
      const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const top = player.getBoundingClientRect().top;
      if (top >= offset && nav.getBoundingClientRect().bottom <= window.innerHeight) return;
      const y = Math.max(0, top + window.scrollY - offset);
      // 새 페이지에 들어온 것이라 미끄러지지 않고 바로 간다. Lenis 는 페이지 크기를 나중에 다시 재므로
      // (앞 페이지의 스크롤 한도에 잘리지 않게) 지금 크기로 먼저 재게 한다.
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(y, { immediate: true });
      } else window.scrollTo({ top: y, behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [current.id, arrivedToPlay, lenis]);

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-7">
      <div className="min-w-0">
        <div ref={playerRef}>
          <SermonPlayer sermon={current} frameRef={frameRef} />
        </div>
        <SermonInfo page={page} sermon={current} older={older} newer={newer} navRef={navRef} />
      </div>
      <SermonSidebar
        page={page}
        sermons={sermons}
        series={series}
        current={current}
        mark={playing ? '재생 중' : '현재 영상'}
        seriesName={seriesName}
        onSeries={setBrowsing}
      />
    </div>
  );
};

/**
 * 설교 한 편 페이지(/worship/sunday/영상id) — 유튜브 플레이어 + 제목·이동·설명란 + 설교 목록(시리즈 칩과 회차).
 * 서버가 설교 목록과 이 설교의 설명을 미리 채워 두면(HydrationBoundary) 첫 화면이 HTML 로 그려져 오고,
 * 못 채웠으면(빌드 중 실패 등) 화면이 받는다. 목록에 없는 영상은 서버가 404 를 낸다 — 여기까지 온 경우(목록을 화면이 받았을 때)에는
 * 찾을 수 없다고 알리고 목록으로 보낸다.
 */
export const SermonWatchPage = ({ page, videoId }: Props) => {
  const q = useSermonLibrary(page);
  const current = q.data?.find(s => s.id === videoId);
  if (q.data && current) return <WatchView page={page} sermons={q.data} current={current} />;
  if (q.data?.length) {
    return (
      <div className={cn(STATUS_CLASS, 'flex flex-wrap items-center gap-x-4 gap-y-3')}>
        <p role="status">이 설교 영상을 찾을 수 없습니다.</p>
        <Link
          href={sermonPath(page)}
          className={cn(OUTLINE_BTN, FOCUS, 'text-label min-h-11 px-4')}
        >
          설교 목록
        </Link>
      </div>
    );
  }
  return (
    // 상태 문구를 같은 상자 안에서 바꿔 끼운다 — «다시 시도» 뒤 포커스가 이 상자에 남아 문서 맨 위로 튀지 않는다
    <div data-focus-host tabIndex={-1} className={cn('rounded', FOCUS)}>
      <QueryStatus query={q} empty="아직 등록된 설교 영상이 없습니다." />
    </div>
  );
};
