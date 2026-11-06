import { describe, expect, it } from 'vitest';
import { reorder } from './reorder';

describe('reorder', () => {
  it('moves an item forward', () => {
    expect(reorder(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
  });
  it('moves an item backward', () => {
    expect(reorder(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });
  it('returns a new array even when nothing moves', () => {
    const items = ['a', 'b', 'c'];
    const out = reorder(items, 1, 1);
    expect(out).toEqual(items);
    expect(out).not.toBe(items);
  });
  it('returns an unchanged copy for out-of-range indexes', () => {
    expect(reorder(['a', 'b', 'c'], 5, 0)).toEqual(['a', 'b', 'c']);
    expect(reorder(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c']);
  });
});
