import { act, renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useNearViewport } from './useNearViewport';

type Cb = (entries: { isIntersecting: boolean }[]) => void;
let lastCb: Cb | null = null;
let lastOpts: IntersectionObserverInit | undefined;
const disconnect = vi.fn();

class IOMock {
  constructor(cb: Cb, opts?: IntersectionObserverInit) {
    lastCb = cb;
    lastOpts = opts;
  }
  observe() {}
  unobserve() {}
  disconnect = disconnect;
}

const setup = (margin?: string) =>
  renderHook(() => {
    const ref = useRef<HTMLDivElement>(document.createElement('div'));
    return useNearViewport(ref, margin);
  });

beforeEach(() => {
  lastCb = null;
  disconnect.mockReset();
  vi.stubGlobal('IntersectionObserver', IOMock);
});
afterEach(() => vi.unstubAllGlobals());

describe('useNearViewport', () => {
  it('처음엔 false, 화면 근처에 들어오면 true 로 바뀌고 관찰을 끊는다(한 번 붙이면 유지)', () => {
    const { result } = setup('150% 0px');
    expect(result.current).toBe(false);
    expect(lastOpts?.rootMargin).toBe('150% 0px');

    act(() => lastCb!([{ isIntersecting: false }]));
    expect(result.current).toBe(false);

    act(() => lastCb!([{ isIntersecting: true }]));
    expect(result.current).toBe(true);
    expect(disconnect).toHaveBeenCalled();

    act(() => lastCb!([{ isIntersecting: false }]));
    expect(result.current).toBe(true);
  });

  it('rootMargin 을 안 주면 두 화면 앞(200%)에서 붙인다', () => {
    setup();
    expect(lastOpts?.rootMargin).toBe('200% 0px');
  });
});
