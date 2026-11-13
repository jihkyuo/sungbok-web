import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { PAGE_STEP } from './sermonList';
import {
  markListReturn,
  rememberListScroll,
  resetSermonListState,
  takeListReturn,
  useSermonListState,
} from './sermonListState';

beforeEach(() => {
  resetSermonListState();
});

describe('useSermonListState', () => {
  it('처음엔 전체·최신순·검색 없음, 첫 묶음만', () => {
    const { result } = renderHook(() => useSermonListState('sunday'));
    expect(result.current.state).toEqual({ q: '', series: '', sort: 'new', shown: PAGE_STEP });
  });

  it('더보기는 한 묶음씩 늘리고, 조건(검색·시리즈·정렬)을 바꾸면 첫 묶음부터 다시', () => {
    const { result } = renderHook(() => useSermonListState('sunday'));
    act(() => result.current.showMore());
    act(() => result.current.showMore());
    expect(result.current.state.shown).toBe(PAGE_STEP * 3);

    act(() => result.current.setQuery({ series: '사도행전 강해' }));
    expect(result.current.state).toEqual({
      q: '',
      series: '사도행전 강해',
      sort: 'new',
      shown: PAGE_STEP,
    });
    act(() => result.current.setQuery({ q: '13장', sort: 'old' }));
    expect(result.current.state).toMatchObject({ q: '13장', series: '사도행전 강해', sort: 'old' });
  });

  it('페이지를 떠났다 돌아와도(다시 마운트) 그대로다 — 설교를 보고 돌아오면 보던 목록이 이어진다', () => {
    const first = renderHook(() => useSermonListState('sunday'));
    act(() => first.result.current.setQuery({ q: '은혜' }));
    act(() => first.result.current.showMore());
    first.unmount();

    const again = renderHook(() => useSermonListState('sunday'));
    expect(again.result.current.state).toEqual({
      q: '은혜',
      series: '',
      sort: 'new',
      shown: PAGE_STEP * 2,
    });
  });
});

describe('목록으로 돌아올 자리', () => {
  it('«목록» 으로 돌아온 경우에만 떠날 때 적어 둔 스크롤 위치를 준다 — 한 번 쓰면 지워진다', () => {
    // 메뉴로 새로 들어온 경우(돌아온 것이 아님) — 맨 위에서 시작해야 한다
    expect(takeListReturn('sunday')).toBeUndefined();

    rememberListScroll('sunday', 1840);
    markListReturn('sunday');
    expect(takeListReturn('sunday')).toBe(1840);
    expect(takeListReturn('sunday')).toBeUndefined();
  });

  it('돌아온 것이 아닌 채로 목록이 열리면 적어 둔 위치는 버린다 — 나중의 «목록» 이 낡은 자리로 가지 않게', () => {
    rememberListScroll('sunday', 1840);
    expect(takeListReturn('sunday')).toBeUndefined(); // 브라우저 «뒤로» 나 메뉴로 들어온 목록
    markListReturn('sunday');
    expect(takeListReturn('sunday')).toBe(0);
  });

  it('적어 둔 위치 없이 돌아오면(주소로 바로 들어온 설교에서 «목록») 맨 위', () => {
    markListReturn('sunday');
    expect(takeListReturn('sunday')).toBe(0);
  });
});
