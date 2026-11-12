'use client';

import {
  dateLabel,
  seriesByYear,
  seriesSermons,
  topSeries,
} from '@/domains/worship-video/api/sermonList';
import type { Sermon, SermonSeries } from '@/domains/worship-video/api/worshipVideo.types';
import { FOCUS, HIT_34, PILL } from '@/domains/worship-video/components/features/sermonStyles';
import { SermonThumb } from '@/domains/worship-video/components/features/SermonThumb';
import { usePrefersReducedMotion } from '@/shared/lib/hooks/usePrefersReducedMotion';
import { cn } from '@/shared/lib/utils';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { Fragment, useEffect, useId, useRef, useState } from 'react';

interface Props {
  sermons: readonly Sermon[];
  series: readonly SermonSeries[];
  /** 플레이어에 떠 있는 설교 */
  current: Sermon;
  /** 그 설교가 재생 중인지(포스터 상태면 false) */
  playing: boolean;
  /** 목록에 펼쳐 보이는 시리즈 — 재생 중인 설교의 시리즈와 다를 수 있다(다른 시리즈를 둘러보는 중) */
  seriesName: string;
  onSeries: (name: string) => void;
  onPick: (videoId: string) => void;
}

const ARROW =
  "border-b1-border bg-b1-surface text-b1-text relative grid size-[30px] place-items-center rounded-full border before:absolute before:-inset-2 before:content-['']";

/**
 * 설교 목록 — 시리즈 칩(최근 4개 + 전체 고르기)과 고른 시리즈의 회차.
 * 회차 줄은 휴대폰에서 옆으로 미는 한 줄, 태블릿은 3칸 + 화살표, PC(lg 이상)는 플레이어 옆 세로 목록(스크롤바는 PC 만).
 */
export const SermonSidebar = ({
  sermons,
  series,
  current,
  playing,
  seriesName,
  onSeries,
  onPick,
}: Props) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const headId = useId();
  const pickerId = useId();
  const rowRef = useRef<HTMLUListElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const episodes = seriesSermons(sermons, seriesName);

  // 시리즈나 재생 영상이 바뀌면 회차 줄을 재생 중인 편(없으면 처음)으로, 칩 줄을 고른 칩으로 맞춘다.
  // scrollIntoView 는 페이지까지 움직일 수 있어 쓰지 않는다 — 줄 안에서만 민다.
  useEffect(() => {
    const row = rowRef.current;
    if (row) {
      const on = row.querySelector<HTMLElement>('[aria-current="true"]')?.closest('li');
      const pad = parseFloat(getComputedStyle(row).paddingLeft) || 0; // 포커스 링용 여백만큼 덜 민다
      row.scrollTo?.({
        left: on ? on.offsetLeft - pad : 0,
        top: on ? on.offsetTop - pad : 0,
        behavior: 'auto',
      });
    }
    const chips = chipsRef.current;
    const chip = chips?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (chips && chip) {
      const pad = parseFloat(getComputedStyle(chips).paddingLeft) || 0;
      const hidden =
        chip.offsetLeft < chips.scrollLeft ||
        chip.offsetLeft + chip.offsetWidth > chips.scrollLeft + chips.clientWidth;
      if (hidden) chips.scrollTo?.({ left: chip.offsetLeft - pad, behavior: 'auto' });
    }
  }, [seriesName, current.id]);

  const scrollRow = (dir: 1 | -1) => {
    const row = rowRef.current;
    row?.scrollBy?.({ left: dir * row.clientWidth * 0.9, behavior: reduced ? 'auto' : 'smooth' });
  };

  const chooseSeries = (name: string) => {
    onSeries(name);
    setPickerOpen(false);
  };

  return (
    <aside aria-labelledby={headId} className="mt-7 min-w-0 lg:sticky lg:top-[72px] lg:mt-0">
      <div className="mb-2.5 flex items-baseline gap-1.5">
        <h2 id={headId} className="text-b1-text text-title font-bold tracking-[-0.02em]">
          설교 목록
        </h2>
        <span className="text-b1-sub text-caption">재생목록 {series.length}개</span>
      </div>

      {/* 칩 줄 — lg 미만은 옆으로 민다. 스크롤 영역은 위아래도 자르므로 터치 영역·포커스 링만큼 여백을 두고 같은 만큼 당긴다 */}
      <div
        ref={chipsRef}
        className="relative -mx-1 -my-1.5 flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-1 py-1.5 lg:flex-wrap lg:overflow-visible [&::-webkit-scrollbar]:hidden"
      >
        {topSeries(series, seriesName).map(s => (
          <button
            key={s.name}
            type="button"
            aria-pressed={s.name === seriesName}
            onClick={() => chooseSeries(s.name)}
            className={cn(
              PILL,
              HIT_34,
              FOCUS,
              // 선택 표시는 서브페이지 머리의 메뉴 알약(진한 파랑)보다 한 단계 낮게 — 둘 다 메뉴처럼 읽히지 않게
              s.name === seriesName
                ? 'border-b1-accent-soft bg-b1-accent-soft text-b1-accent font-bold'
                : 'text-b1-sub hover:text-b1-text'
            )}
          >
            {s.name}
          </button>
        ))}
        <button
          type="button"
          aria-expanded={pickerOpen}
          aria-controls={pickerId}
          onClick={() => setPickerOpen(o => !o)}
          className={cn(PILL, HIT_34, FOCUS, 'text-b1-accent border-dashed font-bold')}
        >
          {pickerOpen ? '접기' : `전체 ${series.length}개`}
          {pickerOpen ? (
            <ChevronUp aria-hidden className="-mr-0.5 size-3.5" />
          ) : (
            <ChevronDown aria-hidden className="-mr-0.5 size-3.5" />
          )}
        </button>
      </div>

      {pickerOpen && (
        <div
          id={pickerId}
          // 안쪽 스크롤은 브라우저 기본으로 — 사이트 부드러운 스크롤(Lenis)이 휠을 가져가지 않게. 끝에 닿으면 페이지로 이어진다
          // (overscroll 을 가두지 않는다 — 넘치지 않는 짧은 목록 위에서 휠이 먹통이 된다)
          data-lenis-prevent
          className="border-b1-border bg-b1-surface mt-3.5 max-h-[440px] overflow-y-auto rounded-2xl border px-3 pt-1.5 pb-3"
        >
          {seriesByYear(series).map(([label, list]) => (
            <Fragment key={label}>
              <p className="text-b1-sub text-caption mt-2.5 mb-2 font-bold">{label}</p>
              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 lg:grid-cols-2">
                {list.map(s => (
                  <button
                    key={s.name}
                    type="button"
                    aria-pressed={s.name === seriesName}
                    onClick={() => chooseSeries(s.name)}
                    className={cn(
                      'grid min-w-0 content-start gap-1.5 rounded-xl p-1.5 text-left',
                      FOCUS,
                      s.name === seriesName && 'bg-b1-accent-soft'
                    )}
                  >
                    <SermonThumb
                      src={s.thumbnail}
                      sizes="(min-width: 1024px) 150px, (min-width: 768px) 22vw, 44vw"
                    />
                    <span className="min-w-0">
                      <b className="text-b1-text text-caption block leading-snug font-bold">
                        {s.name}
                      </b>
                      <small className="text-b1-sub text-caption">영상 {s.count}개</small>
                    </span>
                  </button>
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      )}

      {/* 태블릿(md~lg): 회차 줄을 넘기는 화살표. 휴대폰은 손으로 밀고, PC 는 세로 목록이라 없다 */}
      <div className="mt-2 hidden justify-end gap-4 md:flex lg:hidden">
        <button
          type="button"
          aria-label="이전 영상들"
          onClick={() => scrollRow(-1)}
          className={cn(ARROW, FOCUS)}
        >
          <ChevronLeft aria-hidden className="size-4" />
        </button>
        <button
          type="button"
          aria-label="다음 영상들"
          onClick={() => scrollRow(1)}
          className={cn(ARROW, FOCUS)}
        >
          <ChevronRight aria-hidden className="size-4" />
        </button>
      </div>

      <ul
        ref={rowRef}
        aria-label={`${seriesName} 영상`}
        data-lenis-prevent
        className={cn(
          'relative m-0 mt-3.5 grid snap-x snap-mandatory list-none auto-cols-[72%] grid-flow-col gap-3 overflow-x-auto p-0',
          // 포커스 링이 스크롤 영역에 잘리지 않게 여백을 두고 같은 만큼 당긴다
          '-mx-1 scroll-p-1 [scrollbar-width:none] px-1 py-1 [&::-webkit-scrollbar]:hidden',
          'md:mt-2 md:auto-cols-[calc((100%-24px)/3)]',
          'lg:mt-3.5 lg:max-h-[470px] lg:snap-none lg:[scrollbar-width:thin] lg:auto-cols-auto lg:grid-flow-row lg:gap-2.5 lg:overflow-x-hidden lg:overflow-y-auto lg:pr-2 lg:[&::-webkit-scrollbar]:block'
        )}
      >
        {episodes.map(x => {
          const on = x.id === current.id;
          return (
            <li key={x.id} className="min-w-0 snap-start">
              <button
                type="button"
                aria-current={on ? 'true' : undefined}
                onClick={() => onPick(x.id)}
                className={cn(
                  'grid w-full content-start gap-2 rounded-xl text-left lg:grid-cols-[148px_minmax(0,1fr)] lg:items-start lg:gap-2.5',
                  FOCUS
                )}
              >
                <SermonThumb
                  src={x.thumbnail}
                  current={on}
                  playing={playing}
                  sizes="(min-width: 1024px) 148px, (min-width: 768px) 30vw, 68vw"
                />
                <span className="grid min-w-0 gap-0.5">
                  <b className="text-b1-text text-body-sm line-clamp-2 leading-snug font-bold">
                    {x.title}
                  </b>
                  <small className="text-b1-sub text-caption tabular-nums">
                    {x.no !== undefined ? `${x.no}편 · ` : x.occasion ? `${x.occasion} · ` : ''}
                    {dateLabel(x)}
                  </small>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
