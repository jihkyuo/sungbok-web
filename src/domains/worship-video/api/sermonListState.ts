// 목록 페이지의 상태(검색어·시리즈·정렬·보인 편수)를 화면 밖(모듈)에 둔다 — 설교를 보러 갔다가 돌아오면 목록 화면이
// 새로 만들어지는데(다른 페이지였으므로), 그때도 보던 목록이 그대로 이어지게. 새로고침하면 처음으로 돌아간다.
'use client';

import { useCallback, useSyncExternalStore } from 'react';

import type { WorshipPage } from '../config/worshipPages';
import { PAGE_STEP, type ListQuery } from './sermonList';

export type ListState = ListQuery & {
  /** 지금까지 보인 편수 — «설교 더보기» 를 누를 때마다 한 묶음(PAGE_STEP)씩 는다 */
  shown: number;
};

const INITIAL: ListState = { q: '', series: '', sort: 'new', shown: PAGE_STEP };

const states = new Map<WorshipPage, ListState>();
const listeners = new Set<() => void>();

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
};
const read = (page: WorshipPage) => states.get(page) ?? INITIAL;
const write = (page: WorshipPage, next: ListState) => {
  states.set(page, next);
  listeners.forEach(l => l());
};

/** 목록 페이지의 상태와 바꾸는 함수. 서버 HTML·하이드레이션 첫 렌더는 처음 상태(전체·최신순·첫 묶음). */
export const useSermonListState = (page: WorshipPage) => {
  const state = useSyncExternalStore(
    subscribe,
    () => read(page),
    () => INITIAL
  );
  // 조건이 바뀌면 첫 묶음부터 다시
  const setQuery = useCallback(
    (patch: Partial<ListQuery>) => write(page, { ...read(page), ...patch, shown: PAGE_STEP }),
    [page]
  );
  const showMore = useCallback(() => {
    const cur = read(page);
    write(page, { ...cur, shown: cur.shown + PAGE_STEP });
  }, [page]);
  return { state, setQuery, showMore };
};

// ── 목록으로 돌아올 자리 ──
// 설교를 누를 때 목록의 스크롤 위치를 적어 두고(rememberListScroll), 상세 페이지의 «목록» 으로 돌아오면(markListReturn)
// 목록 화면이 꺼내 그 자리로 간다(takeListReturn). 브라우저 «뒤로» 는 브라우저·Next 가 자리를 되찾아 주므로 관여하지 않는다.
// 메뉴로 새로 들어온 경우에는 «돌아옴» 표시가 없어 맨 위에서 시작한다. 적어 둔 위치는 목록이 열릴 때마다 버린다 —
// 남겨 두면 한참 뒤의 «목록» 이 예전 자리로 간다.

const scrolls = new Map<WorshipPage, number>();
const returning = new Set<WorshipPage>();

export const rememberListScroll = (page: WorshipPage, y: number) => {
  scrolls.set(page, y);
};

export const markListReturn = (page: WorshipPage) => {
  returning.add(page);
};

/**
 * 목록 화면이 열릴 때 부른다. «목록» 으로 돌아온 것이면 갈 스크롤 위치(적어 둔 것이 없으면 0), 아니면 undefined.
 * 어느 쪽이든 적어 둔 위치와 표시는 지워진다.
 */
export const takeListReturn = (page: WorshipPage): number | undefined => {
  const y = scrolls.get(page) ?? 0;
  scrolls.delete(page);
  return returning.delete(page) ? y : undefined;
};

/** 전부 처음으로 — 테스트용 */
export const resetSermonListState = () => {
  states.clear();
  scrolls.clear();
  returning.clear();
  listeners.forEach(l => l());
};
