import { describe, expect, it } from 'vitest';
import { scrollbarWidth } from './scrollbarWidth';

describe('scrollbarWidth', () => {
  it('is the gap between the window and the page content width', () => {
    expect(scrollbarWidth(538, 523)).toBe(15);
  });
  it('is 0 for overlay scrollbars (phones, macOS trackpad)', () => {
    expect(scrollbarWidth(375, 375)).toBe(0);
  });
  it('never goes negative when the page is zoomed or widened', () => {
    expect(scrollbarWidth(375, 383)).toBe(0);
  });
});
