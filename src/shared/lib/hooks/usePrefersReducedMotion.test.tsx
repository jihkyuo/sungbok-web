import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usePrefersReducedMotion } from './usePrefersReducedMotion';

type Listener = () => void;

function mockMatchMedia(initial: boolean) {
  let matches = initial;
  const listeners = new Set<Listener>();
  const mql = {
    get matches() {
      return matches;
    },
    addEventListener: (_: string, l: Listener) => listeners.add(l),
    removeEventListener: (_: string, l: Listener) => listeners.delete(l),
  };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mql)
  );
  return {
    set(next: boolean) {
      matches = next;
      listeners.forEach(l => l());
    },
  };
}

function Probe() {
  return <span>{usePrefersReducedMotion() ? 'reduce' : 'motion'}</span>;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('usePrefersReducedMotion', () => {
  it('서버 HTML 에서는 false(모션 있음) — 하이드레이션 첫 렌더와 맞춘다', () => {
    mockMatchMedia(true);
    expect(renderToString(<Probe />)).toContain('motion');
  });

  it('브라우저에서는 OS 설정을 읽는다', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it('페이지를 연 채 OS 설정을 바꾸면 따라 바뀐다', () => {
    const mq = mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
    act(() => mq.set(true));
    expect(result.current).toBe(true);
  });
});
