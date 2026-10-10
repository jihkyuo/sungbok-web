'use client';

import { HomeLogo } from '@/shared/components/layout/Header/HomeLogo';
import { SideMenu } from '@/shared/components/layout/Header/SideMenu';
import { childHref, findSection, sectionHref, sections } from '@/shared/config/siteNav';
import { cn } from '@/shared/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * DockNav — 상단 글래스 캡슐 헤더(확정안)
 * 글래스 캡슐 + 스크롤 반응(반투명→솔리드) + 미끄러지는 accent 인디케이터
 * + hover 글래스 드롭다운(라이트 글래스·가독 + 좌측 accent 바 모션) + 모바일 SideMenu 재사용
 * 메뉴·서브메뉴는 siteNav(단일 소스)에서 파생 — 하위 링크는 각자 페이지로, 상위 링크는 첫 하위로.
 */
export const DockNav = () => {
  const pathname = usePathname();
  const activeSlug = findSection(pathname)?.slug;
  const activeIdx = sections.findIndex(s => s.slug === activeSlug);

  const [scrolled, setScrolled] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [bar, setBar] = useState({ left: 0, width: 0, show: false });

  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const shown = hoverIdx ?? activeIdx;

  const moveTo = useCallback((idx: number) => {
    if (idx < 0) {
      setBar(b => ({ ...b, show: false }));
      return;
    }
    const el = itemRefs.current[idx];
    if (!el) return;
    setBar({ left: el.offsetLeft, width: el.offsetWidth, show: true });
  }, []);

  useEffect(() => {
    moveTo(shown);
  }, [shown, moveTo]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    const reflow = () => moveTo(shown);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', reflow);
    document.fonts?.ready.then(reflow);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', reflow);
    };
  }, [shown, moveTo]);

  return (
    <header className="fixed inset-x-0 top-[18px] z-50 flex justify-center px-4">
      <div
        className={cn(
          'pointer-events-auto flex items-center gap-1 rounded-full border py-2 pr-2 pl-[18px] backdrop-blur-lg backdrop-saturate-150 transition-all duration-300',
          scrolled
            ? 'border-b1-border bg-white/85 shadow-[0_12px_28px_-14px_rgba(15,23,42,0.30)]'
            : 'border-white/65 bg-white/55 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.22)]'
        )}
      >
        <HomeLogo />

        <span aria-hidden className="bg-b1-border mx-2 hidden h-[18px] w-px md:block" />

        <nav ref={navRef} className="relative hidden items-center gap-0.5 md:flex">
          <span
            aria-hidden
            className="bg-b1-accent absolute top-0 h-full rounded-full shadow-[0_6px_14px_-4px_rgba(37,99,235,0.50)] transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              transform: `translateX(${bar.left}px)`,
              width: bar.width,
              opacity: bar.show ? 1 : 0,
            }}
          />

          {sections.map((item, i) => {
            const subs = item.children ?? [];
            const open = hoverIdx === i;
            return (
              <div
                key={item.slug}
                ref={el => {
                  itemRefs.current[i] = el;
                }}
                className="relative"
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
              >
                <Link
                  href={sectionHref(item)}
                  className={cn(
                    'relative z-10 block rounded-full px-[14px] py-2 text-[14px] font-semibold transition-colors',
                    i === shown ? 'text-white' : 'text-b1-sub hover:text-b1-text'
                  )}
                >
                  {item.label}
                </Link>

                {subs.length > 0 && (
                  <div
                    className={cn(
                      'absolute top-full left-1/2 z-30 -translate-x-1/2 pt-[14px] transition-all duration-200',
                      open
                        ? 'pointer-events-auto translate-y-0 opacity-100'
                        : 'pointer-events-none -translate-y-1 opacity-0'
                    )}
                  >
                    <div
                      className="border-b1-border w-[220px] rounded-2xl border bg-white/95 p-2 shadow-[0_24px_48px_-16px_rgba(15,23,42,0.30)] backdrop-blur-xl backdrop-saturate-150" /* design-lint-ignore: 드롭다운 카드 1회성 그림자 */
                    >
                      {subs.map(c => (
                        <Link
                          key={c.slug}
                          href={childHref(item, c)}
                          className="group text-b1-sub hover:text-b1-accent hover:bg-b1-accent-soft/80 relative block overflow-hidden rounded-xl py-2 pr-3 pl-4 text-[14px] font-medium transition-colors"
                        >
                          <span className="bg-b1-accent absolute top-1/2 left-1 h-4 w-[3px] -translate-y-1/2 scale-y-0 rounded-full transition-transform duration-200 group-hover:scale-y-100" />
                          <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                            {c.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <SideMenu />
      </div>
    </header>
  );
};
