import { describe, expect, it } from 'vitest';

import { isPlainClick } from './isPlainClick';

const click = (over: Partial<Parameters<typeof isPlainClick>[0]> = {}) => ({
  button: 0,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  ...over,
});

describe('isPlainClick', () => {
  it('보조 키 없이 누른 왼쪽 클릭만 «이 탭에서 이동» 이다', () => {
    expect(isPlainClick(click())).toBe(true);
  });

  it('새 탭·새 창·내려받기로 여는 클릭(Cmd·Ctrl·Shift·Alt, 가운데 버튼)은 아니다', () => {
    expect(isPlainClick(click({ metaKey: true }))).toBe(false);
    expect(isPlainClick(click({ ctrlKey: true }))).toBe(false);
    expect(isPlainClick(click({ shiftKey: true }))).toBe(false);
    expect(isPlainClick(click({ altKey: true }))).toBe(false);
    expect(isPlainClick(click({ button: 1 }))).toBe(false);
  });
});
