/** 목록에서 from 위치의 항목을 to 위치로 옮긴 새 배열. 범위 밖 인덱스면 원본 순서 그대로의 복사본. */
export const reorder = <T>(items: readonly T[], from: number, to: number): T[] => {
  const next = [...items];
  const inRange = (i: number) => Number.isInteger(i) && i >= 0 && i < items.length;
  if (!inRange(from) || !inRange(to)) return next;
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};
