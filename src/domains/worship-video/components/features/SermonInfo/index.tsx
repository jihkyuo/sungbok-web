'use client';

import {
  requestPlay,
  requestStepFocus,
  takeStepFocus,
} from '@/domains/worship-video/api/playIntent';
import { dateLabel, sermonTag } from '@/domains/worship-video/api/sermonList';
import { markListReturn } from '@/domains/worship-video/api/sermonListState';
import { useSermonDescription } from '@/domains/worship-video/api/useSermonLibrary';
import type { Sermon } from '@/domains/worship-video/api/worshipVideo.types';
import {
  FOCUS,
  HIT_34,
  OUTLINE_BTN,
  PILL,
} from '@/domains/worship-video/components/features/sermonStyles';
import { sermonPath, type WorshipPage } from '@/domains/worship-video/config/worshipPages';
import { YoutubeIcon } from '@/shared/components/brand/YoutubeIcon';
import { useCopyLink } from '@/shared/lib/hooks/useCopyLink';
import { isPlainClick } from '@/shared/lib/isPlainClick';
import { cn } from '@/shared/lib/utils';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Link as LinkIcon,
  List,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useRef, useState, type Ref } from 'react';

interface Props {
  page: WorshipPage;
  sermon: Sermon;
  /** 이전(오래된)·다음(최신) 편 — 설교 목록에 보이는 순서(시리즈는 회차, 단편 설교는 날짜). 끝이면 없다 */
  older?: Sermon;
  newer?: Sermon;
  /** 이전 · 목록 · 다음 묶음 — 부르는 쪽이 화면 위치를 맞출 때 잰다 */
  navRef?: Ref<HTMLElement>;
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
            // 유튜브 원문 그대로라 끊을 수 없는 긴 주소가 올 수 있다 — 어디서든 줄을 바꿔 가로로 넘치지 않게
            className={cn('wrap-anywhere whitespace-pre-line', foldable && !open && 'line-clamp-3')}
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
            "text-caption relative mt-1 rounded font-bold before:absolute before:-inset-x-3 before:-inset-y-3.5 before:content-['']",
            FOCUS
          )}
        >
          {open ? '간략히' : '…더보기'}
        </button>
      )}
    </div>
  );
};

// 이전·다음 — 시리즈는 회차 번호로(«64편»), 단편 설교는 «이전»·«다음» 으로 적는다. 끝이면 흐리게만 둔다(누를 수 없다).
const Step = ({
  page,
  sermon,
  to,
  dir,
}: Pick<Props, 'page' | 'sermon'> & { to?: Sermon; dir: 'older' | 'newer' }) => {
  const numbered = sermon.no !== undefined;
  const word = dir === 'older' ? '이전' : '다음';
  const label = to
    ? to.no !== undefined
      ? `${to.no}편`
      : word
    : numbered
      ? dir === 'older'
        ? '첫 편'
        : '최신 편'
      : word;
  const body = (
    <>
      {dir === 'older' && <ChevronLeft aria-hidden className="-ml-1 size-4" />}
      {label}
      {dir === 'newer' && <ChevronRight aria-hidden className="-mr-1 size-4" />}
    </>
  );
  const shape = cn(PILL, HIT_34, 'text-b1-text gap-0.5 px-2.5 font-semibold md:gap-1 md:px-3');
  if (!to) {
    return (
      <span aria-disabled="true" className={cn(shape, 'opacity-40')}>
        {body}
      </span>
    );
  }
  return (
    <Link
      href={sermonPath(page, to.id)}
      data-step={dir}
      onClick={e => {
        if (!isPlainClick(e)) return; // 새 탭으로 여는 클릭 — 이 탭은 그대로다
        requestPlay(to.id);
        requestStepFocus(dir);
      }}
      aria-label={`${word} ${to.no !== undefined ? `편: ${to.no}편` : `설교: ${to.title}`}`}
      className={cn(shape, FOCUS, 'hover:border-b1-accent-soft hover:bg-b1-accent-soft')}
    >
      {body}
    </Link>
  );
};

/** 링크 복사 · 유튜브에서 보기 — 같은 두 동작을 자리에 따라 다른 모양으로 그린다(className 이 모양을 정한다). */
const Actions = ({
  sermon,
  onCopy,
  className,
  itemClassName,
}: Pick<Props, 'sermon'> & { onCopy: () => void; className: string; itemClassName: string }) => (
  <div className={className}>
    <button type="button" onClick={onCopy} className={cn(itemClassName, FOCUS)}>
      <LinkIcon aria-hidden className="size-[15px]" />
      링크 복사
    </button>
    <a
      href={`https://www.youtube.com/watch?v=${encodeURIComponent(sermon.id)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(itemClassName, FOCUS)}
    >
      <YoutubeIcon size={16} />
      유튜브에서 보기
      <ArrowUpRight aria-hidden className="size-3.5" />
      <span className="sr-only">(새 창)</span>
    </a>
  </div>
);

/**
 * 지금 영상의 제목·분류·이동(이전 · 목록 · 다음)·설명란·시트지·공유.
 * 링크 복사·유튜브에서 보기는 휴대폰에서는 설명·시트지 아래의 두 칸짜리 버튼, 태블릿부터는 분류 표시 옆의 작은 알약이다.
 */
export const SermonInfo = ({ page, sermon, older, newer, navRef, sheetHref }: Props) => {
  const { message, copy } = useCopyLink();
  // «이전»·«다음» 으로 넘어오면 설교 페이지가 새로 만들어져 누른 링크가 사라지고, 키보드 포커스가 문서 맨 위로 튄다.
  // 누른 쪽(playIntent 에 남겨 둔다)의 링크에 포커스를 되돌려 놓는다 — 이어서 넘길 수 있게. 그쪽이 끝 편이라
  // 링크가 없으면 바로 옆 «목록» 으로. 화면은 움직이지 않는다.
  const listLinkRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const dir = takeStepFocus();
    const list = listLinkRef.current;
    if (!dir || !list) return;
    const same = list.parentElement?.querySelector<HTMLElement>(`a[data-step="${dir}"]`);
    (same ?? list).focus({ preventScroll: true });
  }, []);
  return (
    <div className="mt-3.5 grid min-w-0 gap-3">
      <h2 className="text-b1-text text-h3 font-bold tracking-[-0.02em] text-balance">
        {sermon.title}
      </h2>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-2.5">
        <span className="bg-b1-accent-soft text-b1-accent text-caption rounded-full px-2.5 py-0.5 font-bold">
          {sermonTag(sermon)}
        </span>
        <Actions
          sermon={sermon}
          onCopy={copy}
          className="hidden gap-1.5 md:flex"
          itemClassName={cn(
            PILL,
            HIT_34,
            'text-b1-text hover:border-b1-accent-soft hover:bg-b1-accent-soft gap-1.5 font-semibold'
          )}
        />
        {/* 분류 표시와 같은 줄 오른쪽 — 자리가 모자라면(긴 분류 이름·좁은 화면) 다음 줄 오른쪽으로 내려간다 */}
        <nav ref={navRef} aria-label="설교 이동" className="ml-auto flex gap-1 md:gap-1.5">
          <Step page={page} sermon={sermon} to={older} dir="older" />
          <Link
            ref={listLinkRef}
            href={sermonPath(page)}
            // 목록의 보던 자리로 돌아간다 — 화면 위치는 목록 화면이 맞춘다(SermonListPage)
            scroll={false}
            onClick={e => {
              if (isPlainClick(e)) markListReturn(page); // 새 탭으로 열면 이 탭은 돌아가지 않는다
            }}
            className={cn(
              PILL,
              HIT_34,
              FOCUS,
              'text-b1-text hover:border-b1-accent-soft hover:bg-b1-accent-soft px-2.5 font-semibold md:px-3'
            )}
          >
            <List aria-hidden className="hidden size-3.5 md:block" />
            목록
          </Link>
          <Step page={page} sermon={sermon} to={newer} dir="newer" />
        </nav>
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

      <Actions
        sermon={sermon}
        onCopy={copy}
        className="grid grid-cols-2 gap-2 md:hidden"
        itemClassName={cn(OUTLINE_BTN, 'text-label min-h-11 gap-1.5 px-2.5 whitespace-nowrap')}
      />

      {/* 링크 복사 결과 — 알림 영역은 늘 두고 문구만 끼운다(화면낭독기가 변화를 읽는다) */}
      <div
        role="status"
        className="pointer-events-none fixed inset-x-4 bottom-6 z-50 flex justify-center"
      >
        {message && (
          <span className="bg-b1-text text-b1-surface text-body-sm rounded-lg px-5 py-3 text-center shadow-md">
            {message}
          </span>
        )}
      </div>
    </div>
  );
};
