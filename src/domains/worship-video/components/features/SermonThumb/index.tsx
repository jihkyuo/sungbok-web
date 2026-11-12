import { YT_THUMB } from '@/domains/worship-video/components/features/sermonStyles';
import { cn } from '@/shared/lib/utils';
import Image from 'next/image';

interface Props {
  src: string;
  /** next/image sizes — 놓이는 자리의 폭 */
  sizes: string;
  /** 플레이어에 떠 있는 영상 — 테두리로 표시 */
  current?: boolean;
  /** 그 영상이 재생 중 — «재생 중» 배지(포스터 상태에서는 붙이지 않는다) */
  playing?: boolean;
  className?: string;
}

/**
 * 설교 썸네일(16:9). 유튜브 high 썸네일은 4:3(영상 위아래에 검은 띠)이라 16:9 틀에 꽉 채워 띠를 잘라 낸다.
 * 바로 옆 제목과 같은 내용이라 대체 글은 비운다(두 번 읽히지 않게).
 */
export const SermonThumb = ({ src, sizes, current, playing, className }: Props) => (
  <span
    className={cn(
      'bg-b1-placeholder relative block aspect-video overflow-hidden rounded-lg',
      current && 'outline-b1-accent outline-[3px] -outline-offset-[3px]',
      className
    )}
  >
    <Image
      src={src}
      alt=""
      fill
      sizes={sizes}
      className="object-cover"
      unoptimized={!YT_THUMB.test(src)}
    />
    {current && playing && (
      <span className="bg-b1-accent text-caption text-b1-surface absolute top-1.5 left-1.5 rounded-md px-2 py-0.5 font-bold">
        재생 중
      </span>
    )}
  </span>
);
