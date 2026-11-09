import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { usePageState } from './usePageState';

describe('usePageState', () => {
  it('처음엔 1쪽, setPage 로 넘긴다', () => {
    const { result } = renderHook(() => usePageState(50, 10));
    expect(result.current[0]).toBe(1);
    act(() => result.current[1](3));
    expect(result.current[0]).toBe(3);
  });

  it('항목이 줄면 마지막 쪽으로 당기고, 다시 늘어도 옛 쪽으로 튀지 않는다', () => {
    const { result, rerender } = renderHook(({ total }) => usePageState(total, 10), {
      initialProps: { total: 50 },
    });
    act(() => result.current[1](5));
    rerender({ total: 15 });
    expect(result.current[0]).toBe(2);
    rerender({ total: 50 });
    expect(result.current[0]).toBe(2);
  });

  it('범위 밖으로 넘겨도 맞춘 값으로 기억한다', () => {
    const { result } = renderHook(() => usePageState(30, 10));
    act(() => result.current[1](9));
    expect(result.current[0]).toBe(3);
  });

  it('범위 밖 값은 저장할 때 바로 맞춘다(렌더 한 번 더 돌지 않게)', () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders++;
      return usePageState(30, 10);
    });
    const before = renders;
    act(() => result.current[1](99));
    expect(result.current[0]).toBe(3);
    expect(renders - before).toBe(1);
  });
});
