'use client';

import type { SermonSeries } from '@/domains/worship-video/api/worshipVideo.types';
import {
  ARROW_BTN,
  FOCUS,
  HIT_34,
  PILL,
} from '@/domains/worship-video/components/features/sermonStyles';
import { usePrefersReducedMotion } from '@/shared/lib/hooks/usePrefersReducedMotion';
import { useScrollEdges } from '@/shared/lib/hooks/useScrollEdges';
import { cn } from '@/shared/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

interface Props {
  series: readonly SermonSeries[];
  /** 고른 시리즈 이름. '' 이면 전체 */
  value: string;
  onChange: (name: string) => void;
}

// 화살표 자리 — 뒤로 넘어가는 칩은 배경색으로 흐려진다. 태블릿·PC 만(휴대폰은 손으로 민다)
const EDGE =
  'from-b1-bg pointer-events-none absolute inset-y-0 z-10 hidden w-[76px] items-center from-[46%] to-transparent md:flex';

/**
 * 시리즈 칩 — 어느 폭에서나 한 줄. 넘치면 옆으로 넘기고, 태블릿·PC 는 넘길 것이 남은 쪽에 화살표가 나온다.
 * 화살표는 마우스·터치 전용이다 — 끝까지 넘기면 사라지므로 키보드 포커스를 두지 않는다(키보드는 칩으로 다니고, 칩에 포커스가 가면 줄이 따라 움직인다).
 */
export const SeriesChips = ({ series, value, onChange }: Props) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const edges = useScrollEdges(rowRef);
  const reduced = usePrefersReducedMotion();
  const behavior = reduced ? 'auto' : 'smooth';

  const slide = (dir: 1 | -1) => {
    const row = rowRef.current;
    row?.scrollBy?.({ left: dir * row.clientWidth * 0.7, behavior });
  };
  const pick = (name: string, chip: HTMLElement) => {
    onChange(name);
    // 고른 칩이 끝에 걸려 있으면(화살표·흐림에 가리면) 안쪽으로 당긴다 — 줄 안에서만 민다
    const row = rowRef.current;
    if (!row) return;
    const hidden =
      chip.offsetLeft < row.scrollLeft + 80 ||
      chip.offsetLeft + chip.offsetWidth > row.scrollLeft + row.clientWidth - 80;
    if (hidden) row.scrollTo?.({ left: chip.offsetLeft - 88, behavior });
  };

  const chip = (name: string, label: string) => (
    <button
      key={name}
      type="button"
      aria-pressed={name === value}
      onClick={e => pick(name, e.currentTarget)}
      className={cn(
        PILL,
        HIT_34,
        FOCUS,
        name === value
          ? 'border-b1-accent-soft bg-b1-accent-soft text-b1-accent font-bold'
          : 'text-b1-sub hover:text-b1-text'
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="relative mt-2 md:mt-3">
      {edges.start && (
        <span className={cn(EDGE, '-left-1 justify-start bg-gradient-to-r')}>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={() => slide(-1)}
            className={cn(ARROW_BTN, 'pointer-events-auto')}
          >
            <ChevronLeft aria-hidden className="size-4" />
          </button>
        </span>
      )}
      {/* 스크롤 영역은 위아래도 자른다 — 터치 영역·포커스 링만큼 여백을 둔다. 휴대폰은 화면 끝까지 */}
      <div
        ref={rowRef}
        role="group"
        aria-label="시리즈"
        className="-mx-[6vw] flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-[6vw] py-1.5 md:-mx-1 md:px-1 [&::-webkit-scrollbar]:hidden"
      >
        {chip('', '전체')}
        {series.map(s => chip(s.name, s.name))}
      </div>
      {edges.end && (
        <span className={cn(EDGE, '-right-1 justify-end bg-gradient-to-l')}>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={() => slide(1)}
            className={cn(ARROW_BTN, 'pointer-events-auto')}
          >
            <ChevronRight aria-hidden className="size-4" />
          </button>
        </span>
      )}
    </div>
  );
};
