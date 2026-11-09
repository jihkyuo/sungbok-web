'use client';

import { pageCount } from '@/shared/components/features/Pagination/clampPage';
import { PageNumbers } from '@/shared/components/features/Pagination/PageNumbers';
import * as OriginPagination from '@/shared/components/ui/pagination';
import { useLayoutEffect, useRef } from 'react';

const DEFAULT_PAGE_SIZE = 5;

export interface PaginationProps {
  total: number;
  /** usePageState 가 범위 안으로 맞춘 쪽 번호를 넘긴다 — 범위 규칙은 그쪽 한 곳에만 둔다. */
  currentPage: number;
  pageSize?: number;
  onChange: (page: number) => void;
  className?: string;
}

/**
 * 쪽 번호 표시·이동 버튼. 상태는 갖지 않는다 — 목록 주인이 usePageState 로 쪽 번호를 쥐고 넘긴다.
 * 이동은 사용자가 누를 때만 알린다(스스로 onChange 를 부르지 않는다). 한 페이지뿐이면 그리지 않는다.
 */
export const Pagination = ({
  total,
  currentPage: page,
  pageSize = DEFAULT_PAGE_SIZE,
  onChange,
  className,
}: PaginationProps) => {
  const totalPageCount = pageCount(total, pageSize);
  const isFirst = page <= 1;
  const isLast = page >= totalPageCount;

  const navRef = useRef<HTMLElement>(null);
  // 사용자가 고른 이동과, 그때 포커스를 쥐고 있던 페이지 줄 안의 버튼(없으면 null — Safari 마우스 클릭 등).
  // 부모가 무시한 요청이 남아 나중에 엉뚱하게 처리되지 않게 1초가 지나면 버린다(전환·비동기 반영은 그 안에 온다).
  const pending = useRef<{ to: number; pressed: HTMLElement | null; at: number } | null>(null);

  // 화면낭독기 안내(role=status) — 사용자가 넘긴 이동이 실제로 반영된 커밋에서만 쓴다(아래 효과에서 DOM 에 직접).
  // 처음 렌더·데이터 갱신(전체 쪽 수 변화, 목록이 줄어 저절로 당겨짐)·부모가 무시한 이동은 조용하다.
  const statusRef = useRef<HTMLParagraphElement>(null);

  const go = (to: number) => {
    if (to === page) return; // 지금 쪽을 다시 누름 — 아무 일도 하지 않는다
    const nav = navRef.current;
    const active = document.activeElement;
    pending.current = {
      to,
      pressed: nav && active instanceof HTMLElement && nav.contains(active) ? active : null,
      at: Date.now(),
    };
    onChange(to);
  };

  // 부모가 그 쪽을 반영한 커밋에서(전환·비동기로 늦어도) 누른 버튼이 사라졌으면(건너뛰기 뒤 생략부호가 빠지는 등)
  // 포커스가 문서 맨 위로 튄다 — 그때만 새 쪽 번호로 옮긴다. preventScroll: 목록 위로 올려 준 위치를 되돌리지 않게.
  useLayoutEffect(() => {
    const p = pending.current;
    if (!p) return;
    if (Date.now() - p.at > 1000) {
      pending.current = null; // 오래된(무시된) 요청
      return;
    }
    if (p.to !== page) return;
    pending.current = null;
    if (statusRef.current) {
      statusRef.current.textContent = `전체 ${totalPageCount}페이지 중 ${page}페이지`;
    }
    if (p.pressed && !p.pressed.isConnected) {
      navRef.current
        ?.querySelector<HTMLElement>('[aria-current="page"]')
        ?.focus({ preventScroll: true });
    }
  });

  if (totalPageCount <= 1) return null;

  return (
    <OriginPagination.Pagination ref={navRef} className={className}>
      {/* 이전·다음은 양 끝에 고정, 쪽 번호만 좁은 화면에서 줄을 넘긴다 — 줄 수가 바뀌어도 화살표 자리가 그대로 */}
      <div className="flex items-center justify-center gap-1">
        {/* disabled 대신 aria-disabled — 키보드로 끝에 닿아도 포커스가 버튼에 남는다(무시는 부품이 한다) */}
        <OriginPagination.PaginationPrevious onClick={() => go(page - 1)} aria-disabled={isFirst} />
        <OriginPagination.PaginationContent className="min-w-0">
          <PageNumbers totalPageCount={totalPageCount} page={page} navToPage={go} />
        </OriginPagination.PaginationContent>
        <OriginPagination.PaginationNext onClick={() => go(page + 1)} aria-disabled={isLast} />
      </div>
      <p ref={statusRef} role="status" className="sr-only" />
    </OriginPagination.Pagination>
  );
};
