import { cn } from '@/shared/lib/utils';
import type { PropsWithChildren } from 'react';

interface Props {
  /** nav 앵커용 id (예: 'worship', 'location') */
  id?: string;
  /** 바깥 섹션에 적용할 클래스 — 배경 띠/보더 등 풀폭 요소용 */
  className?: string;
}

/**
 * 홈 표준 섹션 래퍼.
 * 바깥 `<section>` 은 풀폭(배경 띠·보더가 화면 끝까지) + 일관된 세로 리듬,
 * 안쪽 컨테이너는 max-w-[1320px] 중앙 정렬 + px-[6vw] (HomeLead 와 동일 체제).
 */
export const Section = ({ id, className, children }: PropsWithChildren<Props>) => {
  return (
    <section id={id} className={cn('px-[6vw] py-20 md:py-28', className)}>
      <div className="mx-auto w-full max-w-[1320px]">{children}</div>
    </section>
  );
};
