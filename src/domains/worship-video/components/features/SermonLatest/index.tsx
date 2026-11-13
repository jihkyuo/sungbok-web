'use client';

import { requestPlay } from '@/domains/worship-video/api/playIntent';
import { dateLabel, weekdayLabel } from '@/domains/worship-video/api/sermonList';
import { rememberListScroll } from '@/domains/worship-video/api/sermonListState';
import type { Sermon } from '@/domains/worship-video/api/worshipVideo.types';
import { FOCUS } from '@/domains/worship-video/components/features/sermonStyles';
import { sermonPath, type WorshipPage } from '@/domains/worship-video/config/worshipPages';
import { isPlainClick } from '@/shared/lib/isPlainClick';
import { cn } from '@/shared/lib/utils';
import { ArrowRight, Play } from 'lucide-react';
import { YoutubeThumb } from '@/shared/components/features/YoutubeThumb';
import Link from 'next/link';
import { useId, type MouseEvent } from 'react';

interface Props {
  page: WorshipPage;
  /** 가장 최근 설교 */
  sermon: Sermon;
}

/**
 * 최신 설교 — 목록 페이지 맨 위에 한 편만 크게. 표지(왼쪽)와 정보(오른쪽), 휴대폰은 표지 아래로 정보가 쌓이고
 * 시청 버튼이 화면 폭을 채운다. 누르면 그 설교 페이지로 넘어가 바로 재생된다(requestPlay).
 */
export const SermonLatest = ({ page, sermon }: Props) => {
  const headId = useId();
  const href = sermonPath(page, sermon.id);
  const play = (e: MouseEvent) => {
    if (!isPlainClick(e)) return; // 새 탭으로 여는 클릭 — 이 탭은 그대로다
    requestPlay(sermon.id);
    rememberListScroll(page, window.scrollY); // «목록» 으로 돌아올 자리
  };
  const day = weekdayLabel(sermon.date);

  return (
    <section
      aria-labelledby={headId}
      className="flex flex-col md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-center md:gap-[26px] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-[clamp(28px,4vw,64px)]"
    >
      {/* 표지 — 아래 «설교 시청하기» 와 같은 곳으로 간다. 같은 링크를 두 번 읽고 두 번 거치지 않게 표지는 마우스·터치 전용 */}
      <Link
        href={href}
        onClick={play}
        tabIndex={-1}
        aria-hidden
        className="group bg-b1-placeholder relative block aspect-video overflow-hidden rounded-xl shadow-md md:rounded-2xl"
      >
        <YoutubeThumb
          src={sermon.poster}
          alt=""
          fill
          preload
          sizes="(min-width: 1024px) 55vw, (min-width: 768px) 48vw, 88vw"
          className="duration-slow ease-standard object-cover transition-transform group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <span className="bg-b1-surface/95 text-b1-accent group-hover:bg-b1-surface duration-fast absolute top-1/2 left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full shadow-md transition-colors md:size-[68px]">
          <Play className="ml-1 size-5 fill-current md:size-6" />
        </span>
      </Link>

      <div className="min-w-0 pt-5 md:py-3">
        <div className="flex items-center justify-between gap-2.5 md:flex-col md:items-start md:gap-4 lg:gap-5">
          <p className="text-b1-accent text-caption flex items-center gap-2 font-bold">
            <span aria-hidden className="size-[7px] rounded-full bg-current" />
            최신 설교
          </p>
          <p className="text-b1-sub text-caption tabular-nums">
            {dateLabel(sermon)}
            {day && ` · ${day}`}
          </p>
        </div>
        <h2
          id={headId}
          className="text-b1-text text-h2 mt-3 tracking-[-0.02em] text-balance md:mt-2"
        >
          {sermon.title}
        </h2>
        {(sermon.passage || sermon.preacher) && (
          <dl className="text-b1-text text-body-sm mt-4 grid gap-2 lg:mt-[22px]">
            {sermon.passage && (
              <div className="flex items-baseline gap-3.5">
                <dt className="text-b1-sub text-caption w-[30px] shrink-0">본문</dt>
                <dd>{sermon.passage}</dd>
              </div>
            )}
            {sermon.preacher && (
              <div className="flex items-baseline gap-3.5">
                <dt className="text-b1-sub text-caption w-[30px] shrink-0">설교</dt>
                <dd>{sermon.preacher}</dd>
              </div>
            )}
          </dl>
        )}
        <Link
          href={href}
          onClick={play}
          className={cn(
            'bg-b1-accent text-b1-surface text-body-sm hover:bg-b1-accent/90 duration-fast mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-md px-[22px] font-bold transition-colors md:w-auto lg:mt-7',
            FOCUS
          )}
        >
          <Play aria-hidden className="size-3.5 fill-current" />
          설교 시청하기
          <ArrowRight aria-hidden className="size-[17px]" />
        </Link>
      </div>
    </section>
  );
};
