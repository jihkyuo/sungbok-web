import { act, render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useScrollEdges } from './useScrollEdges';

// 훅이 돌려준 값을 화면에 적어 두고 읽는다
const Probe = () => {
  const ref = useRef<HTMLDivElement>(null);
  const edges = useScrollEdges(ref);
  return <div ref={ref} data-testid="row" data-start={edges.start} data-end={edges.end} />;
};
const edgesOf = (row: HTMLElement) => ({
  start: row.dataset.start === 'true',
  end: row.dataset.end === 'true',
});
// jsdom 은 배치를 하지 않는다 — 폭·스크롤 값을 직접 정해 준다
const size = (
  el: HTMLElement,
  v: { scrollWidth: number; clientWidth: number; scrollLeft: number }
) => {
  for (const [k, value] of Object.entries(v)) {
    Object.defineProperty(el, k, { value, configurable: true, writable: true });
  }
};
const scrollTo = (el: HTMLElement, left: number) =>
  act(() => {
    size(el, { scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, scrollLeft: left });
    el.dispatchEvent(new Event('scroll'));
  });

afterEach(() => vi.unstubAllGlobals());

describe('useScrollEdges', () => {
  it('넘치지 않는 줄은 양쪽 다 넘길 것이 없다', () => {
    const row = render(<Probe />).getByTestId('row');
    expect(edgesOf(row)).toEqual({ start: false, end: false });
  });

  it('넘치는 줄은 스크롤 위치에 따라 넘길 수 있는 쪽을 알려 준다', () => {
    const row = render(<Probe />).getByTestId('row');
    size(row, { scrollWidth: 1500, clientWidth: 1000, scrollLeft: 0 });
    scrollTo(row, 0);
    expect(edgesOf(row)).toEqual({ start: false, end: true });

    scrollTo(row, 200);
    expect(edgesOf(row)).toEqual({ start: true, end: true });

    scrollTo(row, 500);
    expect(edgesOf(row)).toEqual({ start: true, end: false });
  });

  it('끝에서 2px 안쪽은 끝으로 본다 — 소수점 스크롤 값에 화살표가 남지 않게', () => {
    const row = render(<Probe />).getByTestId('row');
    size(row, { scrollWidth: 1500, clientWidth: 1000, scrollLeft: 0 });
    scrollTo(row, 498.5);
    expect(edgesOf(row)).toEqual({ start: true, end: false });
    scrollTo(row, 1.5);
    expect(edgesOf(row)).toEqual({ start: false, end: true });
  });

  it('줄의 크기가 바뀌면(창 크기 변경) 다시 잰다', () => {
    let notify: () => void = () => {};
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(cb: () => void) {
          notify = cb;
        }
        observe() {}
        disconnect() {}
      }
    );
    const row = render(<Probe />).getByTestId('row');
    expect(edgesOf(row)).toEqual({ start: false, end: false });
    size(row, { scrollWidth: 1500, clientWidth: 600, scrollLeft: 0 });
    act(() => notify());
    expect(edgesOf(row)).toEqual({ start: false, end: true });
  });
});
