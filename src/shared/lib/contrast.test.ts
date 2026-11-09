import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast';

describe('contrastRatio', () => {
  it('is 21 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });
  it('is 1 for identical colors, including 3-digit hex', () => {
    expect(contrastRatio('#fff', '#ffffff')).toBeCloseTo(1, 5);
  });
  it('matches the WCAG value for the B1 accent on white', () => {
    expect(contrastRatio('#2563eb', '#ffffff')).toBeCloseTo(5.17, 1);
  });
  it('does not depend on argument order', () => {
    expect(contrastRatio('#ffffff', '#2563eb')).toBe(contrastRatio('#2563eb', '#ffffff'));
  });
  it('throws on values that are not #rgb or #rrggbb', () => {
    expect(() => contrastRatio('red', '#ffffff')).toThrow();
    expect(() => contrastRatio('var(--color-b1-accent)', '#ffffff')).toThrow();
  });
});
