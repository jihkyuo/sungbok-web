import { describe, expect, it } from 'vitest';
import { pickVariant, type VariantLadder } from './photoVariant';

const ORIGINAL = '/media/main01.webp';
const LADDER: VariantLadder = [
  [384, '/media/main01.w384.webp'],
  [640, '/media/main01.w640.webp'],
  [1080, '/media/main01.w1080.webp'],
];

describe('pickVariant', () => {
  it('요청 폭과 같은 크기가 있으면 그 파일을 준다', () => {
    expect(pickVariant(LADDER, ORIGINAL, 640)).toBe('/media/main01.w640.webp');
  });

  it('같은 크기가 없으면 요청 폭보다 큰 것 중 가장 작은 파일을 준다(흐려지지 않게 올림)', () => {
    expect(pickVariant(LADDER, ORIGINAL, 750)).toBe('/media/main01.w1080.webp');
    expect(pickVariant(LADDER, ORIGINAL, 32)).toBe('/media/main01.w384.webp');
  });

  it('미리 만든 어떤 크기보다 큰 폭을 요청하면 원본을 준다', () => {
    expect(pickVariant(LADDER, ORIGINAL, 1920)).toBe(ORIGINAL);
    expect(pickVariant(LADDER, ORIGINAL, 3840)).toBe(ORIGINAL);
  });

  it('미리 만든 크기가 없으면 원본을 준다', () => {
    expect(pickVariant([], ORIGINAL, 640)).toBe(ORIGINAL);
    expect(pickVariant(undefined, ORIGINAL, 640)).toBe(ORIGINAL);
  });
});
