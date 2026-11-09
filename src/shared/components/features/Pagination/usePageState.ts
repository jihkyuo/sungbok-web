'use client';

import { useCallback, useState } from 'react';

import { clampPage } from './clampPage';

/**
 * 쪽 번호 상태(단일 출처) — 목록을 자르는 쪽이 쥐고, Pagination 에는 값과 setter 를 넘긴다.
 * 항목 수가 바뀌면 범위 안으로 맞춰 기억한다(렌더 중 상태 맞추기) — 다시 늘어도 옛 쪽으로 튀지 않는다.
 */
export const usePageState = (total: number, pageSize: number) => {
  const [raw, setRaw] = useState(1);
  const page = clampPage(raw, total, pageSize);
  if (raw !== page) setRaw(page);
  // 넘길 때 바로 범위 안으로 맞춰 저장한다 — 범위 밖 값이 들어와 렌더가 한 번 더 도는 일이 없게.
  const setPage = useCallback(
    (to: number) => setRaw(clampPage(to, total, pageSize)),
    [total, pageSize]
  );
  return [page, setPage] as const;
};
