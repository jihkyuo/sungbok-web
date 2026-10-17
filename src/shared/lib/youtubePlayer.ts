// 유튜브 IFrame Player 공통 헬퍼 — 홈 영상 섹션(라이브 스테이지·광고 릴)이 종료(ENDED) 감지에 createPlayer() 를 쓴다.

export type EmbedOptions = {
  autoplay?: boolean;
  /** 기본 true. false 는 사용자 제스처(클릭) 직후에만 허용된다(브라우저 자동재생 정책) */
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
};

/* ───────────── IFrame API (window.YT) ───────────── */

export type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  loadVideoById(id: string): void;
  cueVideoById(id: string): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  destroy(): void;
  getIframe(): HTMLIFrameElement;
};

type YTNamespace = {
  Player: new (
    el: HTMLElement | string,
    cfg: {
      videoId?: string;
      width?: string | number;
      height?: string | number;
      host?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (e: { target: YTPlayer }) => void;
        onStateChange?: (e: { data: number; target: YTPlayer }) => void;
        onError?: (e: { data: number }) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: { ENDED: 0; PLAYING: 1; PAUSED: 2; BUFFERING: 3; CUED: 5; UNSTARTED: -1 };
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;

/** IFrame API 스크립트를 1회 로드하고 window.YT 를 돌려준다. */
export const loadYouTubeIframeApi = (): Promise<YTNamespace> => {
  if (typeof window === 'undefined') return Promise.reject(new Error('ssr'));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT!);
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    document.head.appendChild(s);
  });
  return apiPromise;
};

export type CreatePlayerOptions = EmbedOptions & {
  onReady?: (p: YTPlayer) => void;
  /** 영상이 끝났을 때(ENDED) */
  onEnded?: (p: YTPlayer) => void;
  onStateChange?: (state: number, p: YTPlayer) => void;
};

/**
 * 컨테이너 요소 안에 플레이어 iframe 을 만든다. 반환값은 destroy 함수(effect cleanup 에서 호출).
 * iframe 은 컨테이너를 꽉 채우도록 width/height 100% 로 만들어지므로 컨테이너가 16:9 를 책임진다.
 */
export const createPlayer = (
  container: HTMLElement,
  videoId: string,
  o: CreatePlayerOptions = {},
): (() => void) => {
  let player: YTPlayer | null = null;
  let destroyed = false;
  loadYouTubeIframeApi().then((YT) => {
    if (destroyed) return;
    const el = document.createElement('div');
    container.appendChild(el);
    player = new YT.Player(el, {
      videoId,
      width: '100%',
      height: '100%',
      host: 'https://www.youtube-nocookie.com',
      playerVars: {
        autoplay: o.autoplay ? 1 : 0,
        mute: o.muted === false ? 0 : 1,
        controls: o.controls ? 1 : 0,
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        ...(o.loop ? { loop: 1, playlist: videoId } : {}),
        origin: window.location.origin,
      },
      events: {
        onReady: (e) => {
          o.onReady?.(e.target);
        },
        onStateChange: (e) => {
          o.onStateChange?.(e.data, e.target);
          if (e.data === YT.PlayerState.ENDED) o.onEnded?.(e.target);
        },
      },
    });
  });
  return () => {
    destroyed = true;
    try {
      player?.destroy();
    } catch {
      /* already gone */
    }
    container.replaceChildren();
  };
};
