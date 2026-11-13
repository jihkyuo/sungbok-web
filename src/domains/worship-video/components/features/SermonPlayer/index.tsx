'use client';

import { wantsPlay } from '@/domains/worship-video/api/playIntent';
import type { Sermon } from '@/domains/worship-video/api/worshipVideo.types';
import { useState, type RefObject } from 'react';

interface Props {
  sermon: Sermon;
  /** 플레이어 iframe — 부르는 쪽이 재생 상태를 듣는 데 쓴다(useYoutubePlayState) */
  frameRef: RefObject<HTMLIFrameElement | null>;
}

/**
 * 설교 플레이어 — 처음부터 유튜브 플레이어를 그대로 둔다. 우리 재생 버튼을 따로 두면, 그 버튼을 눌러도 브라우저(특히 아이폰)가
 * 소리 나는 자동재생을 막아 유튜브 재생 버튼을 한 번 더 눌러야 한다 — 유튜브 플레이어를 직접 누르게 해 한 번에 끝낸다.
 * 설교를 눌러 넘어온 경우(playIntent)에는 자동재생을 요청한다: PC 는 대부분 바로 재생되고, 막히면 플레이어에 재생 버튼이 남는다.
 * 휴대폰은 화면 좌우 끝까지(SectionShell 의 좌우 여백 6vw 를 되돌린다).
 */
export const SermonPlayer = ({ sermon, frameRef }: Props) => {
  // 들어올 때 한 번 정한다 — 재생 요청은 설교 페이지가 읽은 뒤 지우고, 다음 설교를 누르면 그쪽으로 옮겨 간다.
  // 그때그때 다시 읽으면 플레이어의 주소(src)가 바뀌어 보던 영상이 처음으로 돌아간다.
  // (설교 페이지는 설교마다 새로 만들어지므로 이 값은 그 설교의 것이다.)
  const [autoplay] = useState(() => wantsPlay(sermon.id));
  return (
    <div className="bg-b1-text relative -mx-[6vw] aspect-video overflow-hidden md:mx-0 md:rounded-2xl">
      <iframe
        ref={frameRef}
        // 쿠키 없는 도메인(홈 영상과 같다). rel=0: 끝난 뒤 추천을 우리 채널 영상으로.
        // enablejsapi=1: 재생 상태를 부모 창에 알려 준다(설교 목록의 «재생 중» 표시)
        src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(sermon.id)}?rel=0&playsinline=1&enablejsapi=1${autoplay ? '&autoplay=1' : ''}`}
        title={`${sermon.title} 설교 영상`}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 size-full border-0"
      />
    </div>
  );
};
