import { describe, expect, it } from 'vitest';
import { youtubeThumbLadder } from './youtubeThumb';

const BASE = 'https://i.ytimg.com/vi/abc_-123';

describe('youtubeThumbLadder', () => {
  it('가장 큰 썸네일(maxres)이면 유튜브가 가진 크기를 작은 것부터 모두 준다', () => {
    expect(youtubeThumbLadder(`${BASE}/maxresdefault.jpg`)).toEqual([
      [320, `${BASE}/mqdefault.jpg`],
      [480, `${BASE}/hqdefault.jpg`],
      [640, `${BASE}/sddefault.jpg`],
      [1280, `${BASE}/maxresdefault.jpg`],
    ]);
  });

  it('받은 주소보다 큰 크기는 넣지 않는다(그 영상에 없을 수 있다)', () => {
    expect(youtubeThumbLadder(`${BASE}/hqdefault.jpg`)).toEqual([
      [320, `${BASE}/mqdefault.jpg`],
      [480, `${BASE}/hqdefault.jpg`],
    ]);
    expect(youtubeThumbLadder(`${BASE}/sddefault.jpg`)?.at(-1)).toEqual([
      640,
      `${BASE}/sddefault.jpg`,
    ]);
  });

  it('라이브 썸네일(_live)은 같은 꼬리표를 붙인 크기들로 준다', () => {
    expect(youtubeThumbLadder(`${BASE}/maxresdefault_live.jpg`)).toEqual([
      [320, `${BASE}/mqdefault_live.jpg`],
      [480, `${BASE}/hqdefault_live.jpg`],
      [640, `${BASE}/sddefault_live.jpg`],
      [1280, `${BASE}/maxresdefault_live.jpg`],
    ]);
  });

  it('webp 를 고르면 같은 크기들의 WebP 주소(vi_webp)로 준다 — 받은 크기 자신도 WebP 로', () => {
    const WEBP = 'https://i.ytimg.com/vi_webp/abc_-123';
    expect(youtubeThumbLadder(`${BASE}/sddefault.jpg`, 'webp')).toEqual([
      [320, `${WEBP}/mqdefault.webp`],
      [480, `${WEBP}/hqdefault.webp`],
      [640, `${WEBP}/sddefault.webp`],
    ]);
    expect(youtubeThumbLadder(`${BASE}/maxresdefault_live.jpg`, 'webp')?.at(-1)).toEqual([
      1280,
      `${WEBP}/maxresdefault_live.webp`,
    ]);
  });

  it('wideOnly 면 16:9 크기(mq·maxres)만 준다 — hq·sd 는 위아래 검은 띠가 든 4:3 이라 세로로 긴 틀에서 띠가 보인다', () => {
    expect(youtubeThumbLadder(`${BASE}/maxresdefault.jpg`, 'jpg', true)).toEqual([
      [320, `${BASE}/mqdefault.jpg`],
      [1280, `${BASE}/maxresdefault.jpg`],
    ]);
    // 가장 큰 것이 4:3(sd)인 영상은 16:9 가 mq 하나뿐이다
    expect(youtubeThumbLadder(`${BASE}/sddefault.jpg`, 'webp', true)).toEqual([
      [320, 'https://i.ytimg.com/vi_webp/abc_-123/mqdefault.webp'],
    ]);
  });

  it('가장 작은 크기(mqdefault·default)뿐이면 바꿀 것이 없다', () => {
    expect(youtubeThumbLadder(`${BASE}/mqdefault.jpg`)).toBeUndefined();
    expect(youtubeThumbLadder(`${BASE}/default.jpg`)).toBeUndefined();
  });

  it('유튜브 썸네일이 아니거나 모양을 모르는 주소는 건드리지 않는다', () => {
    expect(youtubeThumbLadder('https://example.com/vi/abc/hqdefault.jpg')).toBeUndefined();
    expect(youtubeThumbLadder(`${BASE}/hq.jpg`)).toBeUndefined();
    // 서명이 붙은 주소는 크기마다 서명이 달라 이름만 바꿀 수 없다
    expect(youtubeThumbLadder(`${BASE}/hqdefault.jpg?sqp=x&rs=y`)).toBeUndefined();
    expect(youtubeThumbLadder('')).toBeUndefined();
  });
});
