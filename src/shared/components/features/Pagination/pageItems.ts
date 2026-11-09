// 쪽 번호 줄에 놓을 칸 — PC 와 휴대폰에서 보일지를 함께 정한다(같은 버튼 하나를 CSS 로 숨긴다 — 두 벌 그리지 않게).
// PC: 1 … (지금 ±2) … 끝. 휴대폰: 1 … 지금 … 끝 — 칸이 44px(터치 기준)라 화살표까지 7칸이어야 375px 한 줄에 든다.

export type PageItem =
  | { kind: 'page'; page: number; desktop: boolean; mobile: boolean }
  | { kind: 'jump-back' | 'jump-forward'; desktop: boolean; mobile: boolean };

const MAX_VISIBLE = 5;
const DESKTOP_RADIUS = 2;
const MOBILE_RADIUS = 0;

/** 1 과 끝 사이에 보일 쪽 범위. 건너뛰기가 한 쪽만 가리게 되면(예: 1 … 3) 그 쪽을 그냥 보인다 — 헷갈리지 않게. */
const windowOf = (total: number, page: number, radius: number) => {
  let start = Math.max(2, page - radius);
  let end = Math.min(total - 1, page + radius);
  if (start === 3) start = 2;
  if (end === total - 2) end = total - 1;
  return { start, end };
};

export const pageItems = (total: number, page: number): PageItem[] => {
  if (total <= MAX_VISIBLE) {
    return Array.from({ length: total }, (_, k) => ({
      kind: 'page',
      page: k + 1,
      desktop: true,
      mobile: true,
    }));
  }
  const d = windowOf(total, page, DESKTOP_RADIUS);
  const m = windowOf(total, page, MOBILE_RADIUS); // 늘 d 안에 든다
  const items: PageItem[] = [{ kind: 'page', page: 1, desktop: true, mobile: true }];
  if (d.start > 2 || m.start > 2) {
    items.push({ kind: 'jump-back', desktop: d.start > 2, mobile: m.start > 2 });
  }
  for (let i = d.start; i <= d.end; i++) {
    items.push({ kind: 'page', page: i, desktop: true, mobile: i >= m.start && i <= m.end });
  }
  if (d.end < total - 1 || m.end < total - 1) {
    items.push({ kind: 'jump-forward', desktop: d.end < total - 1, mobile: m.end < total - 1 });
  }
  items.push({ kind: 'page', page: total, desktop: true, mobile: true });
  return items;
};
