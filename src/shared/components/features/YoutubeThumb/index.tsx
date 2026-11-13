'use client';

import { pickVariant } from '@/shared/lib/photoVariant';
import { youtubeThumbLadder, type YoutubeThumbFormat } from '@/shared/lib/youtubeThumb';
import Image, { type ImageLoader, type ImageProps } from 'next/image';
import { useState } from 'react';
import { preconnect } from 'react-dom';

const YT_HOST = 'https://i.ytimg.com';

// srcset 의 각 폭을 유튜브가 이미 갖고 있는 크기(320·480·640·1280)로 잇는다 — 우리 서버가 크기를 줄이지 않는다.
// 가장 큰 칸보다 큰 요청에도 그 목록의 가장 큰 것을 준다(WebP 를 쓰는 중에 JPG 원본으로 떨어지지 않게).
const loaderFor =
  (format: YoutubeThumbFormat, wideOnly: boolean): ImageLoader =>
  ({ src, width }) => {
    const ladder = youtubeThumbLadder(src, format, wideOnly);
    return pickVariant(ladder, ladder?.at(-1)?.[1] ?? src, width);
  };
// loader 는 렌더마다 같은 함수여야 한다 — 조합 넷을 미리 만들어 둔다.
const LOADERS = {
  webp: { all: loaderFor('webp', false), wide: loaderFor('webp', true) },
  jpg: { all: loaderFor('jpg', false), wide: loaderFor('jpg', true) },
};

type Props = Omit<ImageProps, 'src' | 'loader' | 'quality' | 'unoptimized'> & {
  /** 유튜브 썸네일 주소(i.ytimg.com). 다른 주소가 와도 그대로 싣는다. */
  src: string;
  /** 16:9 크기만 쓴다 — 16:9 보다 세로로 긴 틀(화면 전체 배경 등)에서 4:3 썸네일의 검은 띠가 보이지 않게. */
  wide?: boolean;
};

/**
 * 유튜브 썸네일용 next/image. /_next/image 변환(캐시가 식으면 한 장당 0.4~1.7초)을 거치지 않고
 * 화면 폭에 맞는 크기를 유튜브에서 바로 받는다. 썸네일이 바뀌면 유튜브 쪽 수명대로 반영된다.
 * WebP 판(JPG 의 절반쯤)을 먼저 쓰고, 받지 못하면 JPG 로 바꾼다.
 */
export const YoutubeThumb = ({ src, alt, wide = false, onError, onLoad, ...rest }: Props) => {
  // WebP 를 받지 못한 주소 — 주소가 바뀌면 다시 WebP 부터 쓴다.
  const [jpgFor, setJpgFor] = useState<string | null>(null);
  const format: YoutubeThumbFormat = jpgFor === src ? 'jpg' : 'webp';
  // 다른 출처라 연결을 새로 맺어야 한다 — 그림을 고르기 전에 미리 맺어 둔다.
  if (src.startsWith(YT_HOST)) preconnect(YT_HOST);
  if (!youtubeThumbLadder(src)) {
    return <Image src={src} alt={alt} unoptimized onError={onError} onLoad={onLoad} {...rest} />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      loader={LOADERS[format][wide ? 'wide' : 'all']}
      onError={e => {
        if (format === 'webp') setJpgFor(src);
        else onError?.(e);
      }}
      onLoad={e => {
        // 유튜브는 없는 썸네일에 404 와 함께 120x90 자리표시 그림을 준다 — error 가 아니라 load 가 난다.
        // 목록의 가장 작은 크기가 320x180 이라 120x90 이면 «없음»이다.
        const { naturalWidth, naturalHeight } = e.currentTarget;
        if (format === 'webp' && naturalWidth === 120 && naturalHeight === 90) setJpgFor(src);
        else onLoad?.(e);
      }}
      {...rest}
    />
  );
};
