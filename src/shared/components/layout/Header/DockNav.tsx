'use client';

import { HomeLogo } from '@/shared/components/layout/Header/HomeLogo';
import { SideMenu } from '@/shared/components/layout/Header/SideMenu';
import { childHref, findSection, sectionHref, sections } from '@/shared/config/siteNav';
import { cn } from '@/shared/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type FocusEvent, type MouseEvent } from 'react';

/**
 * DockNav — 상단 전폭 바 + 안개 패널 (시안 A 승격, 2026-10-18 · ADR 0005)
 *
 * 토스(toss.im) GNB 실측을 옮겼다: 바 64px·투명(최상단) → 스크롤하면 흰 반투명+blur, 항목 16px·비활성 opacity .5,
 * 패널 300ms 페이드, 행 40ms stagger, 아래쪽은 backdrop 블러가 아니라 흰 radial 안개 2겹(+blur 90px).
 * 토스와 다른 점(사용자 결정): 펼치면 hover한 메뉴의 하위 메뉴만 한 열로, 그 항목 바로 아래 x 위치에. 바는 스크롤해도 숨지 않는다.
 * 이전 글래스 캡슐 + 항목별 드롭다운 카드는 폐기. 메뉴·서브메뉴는 siteNav(단일 소스)에서 파생.
 * 터치(hover 없음)는 첫 탭으로 열고, 키보드 포커스로도 연다. 모바일은 SideMenu.
 */

const FOG = 'radial-gradient(50% 70% at 50% 50%, var(--color-b1-surface) 38%, transparent 100%)';
const coarse = () => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

const KEYFRAMES = `
  @keyframes dn-item { from { opacity: 0; transform: translateY(-10px); filter: blur(10px); } to { opacity: 1; transform: none; filter: blur(0); } }
  @media (prefers-reduced-motion: reduce) { .dn-item { animation: none !important; } }
`;

export const DockNav = () => {
  const pathname = usePathname();
  const activeSlug = findSection(pathname)?.slug;
  const [hover, setHover] = useState<string | null>(null);
  const [shown, setShown] = useState<string | null>(null); // 닫히는 동안 마지막 섹션 유지
  const [atTop, setAtTop] = useState(true);
  const [lefts, setLefts] = useState<Record<string, number>>({});

  const boxRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const open = !!sections.find(s => s.slug === hover)?.children?.length;
  const sec = sections.find(s => s.slug === shown);

  // 하위 열의 x = 해당 메뉴 항목의 x (바 컨테이너 기준 실측)
  const measure = useCallback(() => {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    const next: Record<string, number> = {};
    for (const [slug, el] of Object.entries(itemRefs.current)) {
      if (el) next[slug] = el.getBoundingClientRect().left - box.left;
    }
    setLefts(next);
  }, []);

  useEffect(() => {
    if (open && hover) setShown(hover);
  }, [open, hover]);

  useEffect(() => {
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setAtTop(y < 12);
      if (Math.abs(y - last) > 2) setHover(null);
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', onScroll);
    };
  }, [measure]);

  const onBlur = (e: FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHover(null);
  };

  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
      onMouseLeave={() => setHover(null)}
      onBlur={onBlur}
    >
      <style>{KEYFRAMES}</style>

      {/* 패널 + 안개 (바 뒤) — hover한 메뉴의 하위 메뉴만, 그 항목 아래 x 위치에 */}
      <div
        aria-hidden={!open}
        inert={!open}
        className={cn(
          'absolute inset-x-0 top-0 isolate hidden overflow-x-clip transition-opacity lg:block',
          open ? 'opacity-100 duration-300' : 'pointer-events-none opacity-0 duration-150'
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute top-[-580px] left-1/2 -z-10 h-[1264px] w-[2966px] -translate-x-1/2 blur-[90px]"
          style={{ background: FOG }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-[-580px] left-1/2 -z-10 h-[1264px] w-[2304px] -translate-x-1/2 blur-[90px]"
          style={{ background: FOG }}
        />
        {/* 바와 동일한 컨테이너 박스 — 열의 left 는 항목 실측값 */}
        <div className="relative mx-auto h-[400px] max-w-[1320px] px-6 md:px-[clamp(24px,4vw,56px)]">
          {sec?.children && (
            <ul
              key={sec.slug}
              className="absolute top-[92px] space-y-3"
              style={{ left: lefts[sec.slug] ?? 0 }}
            >
              {sec.children.map((c, row) => (
                <li
                  key={c.slug}
                  className="dn-item"
                  style={{
                    animation: 'dn-item 500ms cubic-bezier(0.16,1,0.3,1) both',
                    animationDelay: `${row * 40}ms`,
                  }}
                >
                  <Link
                    href={childHref(sec, c)}
                    onClick={() => setHover(null)}
                    className="text-b1-text hover:text-b1-accent block text-body leading-[1.6] font-semibold whitespace-nowrap opacity-90 transition-colors hover:opacity-100"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 바 — 최상단 투명, 스크롤하면 흰 반투명 + blur (숨지 않음) */}
      <div
        className={cn(
          'relative h-16 transition-[background-color,backdrop-filter] duration-400',
          !atTop && 'bg-b1-surface/75 backdrop-blur-[20px]'
        )}
      >
        <div
          ref={boxRef}
          className="mx-auto flex h-full max-w-[1320px] items-center justify-between px-6 md:px-[clamp(24px,4vw,56px)]"
        >
          <HomeLogo />

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex">
            {sections.map(item => {
              const has = !!item.children?.length;
              const isHover = hover === item.slug;
              const dim = open && !isHover;
              const emph = isHover || (!open && item.slug === activeSlug);
              return (
                <Link
                  key={item.slug}
                  ref={el => {
                    itemRefs.current[item.slug] = el;
                  }}
                  href={sectionHref(item)}
                  aria-expanded={has ? isHover : undefined}
                  aria-current={item.slug === activeSlug ? 'true' : undefined}
                  onMouseEnter={() => setHover(item.slug)}
                  onFocus={() => setHover(item.slug)}
                  onClick={(e: MouseEvent) => {
                    if (has && !isHover && coarse()) {
                      e.preventDefault();
                      setHover(item.slug);
                      return;
                    }
                    setHover(null); // 이동 뒤 패널이 열린 채 남지 않게
                  }}
                  className={cn(
                    'text-b1-text grid text-body transition-opacity duration-200',
                    dim ? 'opacity-50' : 'opacity-100',
                    emph ? 'font-semibold' : 'font-medium'
                  )}
                >
                  <span className="col-start-1 row-start-1">{item.label}</span>
                  {/* 볼드 고스트 — 굵기 전환 시 폭 고정(레이아웃 시프트 방지) */}
                  <span aria-hidden className="invisible col-start-1 row-start-1 font-semibold">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <SideMenu />
        </div>
      </div>
    </header>
  );
};
