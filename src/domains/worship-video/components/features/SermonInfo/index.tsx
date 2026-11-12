'use client';

import { dateLabel, sermonTag } from '@/domains/worship-video/api/sermonList';
import { useSermonDescription } from '@/domains/worship-video/api/useSermonLibrary';
import type { Sermon } from '@/domains/worship-video/api/worshipVideo.types';
import { FOCUS, HIT_34, PILL } from '@/domains/worship-video/components/features/sermonStyles';
import type { WorshipPage } from '@/domains/worship-video/config/worshipPages';
import { cn } from '@/shared/lib/utils';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { useId, useState, type Ref } from 'react';

interface Props {
  page: WorshipPage;
  sermon: Sermon;
  /** 같은 시리즈의 이전(오래된)·다음(최신) 편 — 단편 설교는 둘 다 없다 */
  older?: Sermon;
  newer?: Sermon;
  onPick: (videoId: string) => void;
  /** 제목 — 목록에서 영상을 고른 뒤 포커스를 여기로 옮긴다(SermonPage) */
  titleRef?: Ref<HTMLHeadingElement>;
  /** 설교 시트지 파일 주소. 관리자에서 올린 것이 있을 때만 카드를 보인다(지금은 올리는 곳이 없어 늘 비어 있다) */
  sheetHref?: string;
}

// 설명이 이보다 길면 접어 두고 «더보기» 를 둔다 — 3줄(line-clamp-3)을 넘길 만한 길이
const FOLD_LINES = 3;
const FOLD_CHARS = 100;

/** 유튜브 설명란 — 날짜 줄 + 본문 3줄, «더보기» 로 펼친다(유튜브 영상 아래 설명과 같은 방식). */
const Description = ({ page, sermon }: Pick<Props, 'page' | 'sermon'>) => {
  const { data: body, isPending, isError, refetch } = useSermonDescription(page, sermon.id);
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const lines = body ? body.split('\n') : [];
  const foldable = lines.length > FOLD_LINES || (body?.length ?? 0) > FOLD_CHARS;

  return (
    // 접혀 있을 땐 상자 어디를 눌러도 펼친다(마우스·터치). 키보드·화면낭독기는 아래 버튼으로.
    <div
      onClick={foldable && !open ? () => setOpen(true) : undefined}
      className={cn(
        'bg-b1-placeholder text-b1-text text-body-sm rounded-xl px-3.5 py-3',
        foldable && !open && 'cursor-pointer'
      )}
    >
      <p className="text-caption font-bold tabular-nums">{dateLabel(sermon)}</p>
      {isPending ? (
        // 받는 동안에도 접힌 설명란과 같은 높이(3줄 + «더보기» 줄)를 잡아 둔다 — 받은 뒤 아래 목록이 밀리지 않게
        <div aria-hidden className="whitespace-pre-line">
          {'\n\n\n'}
          <span className="text-caption mt-1 inline-block font-bold">&nbsp;</span>
        </div>
      ) : (
        lines.length > 0 && (
          <div
            id={bodyId}
            className={cn('whitespace-pre-line', foldable && !open && 'line-clamp-3')}
          >
            {lines.map((line, i) => (
              // 해시태그 줄은 색으로만 구분한다(링크 아님)
              <span key={i} className={cn(line.startsWith('#') && 'text-b1-accent')}>
                {line}
                {i < lines.length - 1 && '\n'}
              </span>
            ))}
          </div>
        )
      )}
      {isError && body === undefined && (
        // 설명을 못 받았으면(쿼터 소진 등) «설명 없음» 처럼 보이지 않게 알리고 다시 받을 수 있게 한다
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          설명을 불러오지 못했습니다.
          <button
            type="button"
            onClick={() => refetch()}
            className={cn(
              "text-b1-accent relative rounded underline underline-offset-4 before:absolute before:-inset-x-2 before:-inset-y-3 before:content-['']",
              FOCUS
            )}
          >
            다시 시도
          </button>
        </p>
      )}
      {foldable && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={e => {
            e.stopPropagation(); // 상자의 펼치기와 겹쳐 두 번 바뀌지 않게
            setOpen(o => !o);
          }}
          // 글자 링크 모양, 누르는 영역만 가상 영역으로 44px 까지 넓힌다
          className={cn(
            "text-caption relative mt-1 rounded font-bold before:absolute before:-inset-x-3 before:-inset-y-3 before:content-['']",
            FOCUS
          )}
        >
          {open ? '간략히' : '…더보기'}
        </button>
      )}
    </div>
  );
};

/**
 * 지금 영상의 제목·분류·이전/다음 편·설명란. 영상이 바뀌어도 이 부품은 그대로 남는다 — 이전/다음 편 버튼이
 * 다시 만들어지면 누른 버튼이 사라져 키보드 포커스가 문서 맨 위로 튄다. 설명란만 영상마다 새로 만든다(다시 접힌다).
 */
export const SermonInfo = ({ page, sermon, older, newer, onPick, titleRef, sheetHref }: Props) => (
  <div className="mt-3.5 grid min-w-0 gap-3">
    <h2
      ref={titleRef}
      tabIndex={-1}
      // 포커스는 코드로만 온다(목록에서 고른 뒤) — 화면낭독기가 새 제목을 읽고, 다음 Tab 이 여기서 이어진다
      className="text-b1-text text-h3 font-bold tracking-[-0.02em] text-balance outline-none"
    >
      {sermon.title}
    </h2>

    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="bg-b1-accent-soft text-b1-accent text-caption rounded-full px-2.5 py-0.5 font-bold">
        {sermonTag(sermon)}
      </span>
      {sermon.no !== undefined && (
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={!older}
            onClick={() => older && onPick(older.id)}
            aria-label={older ? `이전 편: ${older.no}편` : '이전 편 없음(첫 편)'}
            className={cn(PILL, HIT_34, FOCUS, 'text-b1-text font-semibold disabled:opacity-40')}
          >
            <ChevronLeft aria-hidden className="-ml-1 size-4" />
            {older ? `${older.no}편` : '첫 편'}
          </button>
          <button
            type="button"
            disabled={!newer}
            onClick={() => newer && onPick(newer.id)}
            aria-label={newer ? `다음 편: ${newer.no}편` : '다음 편 없음(최신 편)'}
            className={cn(PILL, HIT_34, FOCUS, 'text-b1-text font-semibold disabled:opacity-40')}
          >
            {newer ? `${newer.no}편` : '최신 편'}
            <ChevronRight aria-hidden className="-mr-1 size-4" />
          </button>
        </div>
      )}
    </div>

    <Description key={sermon.id} page={page} sermon={sermon} />

    {sheetHref && (
      <a
        href={sheetHref}
        className={cn(
          'border-b1-border bg-b1-surface grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border px-3 py-2.5',
          FOCUS
        )}
      >
        <span className="bg-b1-accent-soft text-b1-accent grid size-11 place-items-center rounded-lg">
          <FileText aria-hidden className="size-5" />
        </span>
        <span className="min-w-0">
          <b className="text-b1-text text-label block font-bold">설교 시트지</b>
          <small className="text-b1-sub text-caption block">{sermonTag(sermon)}</small>
        </span>
        <span className="text-b1-accent text-caption font-bold">보기</span>
      </a>
    )}
  </div>
);
