'use client';

import { requestPlay } from '@/domains/worship-video/api/playIntent';
import {
  dateLabel,
  filterSermons,
  highlightParts,
  listRows,
  sermonTag,
} from '@/domains/worship-video/api/sermonList';
import {
  rememberListScroll,
  useSermonListState,
} from '@/domains/worship-video/api/sermonListState';
import type { Sermon, SermonSeries } from '@/domains/worship-video/api/worshipVideo.types';
import { SeriesChips } from '@/domains/worship-video/components/features/SermonList/SeriesChips';
import {
  FOCUS,
  HIT_36,
  OUTLINE_BTN,
} from '@/domains/worship-video/components/features/sermonStyles';
import { SermonThumb } from '@/domains/worship-video/components/features/SermonThumb';
import { sermonPath, type WorshipPage } from '@/domains/worship-video/config/worshipPages';
import { isPlainClick } from '@/shared/lib/isPlainClick';
import { cn } from '@/shared/lib/utils';
import { ChevronDown, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useMemo, useRef } from 'react';

interface Props {
  page: WorshipPage;
  sermons: readonly Sermon[];
  series: readonly SermonSeries[];
}

const SORTS = [
  { value: 'new', label: '최신순' },
  { value: 'old', label: '오래된 순' },
] as const;

/** 검색어와 맞은 조각을 표시한다 */
const Highlight = ({ text, q }: { text: string; q: string }) =>
  highlightParts(text, q).map((part, i) =>
    part.hit ? (
      <mark key={i} className="bg-b1-accent-soft text-b1-accent rounded-sm font-bold">
        {part.text}
      </mark>
    ) : (
      part.text
    )
  );

/**
 * 설교 목록 — 검색·시리즈 칩·정렬과 설교 줄. 서버가 실어 보낸 목록을 화면에서 거르므로 바로 바뀐다.
 * 처음 12편만 그리고 «설교 더보기» 를 누를 때마다 12편씩 더 그린다. 조건과 보인 편수는 화면 밖에 둔다(useSermonListState) —
 * 설교를 보고 돌아와도 그대로다. 줄을 누르면 그 설교 페이지로 넘어가 바로 재생된다.
 */
export const SermonList = ({ page, sermons, series }: Props) => {
  const { state, setQuery, showMore } = useSermonListState(page);
  const headId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const q = state.q.trim();
  // 편수는 조건에 맞는 전체, 그리는 줄은 첫 화면에서 최신 설교를 뺀 것(위에 크게 보인다 — listRows)
  const count = useMemo(() => filterSermons(sermons, state).length, [sermons, state]);
  const rows = useMemo(() => listRows(sermons, state), [sermons, state]);

  // «설교 더보기» 를 누르면 버튼이 아래로 밀려난다 — 키보드 포커스를 새로 나온 첫 설교로 옮긴다(화면은 움직이지 않는다)
  const focusRow = useRef<number | null>(null);
  useEffect(() => {
    if (focusRow.current === null) return;
    const row = listRef.current?.querySelectorAll<HTMLElement>('a')[focusRow.current];
    focusRow.current = null;
    row?.focus({ preventScroll: true });
  }, [state.shown]);

  return (
    <section
      aria-labelledby={headId}
      className="border-b1-border mt-9 border-t pt-7 md:mt-14 md:pt-10"
    >
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,320px)] md:items-center">
        <h2 id={headId} className="text-b1-text text-h3 font-bold tracking-[-0.02em]">
          설교 목록
        </h2>
        {/* 치는 대로 걸러지므로 검색 버튼은 두지 않는다. 자판의 «검색»(엔터)은 자판을 내려 결과를 보이게 한다 */}
        <form
          role="search"
          onSubmit={e => {
            e.preventDefault();
            inputRef.current?.blur();
          }}
        >
          <label className="relative block">
            <span className="sr-only">설교 검색</span>
            <Search
              aria-hidden
              className="text-b1-muted pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2"
            />
            <input
              ref={inputRef}
              type="search"
              value={state.q}
              onChange={e => setQuery({ q: e.target.value })}
              placeholder="제목·본문 검색"
              autoComplete="off"
              enterKeyHint="search"
              // 입력칸 글씨는 16px(text-body) — 더 작으면 아이폰이 입력할 때 화면을 확대한다(DESIGN.md §7)
              className={cn(
                'border-b1-border bg-b1-surface text-b1-text text-body placeholder:text-b1-sub focus-visible:border-b1-accent h-12 w-full rounded-xl border pr-3.5 pl-[42px]',
                FOCUS
              )}
            />
          </label>
        </form>
      </div>

      <SeriesChips
        series={series}
        value={state.series}
        onChange={name => setQuery({ series: name })}
      />

      <div className="text-b1-sub text-body-sm mt-2.5 mb-3.5 flex items-center justify-between gap-2.5 lg:mt-3.5 lg:mb-[18px]">
        <p className="min-w-0 wrap-anywhere">
          {q && `"${q}" `}
          {state.series ? `${state.series} ` : !q && '전체 '}
          <b className="text-b1-text">{count}편</b>
        </p>
        <div
          role="group"
          aria-label="정렬"
          className="border-b1-border bg-b1-surface flex shrink-0 rounded-lg border"
        >
          {SORTS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={state.sort === value}
              onClick={() => setQuery({ sort: value })}
              className={cn(
                'text-caption h-9 px-2.5',
                HIT_36,
                FOCUS,
                'first:rounded-l-md last:rounded-r-md',
                state.sort === value ? 'bg-b1-text text-b1-surface font-bold' : 'text-b1-sub'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {rows.length > 0 ? (
        <ul
          ref={listRef}
          className="m-0 grid list-none gap-4 p-0 md:grid-cols-2 md:gap-5 lg:gap-x-8 lg:gap-y-6"
        >
          {rows.slice(0, state.shown).map(v => (
            <li key={v.id}>
              <Link
                href={sermonPath(page, v.id)}
                // 화면에 보이는 줄마다 설교 페이지를 미리 받지 않는다 — 설교 페이지에는 목록 전체가 실려 있어
                // 줄 수만큼 내려받고, 서버도 그만큼 페이지를 만든다
                prefetch={false}
                onClick={e => {
                  if (!isPlainClick(e)) return; // 새 탭으로 여는 클릭 — 이 탭은 그대로다
                  requestPlay(v.id);
                  rememberListScroll(page, window.scrollY); // «목록» 으로 돌아올 자리
                }}
                className={cn(
                  // 태블릿은 2칸이라 글 칸이 좁다 — 썸네일을 덜 키운다(144px), PC 부터 176px
                  'grid w-full grid-cols-[128px_minmax(0,1fr)] items-start gap-3 rounded-xl text-left md:grid-cols-[144px_minmax(0,1fr)] md:gap-4 lg:grid-cols-[176px_minmax(0,1fr)]',
                  FOCUS
                )}
              >
                <SermonThumb
                  src={v.thumbnail}
                  sizes="(min-width: 1024px) 176px, (min-width: 768px) 144px, 128px"
                />
                <span className="grid min-w-0 gap-0.5">
                  <span className="text-b1-accent text-caption font-bold">
                    {sermonTag(v)} · {dateLabel(v)}
                  </span>
                  <b className="text-b1-text text-body-sm line-clamp-2 leading-snug font-bold">
                    <Highlight text={v.title} q={q} />
                  </b>
                  {v.passage && (
                    <small className="text-b1-sub text-caption">
                      <Highlight text={v.passage} q={q} />
                    </small>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        // 조건에 맞는 설교가 없을 때만 — 설교가 한 편뿐이면 그 한 편은 위 «최신 설교» 에 있어 줄이 비는 것이다
        count === 0 && <p className="text-b1-sub py-10 text-center">검색 결과가 없습니다.</p>
      )}

      {state.shown < rows.length && (
        <div className="mt-7 flex justify-center md:mt-9">
          <button
            type="button"
            onClick={() => {
              focusRow.current = state.shown;
              showMore();
            }}
            className={cn(
              OUTLINE_BTN,
              FOCUS,
              'text-body-sm min-h-12 w-full px-[22px] md:w-auto md:min-w-[260px]'
            )}
          >
            설교 더보기
            <ChevronDown aria-hidden className="size-4" />
          </button>
        </div>
      )}
      {/* 화면낭독기용 — 조건이 바뀌거나 더 그려질 때마다 몇 편이 보이는지 알린다 */}
      <p role="status" className="sr-only">
        {count}편 중 {Math.min(state.shown, rows.length)}편 표시
      </p>
    </section>
  );
};
