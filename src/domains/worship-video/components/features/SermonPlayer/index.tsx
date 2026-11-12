'use client';

import { FOCUS, YT_THUMB } from '@/domains/worship-video/components/features/sermonStyles';
import type { Sermon } from '@/domains/worship-video/api/worshipVideo.types';
import { cn } from '@/shared/lib/utils';
import { Play } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

interface Props {
  sermon: Sermon;
  /** true 면 포스터 대신 유튜브 플레이어 — 포스터를 눌렀거나 목록에서 고른 영상 */
  playing: boolean;
  /** 포스터의 재생 버튼을 눌렀을 때 */
  onPlay: () => void;
}

/**
 * 페이지 안 플레이어. 처음엔 포스터(이미지 한 장)만 그리고, 재생하면 그 자리에 유튜브 플레이어를 붙인다 —
 * 첫 화면에서 유튜브 스크립트·쿠키를 받지 않는다. 재생 여부는 부르는 쪽(SermonPage)이 쥔다 — 지금 떠 있는
 * 영상을 목록에서 다시 골라도 재생이 시작되고, 이미 재생 중이면 끊기지 않는다.
 * 휴대폰은 화면 좌우 끝까지(SectionShell 의 좌우 여백 6vw 를 되돌린다).
 */
export const SermonPlayer = ({ sermon, playing, onPlay }: Props) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  // 포스터의 재생 버튼을 눌러 시작했으면 포커스를 플레이어로 옮긴다 — 누른 버튼이 사라져 포커스가 문서 맨 위로
  // 튀지 않게. 목록에서 고른 경우(누른 버튼이 남아 있다)는 옮기지 않는다.
  const focusFrame = useRef(false);
  useEffect(() => {
    if (!playing || !focusFrame.current) return;
    focusFrame.current = false;
    frameRef.current?.focus();
  }, [playing]);

  return (
    <div className="bg-b1-text relative -mx-[6vw] aspect-video overflow-hidden md:mx-0 md:rounded-2xl">
      {playing ? (
        <iframe
          ref={frameRef}
          key={sermon.id} // 다른 영상이면 플레이어를 새로 붙인다
          // 쿠키 없는 도메인(홈 영상과 같다). rel=0: 끝난 뒤 추천을 우리 채널 영상으로
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(sermon.id)}?autoplay=1&rel=0&playsinline=1`}
          title={`${sermon.title} 설교 영상`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <>
          <Image
            src={sermon.poster}
            alt=""
            fill
            preload
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
            unoptimized={!YT_THUMB.test(sermon.poster)}
          />
          <button
            type="button"
            onClick={() => {
              focusFrame.current = true;
              onPlay();
            }}
            aria-label={`${sermon.title} 재생`}
            // 링은 안쪽으로 — 휴대폰에서 플레이어가 화면 끝까지 차 바깥 링이 잘린다
            className={cn('group absolute inset-0 grid place-items-center', FOCUS, 'ring-inset')}
          >
            <span
              className="bg-b1-surface duration-base ease-standard grid size-16 place-items-center rounded-full shadow-[0_10px_24px_-8px_rgba(15,23,42,0.5)] transition-transform group-hover:scale-105 motion-reduce:transition-none" /* design-lint-ignore: 재생 버튼 1회성 그림자(영상 위에서 떠 보이게) */
            >
              <Play aria-hidden className="text-b1-accent ml-1 size-6 fill-current" />
            </span>
          </button>
        </>
      )}
    </div>
  );
};
