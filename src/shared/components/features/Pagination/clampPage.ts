/**
 * 쪽 수 — 0개여도 1쪽. 쪽당 0개·NaN 처럼 계산이 안 되는 값이면 1쪽(NaN·Infinity 쪽을 만들지 않는다).
 */
export const pageCount = (total: number, pageSize: number) => {
  const n = Math.ceil(total / pageSize);
  return Number.isFinite(n) && n >= 1 ? n : 1;
};

/**
 * 쪽 번호를 1..마지막 쪽 안의 정수로 맞춘다. 숫자가 아니면 1쪽.
 * 쪽 번호 상태는 usePageState 가 이 함수로 맞춰 기억한다.
 */
export const clampPage = (page: number, total: number, pageSize: number) => {
  const p = Number.isFinite(page) ? Math.floor(page) : 1;
  return Math.min(Math.max(p, 1), pageCount(total, pageSize));
};

/** 그 쪽 첫 항목의 전체 목록 기준 위치(0부터) — 자르기와 목록 키가 같은 계산을 쓰게. */
export const pageStart = (page: number, pageSize: number) => (page - 1) * pageSize;

/** 그 쪽의 항목만 자른다(범위 밖 쪽은 빈 배열). 쪽 수 계산(pageCount)과 같은 pageSize 를 쓴다. */
export const pageSlice = <T>(list: readonly T[], page: number, pageSize: number) =>
  list.slice(pageStart(page, pageSize), pageStart(page, pageSize) + pageSize);
