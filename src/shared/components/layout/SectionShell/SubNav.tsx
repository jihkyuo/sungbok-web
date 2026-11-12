'use client';

import { FOCUS_RING } from '@/shared/components/ui/focusRing';
import { childHref, type NavChild, type NavSection } from '@/shared/config/siteNav';
import { usePrefersReducedMotion } from '@/shared/lib/hooks/usePrefersReducedMotion';
import { cn } from '@/shared/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

interface Props {
  section: NavSection;
  subs: readonly NavChild[];
  activeSlug?: string;
}

/**
 * 서브페이지 형제 알약 줄 — 2026-11-12 머리 시안 A+ 확정.
 * - lg(1024) 이상: 예전 그대로 여러 줄 알약, 활성 알약이 직접 파란 배경.
 * - lg 미만: 한 줄 가로 스크롤(손가락으로 밀 수 있음). 활성 표시는 알약 뒤의 파란 배경 하나(인디케이터)가
 *   형제 페이지로 옮길 때 옆으로 미끄러진다 — SectionShell 은 섹션 layout 에 있어 형제 이동에서 다시 마운트되지 않는다.
 *   선택된 알약은 줄 가운데로 스크롤한다.
 * - md(768) 미만: 줄 양옆에 이전·다음 꺾쇠. 누르면 바로 옆 형제 페이지로 간다(줄을 미는 버튼이 아니다).
 *   첫 메뉴엔 다음만, 마지막 메뉴엔 이전만. 태블릿은 알약이 한 줄에 다 보여 꺾쇠를 두지 않는다.
 * 인디케이터는 JS 가 자리를 잡은 뒤(data-ind=on)에만 보이고, 그 전(서버 HTML·JS 없음)엔 활성 알약이 직접 파란 배경을 칠한다.
 * «동작 줄이기»면 미끄러짐·부드러운 스크롤 없이 바로 바뀐다(DESIGN.md §3).
 */
export const SubNav = ({ section, subs, activeSlug }: Props) => {
  const rowRef = useRef<HTMLElement>(null);
  const indRef = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);
  const reduced = usePrefersReducedMotion();

  const idx = subs.findIndex(c => c.slug === activeSlug);
  const prev = idx > 0 ? subs[idx - 1] : undefined;
  const next = idx >= 0 && idx < subs.length - 1 ? subs[idx + 1] : undefined;

  useEffect(() => {
    const row = rowRef.current;
    const ind = indRef.current;
    if (!row || !ind) return;

    const place = (animate: boolean) => {
      const a = row.querySelector<HTMLElement>('[aria-current="page"]');
      if (!a) {
        delete row.dataset.ind;
        return;
      }
      // 처음 자리 잡을 때·창 크기 변화는 순간 이동, 형제 이동만 미끄러진다
      if (!animate) ind.style.transition = 'none';
      ind.style.width = `${a.offsetWidth}px`;
      ind.style.height = `${a.offsetHeight}px`;
      ind.style.transform = `translate(${a.offsetLeft}px, ${a.offsetTop}px)`;
      if (!animate) {
        void ind.offsetWidth; // 위 값을 transition 없이 확정시킨 뒤 transition 을 되돌린다
        ind.style.transition = '';
      }
      row.dataset.ind = 'on';
      // 선택된 알약을 줄 가운데로 — 한 줄일 때만 의미가 있고, lg 이상(여러 줄)은 넘칠 게 없어 그대로다
      row.scrollTo?.({
        left: a.offsetLeft - (row.clientWidth - a.offsetWidth) / 2,
        behavior: animate && !reduced ? 'smooth' : 'auto',
      });
    };

    place(placed.current && !reduced);
    placed.current = true;

    if (typeof ResizeObserver === 'undefined') return;
    // observe 직후의 첫 콜백까지 받으면 방금 시작한 미끄러짐이 끊긴다 — 폭이 실제로 바뀔 때만 다시 잡는다
    let width = row.clientWidth;
    const ro = new ResizeObserver(() => {
      if (row.clientWidth === width) return;
      width = row.clientWidth;
      place(false);
    });
    ro.observe(row);
    return () => ro.disconnect();
  }, [activeSlug, reduced]);

  const chevron = (c: NavChild, dir: 'prev' | 'next') => (
    <Link
      href={childHref(section, c)}
      aria-label={`${dir === 'prev' ? '이전' : '다음'} 메뉴: ${c.label}`}
      className={cn(
        'text-b1-sub hover:text-b1-accent grid h-[38px] w-[30px] shrink-0 place-items-center rounded-lg transition-colors md:hidden',
        FOCUS_RING
      )}
    >
      {dir === 'prev' ? (
        <ChevronLeft aria-hidden className="size-[18px]" strokeWidth={2.2} />
      ) : (
        <ChevronRight aria-hidden className="size-[18px]" strokeWidth={2.2} />
      )}
    </Link>
  );

  return (
    <div className="-mx-2 mt-3.5 flex items-center gap-0.5 md:mx-0 md:mt-[18px] lg:mt-8 lg:block">
      {prev && chevron(prev, 'prev')}
      <nav
        ref={rowRef}
        aria-label={`${section.label} 하위 메뉴`}
        className={cn(
          'relative flex min-w-0 flex-1 gap-1',
          // lg 미만: 한 줄 가로 스크롤(스크롤바 숨김). 활성 알약 그림자가 잘리지 않게 아래 여백을 두고 같은 만큼 당긴다
          '-mb-4 [scrollbar-width:none] flex-nowrap overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden',
          'lg:mb-0 lg:flex-wrap lg:gap-1.5 lg:overflow-visible lg:pb-0'
        )}
      >
        {/* 미끄러지는 활성 배경 — 위치·크기는 바깥 span(인라인 transform), 첫 등장 애니메이션은 안쪽 span 이 맡는다(transform 충돌 방지) */}
        <span
          ref={indRef}
          aria-hidden
          className={cn(
            'pointer-events-none absolute top-0 left-0 opacity-0 lg:hidden',
            '[[data-ind=on]>&]:opacity-100',
            'transition-[transform,width] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none'
          )}
        >
          <span
            className="ss-in-pill bg-b1-accent block size-full rounded-full shadow-[0_6px_14px_-4px_rgba(37,99,235,0.45)]" /* design-lint-ignore: 활성 알약 accent 그림자(DockNav 와 동일 값) */
            style={{ animationDelay: `${300 + Math.max(idx, 0) * 50}ms` }}
          />
        </span>
        {subs.map((c, i) => {
          const active = c.slug === activeSlug;
          return (
            <Link
              key={c.slug}
              href={childHref(section, c)}
              aria-current={active ? 'page' : undefined}
              style={{ animationDelay: `${300 + i * 50}ms` }}
              className={cn(
                'ss-in-pill relative inline-flex shrink-0 items-center rounded-full font-semibold whitespace-nowrap transition-colors duration-300',
                'text-label lg:text-body-sm min-h-[38px] px-3.5 py-1.5 lg:min-h-11 lg:px-4 lg:py-2',
                active
                  ? cn(
                      'bg-b1-accent text-white shadow-[0_6px_14px_-4px_rgba(37,99,235,0.45)]' /* design-lint-ignore: 활성 알약 accent 그림자(DockNav 와 동일 값) */,
                      // 인디케이터가 자리 잡으면(lg 미만) 알약 자체 배경은 비우고 인디케이터 위 글자만 남긴다
                      'max-lg:[[data-ind=on]_&]:bg-transparent max-lg:[[data-ind=on]_&]:shadow-none'
                    )
                  : 'text-b1-sub hover:bg-b1-accent-soft hover:text-b1-text'
              )}
            >
              {c.label}
            </Link>
          );
        })}
      </nav>
      {next && chevron(next, 'next')}
    </div>
  );
};
