'use client';

import {
  dateLabel,
  filterSermons,
  highlightParts,
  PAGE_STEP,
  sermonTag,
  type ListQuery,
} from '@/domains/worship-video/api/sermonList';
import type { Sermon, SermonSeries } from '@/domains/worship-video/api/worshipVideo.types';
import { FOCUS, HIT_36 } from '@/domains/worship-video/components/features/sermonStyles';
import { SermonThumb } from '@/domains/worship-video/components/features/SermonThumb';
import { useNearViewport } from '@/shared/lib/hooks/useNearViewport';
import { cn } from '@/shared/lib/utils';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Props {
  sermons: readonly Sermon[];
  series: readonly SermonSeries[];
  /** 플레이어에 떠 있는 설교 id */
  currentId: string;
  /** 그 설교가 재생 중인지(포스터 상태면 false) */
  playing: boolean;
  onPick: (videoId: string) => void;
}

// 입력칸 글씨는 16px(text-body) — 더 작으면 아이폰이 입력할 때 화면을 확대한다(DESIGN.md §7)
const FIELD =
  'border-b1-border bg-b1-surface text-b1-text text-body h-12 rounded-xl border focus-visible:border-b1-accent';

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
 * 목록 끝 표시 — 화면 가까이(아래 600px 안) 오면 다음 묶음을 부른다. 부르는 쪽이 묶음마다 key 를 바꿔 새로 만든다
 * (useNearViewport 는 한 번 true 가 되면 그대로라, 새로 만들어야 다음 묶음도 잡힌다).
 */
const LoadMore = ({ onNear }: { onNear: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearViewport(ref, '0px 0px 600px 0px');
  const fired = useRef(false); // 한 번만 — 부르는 쪽이 다시 그려져 onNear 가 새 함수가 돼도 또 부르지 않는다
  useEffect(() => {
    if (!near || fired.current) return;
    fired.current = true;
    onNear();
  }, [near, onNear]);

  return (
    <div ref={ref} aria-hidden className="mt-2 flex h-14 items-center justify-center gap-1.5">
      {[0, 150, 300].map(delay => (
        <span
          key={delay}
          style={{ animationDelay: `${delay}ms` }}
          // «동작 줄이기»면 깜빡이지 않고 그대로 보인다
          className="bg-b1-accent size-[7px] animate-pulse rounded-full motion-reduce:animate-none motion-reduce:opacity-60"
        />
      ))}
    </div>
  );
};

/**
 * 설교 찾기 — 시리즈 선택·검색·정렬과 전체 목록. 목록은 서버가 실어 보낸 것을 화면에서 거르므로 바로 바뀌고,
 * 처음 12편만 그린 뒤 끝에 닿을 때마다 12편씩 더 그린다(무한스크롤 — 다 그리면 아무것도 남기지 않는다).
 */
export const SermonSearchList = ({ sermons, series, currentId, playing, onPick }: Props) => {
  const [query, setQuery] = useState<ListQuery>({ q: '', series: '', sort: 'new' });
  const [shown, setShown] = useState(PAGE_STEP);
  const inputRef = useRef<HTMLInputElement>(null);
  const list = useMemo(() => filterSermons(sermons, query), [sermons, query]);

  // 조건이 바뀌면 처음 묶음부터 다시
  const change = (next: Partial<ListQuery>) => {
    setQuery(q => ({ ...q, ...next }));
    setShown(PAGE_STEP);
  };
  const q = query.q.trim();

  return (
    <section aria-label="설교 찾기" className="border-b1-border mt-9 border-t pt-6">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 md:grid-cols-[auto_minmax(0,360px)] md:justify-start">
        <label>
          <span className="sr-only">시리즈</span>
          <select
            value={query.series}
            onChange={e => change({ series: e.target.value })}
            className={cn(FIELD, FOCUS, 'max-w-[136px] px-2.5 md:max-w-[260px]')}
          >
            <option value="">전체 설교</option>
            {series.map(s => (
              <option key={s.name} value={s.name}>
                {s.name} ({s.count})
              </option>
            ))}
          </select>
        </label>
        {/* 치는 대로 걸러진다. 버튼(엔터)은 휴대폰 자판을 내려 결과를 보이게 한다 */}
        <form
          role="search"
          className="relative"
          onSubmit={e => {
            e.preventDefault();
            inputRef.current?.blur();
          }}
        >
          <label>
            <span className="sr-only">설교 검색</span>
            <input
              ref={inputRef}
              type="search"
              value={query.q}
              onChange={e => change({ q: e.target.value })}
              placeholder="제목·본문·회차로 찾기"
              autoComplete="off"
              enterKeyHint="search"
              className={cn(
                FIELD,
                FOCUS,
                'placeholder:text-b1-sub w-full pr-[54px] pl-3.5 [&::-webkit-search-cancel-button]:hidden'
              )}
            />
          </label>
          <button
            type="submit"
            aria-label="검색"
            className={cn(
              'bg-b1-accent text-b1-surface absolute top-0.5 right-0.5 grid size-11 place-items-center rounded-lg',
              FOCUS
            )}
          >
            <Search aria-hidden className="size-[18px]" strokeWidth={2.4} />
          </button>
        </form>
      </div>

      <div className="text-b1-sub text-body-sm mt-4 mb-3 flex items-center justify-between gap-2.5">
        <p>
          {q && `"${q}" `}
          <b className="text-b1-text">{list.length}편</b>
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
              aria-pressed={query.sort === value}
              onClick={() => change({ sort: value })}
              className={cn(
                'text-caption h-9 px-2.5',
                HIT_36,
                FOCUS,
                'first:rounded-l-md last:rounded-r-md',
                query.sort === value ? 'bg-b1-text text-b1-surface font-bold' : 'text-b1-sub'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {list.length > 0 ? (
        <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2 md:gap-5 lg:gap-x-8">
          {list.slice(0, shown).map(v => {
            const on = v.id === currentId;
            return (
              <li key={v.id}>
                <button
                  type="button"
                  aria-current={on ? 'true' : undefined}
                  onClick={() => onPick(v.id)}
                  className={cn(
                    'grid w-full grid-cols-[128px_minmax(0,1fr)] items-start gap-3 rounded-xl text-left md:grid-cols-[176px_minmax(0,1fr)] md:gap-4',
                    FOCUS
                  )}
                >
                  <SermonThumb
                    src={v.thumbnail}
                    current={on}
                    playing={playing}
                    sizes="(min-width: 768px) 176px, 128px"
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
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-b1-sub py-10 text-center">
          찾는 설교가 없습니다. 본문(예: 사도행전 12장)이나 제목의 낱말로 찾아보세요.
        </p>
      )}

      {shown < list.length && <LoadMore key={shown} onNear={() => setShown(n => n + PAGE_STEP)} />}
      {/* 화면낭독기용 — 더 그려질 때마다 몇 편이 보이는지 알린다(화면에는 문구를 두지 않는다) */}
      <p role="status" className="sr-only">
        {list.length}편 중 {Math.min(shown, list.length)}편 표시
      </p>
    </section>
  );
};
