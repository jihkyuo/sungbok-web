/** 한 사진의 미리 만든 크기 목록 — [가로 px, 파일 주소], 가로 오름차순. */
export type VariantLadder = readonly (readonly [width: number, url: string])[];

/**
 * 요청 폭을 채울 수 있는 가장 작은 파일을 고른다. 없으면 원본.
 * 요청 폭보다 작은 파일은 주지 않는다(늘려 그리면 흐려진다).
 */
export const pickVariant = (
  ladder: VariantLadder | undefined,
  original: string,
  width: number
): string => ladder?.find(([w]) => w >= width)?.[1] ?? original;
