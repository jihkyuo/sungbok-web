import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Next 라우터의 주소 쿼리 — 시험에서는 값을 직접 바꾼다
const routerParams = vi.hoisted(() => ({ current: new URLSearchParams() }));
vi.mock('next/navigation', () => ({ useSearchParams: () => routerParams.current }));

import { useVideoParam, useVideoParamRouterSync } from './useVideoParam';

afterEach(() => window.history.replaceState(null, '', '/'));

describe('useVideoParam', () => {
  it('주소에 v 가 없으면 null', () => {
    window.history.replaceState(null, '', '/worship/sunday');
    const { result } = renderHook(() => useVideoParam());
    expect(result.current[0]).toBeNull();
  });

  it('주소의 ?v= 를 읽는다 — 공유한 주소로 들어오면 그 영상', () => {
    window.history.replaceState(null, '', '/worship/sunday?v=abc123');
    const { result } = renderHook(() => useVideoParam());
    expect(result.current[0]).toBe('abc123');
  });

  it('영상을 고르면 주소에 남기고 값이 바뀐다 — 다른 쿼리는 그대로 둔다', () => {
    window.history.replaceState(null, '', '/worship/sunday?x=1');
    const { result } = renderHook(() => useVideoParam());
    act(() => result.current[1]('new-id'));
    expect(result.current[0]).toBe('new-id');
    expect(window.location.pathname + window.location.search).toBe('/worship/sunday?x=1&v=new-id');
  });

  it('고를 때마다 방문 기록이 쌓이고, 뒤로 가면 이전 영상으로 돌아간다', () => {
    window.history.replaceState(null, '', '/worship/sunday?v=first');
    const { result } = renderHook(() => useVideoParam());
    const before = window.history.length;
    act(() => result.current[1]('second'));
    expect(window.history.length).toBe(before + 1);

    // jsdom 의 history.back() 은 비동기라, 주소를 되돌린 뒤 브라우저가 내는 popstate 를 직접 낸다
    act(() => {
      window.history.replaceState(null, '', '/worship/sunday?v=first');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current[0]).toBe('first');
  });

  it('같은 영상을 다시 고르면 방문 기록을 더 쌓지 않는다', () => {
    window.history.replaceState(null, '', '/worship/sunday?v=same');
    const { result } = renderHook(() => useVideoParam());
    const before = window.history.length;
    act(() => result.current[1]('same'));
    expect(window.history.length).toBe(before);
  });

  it("'replace' 로 고르면 주소만 바꾸고 방문 기록은 쌓지 않는다 — 포스터로 재생을 시작할 때", () => {
    window.history.replaceState(null, '', '/worship/sunday');
    const { result } = renderHook(() => useVideoParam());
    const before = window.history.length;
    act(() => result.current[1]('latest', 'replace'));
    expect(result.current[0]).toBe('latest');
    expect(window.location.search).toBe('?v=latest');
    expect(window.history.length).toBe(before);
  });

  it("'replace' 는 history 에 든 Next 내부 상태를 그대로 넘기지 않는다 — 넘기면 Next 가 제 호출로 여겨 라우터 주소를 안 맞춘다", () => {
    // Next 가 history.state 에 넣어 두는 내부 표시
    window.history.replaceState(
      { __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: [] },
      '',
      '/worship/sunday'
    );
    const replace = vi.spyOn(window.history, 'replaceState');
    const { result } = renderHook(() => useVideoParam());
    act(() => result.current[1]('latest', 'replace'));
    expect(replace).toHaveBeenCalledWith(null, '', expect.any(URL));
    replace.mockRestore();
  });

  it('여러 곳에서 써도 함께 바뀐다', () => {
    const a = renderHook(() => useVideoParam());
    const b = renderHook(() => useVideoParam());
    act(() => a.result.current[1]('shared'));
    expect(b.result.current[0]).toBe('shared');
  });

  it('Next 라우터가 주소를 바꾸면(같은 페이지 링크 — popstate 없음) 따라 바뀐다', () => {
    window.history.replaceState(null, '', '/worship/sunday?v=picked');
    routerParams.current = new URLSearchParams('v=picked');
    const { result, rerender } = renderHook(() => {
      useVideoParamRouterSync();
      return useVideoParam();
    });
    expect(result.current[0]).toBe('picked');

    // 머리의 «주일예배» 알약(/worship/sunday)을 누른 것처럼 — 라우터가 주소에서 v 를 지운다
    window.history.replaceState(null, '', '/worship/sunday');
    routerParams.current = new URLSearchParams();
    rerender();
    expect(result.current[0]).toBeNull();
  });
});
