import type { VariantLadder } from './photoVariant';

// 유튜브가 영상마다 만들어 두는 썸네일 크기(작은 것부터). sd·maxres 는 영상에 따라 없을 수 있다.
// mq·maxres 는 16:9, hq·sd 는 위아래 검은 띠가 든 4:3 이다(16:9 이하 틀에서는 object-cover 가 띠를 잘라 낸다).
const SIZES = [
  ['mqdefault', 320, true],
  ['hqdefault', 480, false],
  ['sddefault', 640, false],
  ['maxresdefault', 1280, true],
] as const;

const THUMB = /^https:\/\/i\.ytimg\.com\/vi\/([^/]+)\/([a-z]+default)(_live)?\.jpg$/;

export type YoutubeThumbFormat = 'jpg' | 'webp';

/**
 * 유튜브 썸네일 주소 하나에서, 유튜브가 이미 갖고 있는 크기들의 주소 목록을 만든다.
 * 우리 서버가 크기를 줄이지 않고 화면 폭에 맞는 것을 유튜브에서 바로 받게 하려는 것.
 * 받은 주소보다 큰 크기는 넣지 않는다(그 영상에 없을 수 있다). 바꿀 것이 없으면 undefined.
 * format 'webp' 는 같은 그림의 WebP 판(/vi_webp/, JPG 의 절반쯤 용량) 주소를 준다.
 * wideOnly 는 16:9 크기만 준다 — 16:9 보다 세로로 긴 틀에서는 4:3 그림의 검은 띠가 보이기 때문.
 */
export const youtubeThumbLadder = (
  url: string,
  format: YoutubeThumbFormat = 'jpg',
  wideOnly = false
): VariantLadder | undefined => {
  const m = THUMB.exec(url);
  if (!m) return undefined;
  const [, id, name, live = ''] = m;
  const top = SIZES.findIndex(([n]) => n === name);
  if (top < 1) return undefined;
  const base = `https://i.ytimg.com/${format === 'webp' ? 'vi_webp' : 'vi'}/${id}/`;
  return SIZES.slice(0, top + 1)
    .filter(([, , wide]) => wide || !wideOnly)
    .map(([n, w]) => [w, `${base}${n}${live}.${format}`] as const);
};
