/**
 * WCAG 2.x 대비율. `/design` 견본과 토큰 테스트가 상태 색의 4.5:1 조건을 확인하는 데 쓴다.
 * 입력은 `#rgb` 또는 `#rrggbb`.
 */

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const channels = (hex: string): [number, number, number] => {
  if (!HEX.test(hex)) throw new Error(`contrastRatio: #rgb/#rrggbb 가 아닙니다: ${hex}`);
  const h = hex.slice(1);
  const full = h.length === 3 ? [...h].map(c => c + c).join('') : h;
  return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16) / 255) as [number, number, number];
};

const luminance = (hex: string): number => {
  const [r, g, b] = channels(hex).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrastRatio = (fg: string, bg: string): number => {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
};
