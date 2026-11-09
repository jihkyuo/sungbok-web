'use client';

import type { PlaylistVideo } from '@/domains/worship-video/api/worshipVideo.types';
import { pageSlice, pageStart } from '@/shared/components/features/Pagination/clampPage';
import { PaginationList } from '@/shared/components/features/Pagination/PaginationList';
import { usePageState } from '@/shared/components/features/Pagination/usePageState';
import { usePrefersReducedMotion } from '@/shared/lib/hooks/usePrefersReducedMotion';
import Image from 'next/image';
import { useLenis } from 'lenis/react';
import { useEffect, useRef } from 'react';

// TODO
// (영상 목록은 /api/worship-video 에서 한 번에 받아 화면에서 쪽을 나눈다 — 쪽별 유튜브 호출로 되돌리지 말 것. ADR 0010)
// 그리드 레이아웃 깔끔하게 개선
// api 응답으로 영상 재생 방법 알아내기
// 그리드 제목 표시 방법 강구(디자인)

const PAGE_SIZE = 10;
const YT_THUMB = /^https:\/\/i\.ytimg\.com\/vi\//;

interface Props {
  videos: PlaylistVideo[];
}

/** 받은 영상 목록(1개 이상)을 쪽으로 나눠 보인다(쪽 넘김·스크롤·포커스). 불러오기·실패·빈 목록은 Playlist 가 맡는다. */
export const PlaylistGrid = ({ videos }: Props) => {
  // 쪽 번호는 여기서 한 번만 쥔다(usePageState) — 목록 자르기·쪽 번호 표시가 같은 값·같은 PAGE_SIZE 를 쓴다.
  const [page, setPage] = usePageState(videos.length, PAGE_SIZE);
  const topRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const lenis = useLenis(); // 사이트 스크롤은 Lenis 가 맡는다(_provider) — 같은 경로로 움직여 서로 끊기지 않게
  // 예약한 스크롤·포커스 — 그 프레임 전에 탭을 바꾸면(언마운트) 취소한다.
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // 쪽을 넘겼는데 목록 처음이 화면 위로 지나갔거나 고정 헤더 밑에 가려져 있으면 처음으로 올려 준다(동작 줄이기면 즉시).
  // 헤더 여백은 전역 scroll-padding-top(globals.css, 80px)을 읽어 쓴다 — 홈 앵커와 같은 기준.
  // 재는 건 다음 프레임 — 새 쪽이 그려진 뒤의 문서 높이로 계산해야 마지막 쪽(짧은 목록)에서 착지가 어긋나지 않는다.
  const goTo = (to: number) => {
    setPage(to);
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const top = topRef.current;
      if (!top) return;
      const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      if (top.getBoundingClientRect().top >= offset) return;
      // 사이트 스크롤은 Lenis(_provider 의 ReactLenis root)가 맡는다. 그 밖(다른 레이아웃)에서는 브라우저 기본 스크롤.
      if (lenis) {
        lenis.resize(); // 줄어든 문서 높이를 반영
        // Lenis 는 요소로 스크롤할 때 scroll-padding-top 을 스스로 뺀다 — offset 을 또 주면 두 번 빠진다.
        lenis.scrollTo(top, { immediate: reduced });
      } else {
        // 'instant' — 'auto' 는 CSS scroll-behavior 를 따르므로 동작 줄이기에서도 부드럽게 갈 수 있다
        top.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
      }
      // 화면을 목록 처음으로 올렸으니 키보드 포커스도 옮긴다 — 아래 페이지 줄에 남으면 다음 Tab 에 다시 끌려 내려간다.
      top.focus({ preventScroll: true });
    });
  };

  return (
    <div className="py-10">
      {/* 쪽을 넘길 때 스크롤·포커스가 내려앉는 자리. 글자는 화면에선 안 보이고(높이 0) 화면낭독기는 읽는다. */}
      <div
        ref={topRef}
        tabIndex={-1}
        data-testid="playlist-top"
        // 비대화형 착지점(tabIndex=-1)이라 포커스 표시가 필요 없다 — outline-none(고대비 모드에서도 선이 그려지지 않게)
        className="h-0 overflow-hidden outline-none"
      >
        영상 목록
      </div>
      <PaginationList
        items={pageSlice(videos, page, PAGE_SIZE).map((item, idx) => ({
          // 같은 영상이 재생목록에 두 번 들어갈 수 있어 videoId 만으로는 키가 겹친다 — 목록 내 위치를 붙인다.
          key: `${pageStart(page, PAGE_SIZE) + idx}-${item.id}`,
          // 유튜브 high 썸네일은 4:3(16:9 영상 위아래에 검은 띠) — 16:9 틀에 꽉 채워 띠를 잘라 낸다.
          thumbnail: (
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                className="object-cover"
                src={item.thumbnail}
                // 바로 아래 제목과 같은 내용이라 비운다(두 번 읽히지 않게)
                alt=""
                // 허용 목록(next.config remotePatterns: i.ytimg.com/vi/) 밖 주소는 최적화 없이 그대로 —
                // 다른 호스트·경로 한 장 때문에 탭 전체가 오류로 떨어지지 않게
                unoptimized={!YT_THUMB.test(item.thumbnail)}
                fill
                // PaginationGrid 는 칸 최소 250px auto-fill — 넓은 화면은 칸 하나가 약 300px, 좁으면 한두 칸
                sizes="(min-width: 1024px) 320px, (min-width: 560px) 50vw, 100vw"
              />
            </div>
          ),
          title: <div className="line-clamp-1 text-sm font-medium">{item.title}</div>,
        }))}
        pagination={{
          total: videos.length,
          currentPage: page,
          pageSize: PAGE_SIZE,
          onChange: goTo,
        }}
      />
    </div>
  );
};
