import { describe, expect, it } from 'vitest';
import {
  hasHangul,
  judgeFontSizes,
  judgeOverflow,
  judgeTouchTargets,
  parseWidths,
  withTimeout,
  type TargetInfo,
  type TextInfo,
} from './designAudit';

const target = (over: Partial<TargetInfo> = {}): TargetInfo => ({
  label: '메뉴 열기',
  tag: 'button',
  role: null,
  inParagraph: false,
  width: 44,
  height: 44,
  ...over,
});
const text = (over: Partial<TextInfo> = {}): TextInfo => ({
  text: '예루살렘성전 3F',
  fontSizePx: 13,
  isFormControl: false,
  ...over,
});

describe('judgeOverflow', () => {
  it('reports a page wider than the viewport', () => {
    const v = judgeOverflow(375, 383);
    expect(v).toHaveLength(1);
    expect(v[0].kind).toBe('overflow');
    expect(v[0].detail).toContain('383');
  });
  it('accepts an exact fit and a 1px rounding error', () => {
    expect(judgeOverflow(375, 375)).toEqual([]);
    expect(judgeOverflow(375, 376)).toEqual([]);
  });
});

describe('judgeTouchTargets', () => {
  it('flags a 22px button', () => {
    const v = judgeTouchTargets([target({ width: 22, height: 22 })]);
    expect(v).toHaveLength(1);
    expect(v[0].kind).toBe('touch');
    expect(v[0].detail).toContain('메뉴 열기');
  });
  it('accepts 44x44', () => {
    expect(judgeTouchTargets([target()])).toEqual([]);
  });
  it('ignores links inside a paragraph', () => {
    expect(judgeTouchTargets([target({ tag: 'a', inParagraph: true, height: 22 })])).toEqual([]);
  });
  it('ignores hidden elements', () => {
    expect(judgeTouchTargets([target({ width: 0, height: 0 })])).toEqual([]);
  });
});

describe('judgeFontSizes', () => {
  it('flags Korean text under 13px', () => {
    const v = judgeFontSizes([text({ fontSizePx: 11 })]);
    expect(v).toHaveLength(1);
    expect(v[0].kind).toBe('font');
  });
  it('accepts Korean text at 13px', () => {
    expect(judgeFontSizes([text({ fontSizePx: 13 })])).toEqual([]);
  });
  it('allows a Latin eyebrow at 12px but not 11px', () => {
    expect(judgeFontSizes([text({ text: '● WORSHIP', fontSizePx: 12 })])).toEqual([]);
    expect(judgeFontSizes([text({ text: 'WORSHIP', fontSizePx: 11 })])).toHaveLength(1);
  });
  it('ignores empty text', () => {
    expect(judgeFontSizes([text({ text: '', fontSizePx: 8 })])).toEqual([]);
  });
  it('requires 16px in form controls (iOS zoom)', () => {
    expect(judgeFontSizes([text({ text: '이름', fontSizePx: 14, isFormControl: true })])).toHaveLength(1);
    expect(judgeFontSizes([text({ text: '이름', fontSizePx: 16, isFormControl: true })])).toEqual([]);
  });
});

describe('hasHangul', () => {
  it('detects Korean syllables', () => {
    expect(hasHangul('주일')).toBe(true);
    expect(hasHangul('3F')).toBe(false);
  });
});

describe('withTimeout', () => {
  it('returns "timeout" for a promise that never settles', async () => {
    await expect(withTimeout(new Promise(() => {}), 10)).resolves.toBe('timeout');
  });
  it('returns the value when it settles in time', async () => {
    await expect(withTimeout(Promise.resolve(1), 10)).resolves.toBe(1);
  });
  it('propagates a rejection instead of reporting it as a timeout', async () => {
    await expect(withTimeout(Promise.reject(new Error('boom')), 10)).rejects.toThrow('boom');
  });
});

describe('parseWidths', () => {
  it('defaults to the four audit widths', () => {
    expect(parseWidths(undefined)).toEqual([375, 768, 1024, 1280]);
  });
  it('parses a comma list', () => {
    expect(parseWidths('375,1280')).toEqual([375, 1280]);
  });
  it('rejects empty, non-numeric and implausibly small widths', () => {
    expect(() => parseWidths('375,,768')).toThrow();
    expect(() => parseWidths('abc')).toThrow();
    expect(() => parseWidths('100')).toThrow();
  });
});
