import { cn } from '@/shared/lib/utils';
import { YoutubeThumb } from '@/shared/components/features/YoutubeThumb';

interface Props {
  src: string;
  /** next/image sizes — 놓이는 자리의 폭 */
  sizes: string;
  /** 지금 보고 있는 영상 — 테두리로 표시 */
  current?: boolean;
  /** 썸네일 구석의 표시 글(«재생 중»·«현재 영상») — 지금 보고 있는 영상에만 준다 */
  mark?: string;
  className?: string;
}

/**
 * 설교 썸네일(16:9). 유튜브 high 썸네일은 4:3(영상 위아래에 검은 띠)이라 16:9 틀에 꽉 채워 띠를 잘라 낸다.
 * 바로 옆 제목과 같은 내용이라 대체 글은 비운다(두 번 읽히지 않게).
 */
export const SermonThumb = ({ src, sizes, current, mark, className }: Props) => (
  <span
    className={cn(
      'bg-b1-placeholder relative block aspect-video overflow-hidden rounded-lg',
      // 테두리는 그림 위에 그린다(::after) — 틀의 안쪽 outline 은 꽉 채운 그림에 가려 보이지 않는다
      current &&
        "after:ring-b1-accent after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-[3px] after:content-[''] after:ring-inset",
      className
    )}
  >
    <YoutubeThumb src={src} alt="" fill sizes={sizes} className="object-cover" />
    {mark && (
      <span className="bg-b1-accent text-caption text-b1-surface absolute top-1.5 left-1.5 rounded-md px-2 py-0.5 font-bold">
        {mark}
      </span>
    )}
  </span>
);
