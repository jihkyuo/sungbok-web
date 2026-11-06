import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createPlayer, type YTPlayer } from './youtubePlayer';

type PlayerCfg = {
  videoId?: string;
  host?: string;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (e: { target: YTPlayer }) => void;
    onStateChange?: (e: { data: number; target: YTPlayer }) => void;
  };
};

// window.YT 를 미리 심어 loadYouTubeIframeApi 가 즉시 resolve 경로를 타게 한다.
const created: { el: HTMLElement; cfg: PlayerCfg; player: YTPlayer }[] = [];
const destroy = vi.fn();
class FakePlayer {
  constructor(el: HTMLElement, cfg: PlayerCfg) {
    created.push({ el, cfg, player: this as unknown as YTPlayer });
  }
  destroy = destroy;
}
const PlayerState = { ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5, UNSTARTED: -1 };

const flush = () => new Promise<void>((r) => setTimeout(r, 0));

beforeEach(() => {
  created.length = 0;
  destroy.mockClear();
  window.YT = { Player: FakePlayer, PlayerState } as unknown as Window['YT'];
});
afterEach(() => {
  delete window.YT;
});

describe('createPlayer', () => {
  it('컨테이너 안에 플레이어를 만든다 — 무음 자동재생 · nocookie 호스트', async () => {
    const container = document.createElement('div');
    createPlayer(container, 'abc', { autoplay: true });
    await flush();
    expect(created).toHaveLength(1);
    expect(container.childElementCount).toBe(1);
    expect(container.contains(created[0].el)).toBe(true);
    expect(created[0].cfg.videoId).toBe('abc');
    expect(created[0].cfg.host).toBe('https://www.youtube-nocookie.com');
    expect(created[0].cfg.playerVars?.autoplay).toBe(1);
    expect(created[0].cfg.playerVars?.mute).toBe(1);
  });

  it('ENDED 상태 전이에 onEnded, onReady 에 플레이어를 넘긴다', async () => {
    const onEnded = vi.fn();
    const onReady = vi.fn();
    createPlayer(document.createElement('div'), 'abc', { onEnded, onReady });
    await flush();
    const { cfg, player } = created[0];
    cfg.events?.onReady?.({ target: player });
    expect(onReady).toHaveBeenCalledWith(player);
    cfg.events?.onStateChange?.({ data: 1, target: player });
    expect(onEnded).not.toHaveBeenCalled();
    cfg.events?.onStateChange?.({ data: 0, target: player });
    expect(onEnded).toHaveBeenCalledWith(player);
  });

  it('destroy 는 플레이어를 지우고 컨테이너를 비운다; API 준비 전 destroy 면 플레이어를 만들지 않는다', async () => {
    const container = document.createElement('div');
    const dispose = createPlayer(container, 'abc');
    await flush();
    dispose();
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(container.childElementCount).toBe(0);

    const early = createPlayer(document.createElement('div'), 'xyz');
    early();
    await flush();
    expect(created).toHaveLength(1);
  });
});
