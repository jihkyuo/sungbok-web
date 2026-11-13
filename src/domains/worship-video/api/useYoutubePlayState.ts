// 유튜브 플레이어(iframe)가 지금 재생 중인지 — 설교 목록의 «재생 중» 표시에 쓴다.
// 플레이어 주소에 enablejsapi=1 이 있으면, 부모 창이 «listening» 을 보낸 뒤부터 플레이어가 상태를 메시지로 알려 준다
// (공식 IFrame API 와 같은 규약 — 홈 턴테이블 영상도 같은 방식). 스크립트(iframe_api)는 받지 않는다.
'use client';

import { useEffect, useState, type RefObject } from 'react';

// 쿠키 없는 도메인으로 임베드한다(SermonPlayer) — 메시지도 그 출처로만 보낸다
const PLAYER_ORIGIN = 'https://www.youtube-nocookie.com';
// 유튜브 재생 상태 값: 1 재생, 3 버퍼링(재생하려는 중). 나머지(-1 시작 전·0 끝·2 일시정지·5 준비)는 재생 중이 아니다
const PLAYING = new Set([1, 3]);
// 플레이어가 준비되기 전의 «listening» 은 버려진다 — 답이 올 때까지 되풀이해 묻고, 끝내 없으면 그만둔다
const ASK_EVERY = 500;
const GIVE_UP_AFTER = 30_000;

/**
 * 재생 중이면 true, 멈춰 있으면 false, 플레이어가 아직 알려 주지 않았으면 undefined
 * (광고 차단기·느린 망 등으로 끝내 모를 수 있다 — 부르는 쪽이 대신할 값을 정한다).
 */
export const useYoutubePlayState = (
  frame: RefObject<HTMLIFrameElement | null>,
  videoId: string
): boolean | undefined => {
  // 어느 영상의 상태인지 함께 둔다 — 영상이 바뀐 직후 앞 영상의 상태가 새 영상 것으로 읽히지 않게
  const [state, setState] = useState<{ videoId: string; playing: boolean }>();

  useEffect(() => {
    let heard = false;
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow || typeof e.data !== 'string') return;
      let message: { event?: unknown; info?: { playerState?: unknown } | null };
      try {
        message = JSON.parse(e.data);
      } catch {
        return; // 유튜브가 아닌 문자열 메시지
      }
      if (message?.event !== 'initialDelivery' && message?.event !== 'infoDelivery') return;
      heard = true;
      const playerState = message.info?.playerState;
      // 시간 갱신 같은 알림에는 재생 상태가 없다 — 그때는 그대로 둔다
      if (typeof playerState === 'number') {
        setState({ videoId, playing: PLAYING.has(playerState) });
      }
    };
    window.addEventListener('message', onMessage);

    const ask = () =>
      frame.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'listening', id: videoId, channel: 'widget' }),
        PLAYER_ORIGIN
      );
    ask();
    const asking = setInterval(() => {
      if (heard) clearInterval(asking);
      else ask();
    }, ASK_EVERY);
    const giveUp = setTimeout(() => clearInterval(asking), GIVE_UP_AFTER);

    return () => {
      window.removeEventListener('message', onMessage);
      clearInterval(asking);
      clearTimeout(giveUp);
    };
  }, [frame, videoId]);

  return state?.videoId === videoId ? state.playing : undefined;
};
