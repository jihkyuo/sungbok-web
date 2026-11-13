import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usePageLoaded } from './usePageLoaded';

function Probe() {
  return <span>{usePageLoaded() ? 'loaded' : 'loading'}</span>;
}

const setReadyState = (state: DocumentReadyState) =>
  vi.spyOn(document, 'readyState', 'get').mockReturnValue(state);

describe('usePageLoaded', () => {
  afterEach(() => vi.restoreAllMocks());

  it('서버 렌더(HTML)에서는 false — 하이드레이션 첫 렌더와 맞춘다', () => {
    expect(renderToString(<Probe />)).toContain('loading');
  });

  it('마운트 시 페이지가 이미 다 받아졌으면 true', () => {
    setReadyState('complete');
    const { result } = renderHook(() => usePageLoaded());
    expect(result.current).toBe(true);
  });

  it('아직 받는 중이면 false 였다가 load 이벤트 뒤 true', () => {
    const state = setReadyState('interactive');
    const { result } = renderHook(() => usePageLoaded());
    expect(result.current).toBe(false);
    state.mockReturnValue('complete');
    act(() => {
      window.dispatchEvent(new Event('load'));
    });
    expect(result.current).toBe(true);
  });

  it('언마운트하면 load 리스너를 떼어 낸다', () => {
    setReadyState('interactive');
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => usePageLoaded());
    unmount();
    expect(remove).toHaveBeenCalledWith('load', expect.any(Function));
  });
});
