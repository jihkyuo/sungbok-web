'use client';

import { PHOTO_VARIANTS } from '@/assets/photoVariants.generated';
import { pickVariant } from '@/shared/lib/photoVariant';
import Image, { type ImageLoader, type ImageProps, type StaticImageData } from 'next/image';

// srcset 의 각 폭을 미리 만들어 둔 파일(src/assets/sized)로 잇는다 — 서버가 접속 시점에 크기를 줄이지 않는다.
const sizedLoader: ImageLoader = ({ src, width }) => {
  const url = pickVariant(PHOTO_VARIANTS[src], src, width);
  // 원본을 그대로 줄 때 개발 서버의 next/image 가 «loader 가 폭을 반영하지 않는다»고 경고한다(작은 사진마다).
  // 개발에서만 꼬리표를 붙여 끈다 — 운영 주소는 그대로다.
  return process.env.NODE_ENV !== 'production' && url === src ? `${src}?full` : url;
};

type Props = Omit<ImageProps, 'src' | 'loader' | 'quality' | 'unoptimized'> & {
  /** 레포에 있는 사진(정적 import). 유튜브 썸네일은 <YoutubeThumb> 를 쓴다. */
  src: StaticImageData;
};

/**
 * 레포 사진용 next/image. 크기별 파일은 `pnpm images:variants` 가 미리 만들어 두며(화질도 거기서 정한다),
 * 크기 파일이 없는 작은 그림은 원본을 그대로 준다. 어느 쪽이든 /_next/image 변환을 거치지 않는다.
 */
export const Photo = ({ src, alt, ...rest }: Props) =>
  PHOTO_VARIANTS[src.src] ? (
    <Image src={src} alt={alt} loader={sizedLoader} {...rest} />
  ) : (
    <Image src={src} alt={alt} unoptimized {...rest} />
  );
