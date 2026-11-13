import { act, render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useYoutubePlayState } from './useYoutubePlayState';

// 훅이 돌려준 값을 화면에 적어 두고 읽는다(모름 = 'unknown')
const Probe = ({ id }: { id: string }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const playing = useYoutubePlayState(ref, id);
  return <iframe ref={ref} title="t" data-playing={playing ?? 'unknown'} />;
};
const frameWindow = () => document.querySelector('iframe')!.contentWindow!;
// 유튜브 플레이어가 부모 창에 보내는 메시지(문자열 JSON)
const say = (data: unknown, source: MessageEventSource | null = frameWindow()) =>
  act(() => {
    window.dispatchEvent(
      new MessageEvent('message', {
        data: typeof data === 'string' ? data : JSON.stringify(data),
        source,
      })
    );
  });
const last = () => {
  const v = document.querySelector('iframe')!.dataset.playing;
  return v === 'unknown' ? undefined : v === 'true';
};

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useYoutubePlayState', () => {
  it('플레이어가 알려 주기 전에는 모른다(undefined) — 알려 달라고 되풀이해 묻는다', () => {
    render(<Probe id="a" />);
    const post = vi.spyOn(frameWindow(), 'postMessage').mockImplementation(() => {});
    expect(last()).toBeUndefined();

    act(() => vi.advanceTimersByTime(1000));
    expect(post).toHaveBeenCalledWith(
      JSON.stringify({ event: 'listening', id: 'a', channel: 'widget' }),
      'https://www.youtube-nocookie.com'
    );
    expect(post.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('재생(1)·버퍼링(3)이면 재생 중, 일시정지·끝남·시작 전이면 아니다', () => {
    render(<Probe id="a" />);
    say({ event: 'initialDelivery', info: { playerState: -1 } });
    expect(last()).toBe(false);
    say({ event: 'infoDelivery', info: { playerState: 1 } });
    expect(last()).toBe(true);
    say({ event: 'infoDelivery', info: { playerState: 3 } });
    expect(last()).toBe(true);
    say({ event: 'infoDelivery', info: { playerState: 2 } });
    expect(last()).toBe(false);
    say({ event: 'infoDelivery', info: { playerState: 0 } });
    expect(last()).toBe(false);
  });

  it('재생 상태가 없는 알림(시간 갱신 등)은 상태를 바꾸지 않는다', () => {
    render(<Probe id="a" />);
    say({ event: 'infoDelivery', info: { playerState: 1 } });
    say({ event: 'infoDelivery', info: { currentTime: 12.3 } });
    expect(last()).toBe(true);
  });

  it('우리 플레이어가 아닌 창의 메시지·JSON 이 아닌 메시지는 무시한다', () => {
    render(<Probe id="a" />);
    say({ event: 'infoDelivery', info: { playerState: 1 } }, window);
    say('not json');
    say({ nothing: true });
    expect(last()).toBeUndefined();
  });

  it('답을 들은 뒤에는 더 묻지 않는다', () => {
    render(<Probe id="a" />);
    const post = vi.spyOn(frameWindow(), 'postMessage').mockImplementation(() => {});
    say({ event: 'initialDelivery', info: { playerState: -1 } });
    post.mockClear();
    act(() => vi.advanceTimersByTime(5000));
    expect(post).not.toHaveBeenCalled();
  });

  it('다른 영상으로 바뀌면 다시 모르는 상태에서 시작한다', () => {
    const view = render(<Probe id="a" />);
    say({ event: 'infoDelivery', info: { playerState: 1 } });
    expect(last()).toBe(true);
    view.rerender(<Probe id="b" />);
    expect(last()).toBeUndefined();
  });

  it('떠나면 듣기와 묻기를 그만둔다', () => {
    const view = render(<Probe id="a" />);
    const post = vi.spyOn(frameWindow(), 'postMessage').mockImplementation(() => {});
    view.unmount();
    post.mockClear();
    act(() => vi.advanceTimersByTime(5000));
    expect(post).not.toHaveBeenCalled();
  });
});
