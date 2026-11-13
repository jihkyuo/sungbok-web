import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { loadApi } = vi.hoisted(() => ({ loadApi: vi.fn() }));
vi.mock('@/shared/lib/youtubePlayer', () => ({ loadYouTubeIframeApi: loadApi }));

import { HomeVideoWarmup } from './index';

let idle: IdleRequestCallback | undefined;
const cancelIdle = vi.fn();
beforeEach(() => {
  loadApi.mockReset().mockResolvedValue(undefined);
  idle = undefined;
  cancelIdle.mockReset();
  vi.stubGlobal(
    'requestIdleCallback',
    vi.fn((callback: IdleRequestCallback) => {
      idle = callback;
      return 17;
    })
  );
  vi.stubGlobal('cancelIdleCallback', cancelIdle);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('HomeVideoWarmup', () => {
  it('첫 문서가 로드되기 전에는 유튜브 스크립트를 받지 않고, 이후 여유 시간에 준비한다', () => {
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
    render(<HomeVideoWarmup />);
    expect(loadApi).not.toHaveBeenCalled();
    expect(idle).toBeUndefined();
    act(() => window.dispatchEvent(new Event('load')));
    expect(loadApi).not.toHaveBeenCalled();
    act(() => idle?.({ didTimeout: false, timeRemaining: () => 30 }));
    expect(loadApi).toHaveBeenCalledOnce();
  });

  it('이미 열린 문서에서도 초기화는 여유 시간까지 미룬다', () => {
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete');
    render(<HomeVideoWarmup />);
    expect(loadApi).not.toHaveBeenCalled();
    act(() => idle?.({ didTimeout: false, timeRemaining: () => 30 }));
    expect(loadApi).toHaveBeenCalledOnce();
  });

  it('페이지를 떠나면 준비 예약을 취소하고 늦게 도착한 콜백도 무시한다', () => {
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete');
    const { unmount } = render(<HomeVideoWarmup />);
    unmount();
    expect(cancelIdle).toHaveBeenCalledWith(17);
    act(() => idle?.({ didTimeout: false, timeRemaining: () => 30 }));
    expect(loadApi).not.toHaveBeenCalled();
  });
});
