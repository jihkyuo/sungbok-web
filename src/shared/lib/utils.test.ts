import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn with design-system font-size tokens', () => {
  it('keeps a size token next to a B1 color token', () => {
    expect(cn('text-body-sm', 'text-b1-sub')).toBe('text-body-sm text-b1-sub');
    expect(cn('text-caption text-b1-muted')).toBe('text-caption text-b1-muted');
  });
  it('still lets a later size token replace an earlier one', () => {
    expect(cn('text-caption', 'text-label')).toBe('text-label');
    expect(cn('text-body', 'text-[15px]')).toBe('text-[15px]');
  });
  it('still lets a later color replace an earlier color', () => {
    expect(cn('text-b1-sub', 'text-b1-accent')).toBe('text-b1-accent');
  });
});

describe('cn with motion tokens', () => {
  it('lets a later duration replace the duration token', () => {
    expect(cn('duration-fast', 'duration-300')).toBe('duration-300');
    expect(cn('ease-standard', 'ease-out')).toBe('ease-out');
  });
});
