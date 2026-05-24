'use client';

import { menuItems } from '@/shared/components/layout/Header/NavigationMenu';
import { cn } from '@/shared/lib/utils';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 독 A — 상단 글래스 캡슐
 * - 히어로 위 반투명 → 스크롤 시 솔리드로 전환
 * - active/hover 항목을 따라 미끄러지는 accent 인디케이터(채움)
 * - ≤md 에서는 로고 + 햄버거로 축소
 */
export const DockCapsule = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [bar, setBar] = useState({ left: 0, width: 0 });

  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const shown = hoverIdx ?? activeIdx;

  const moveTo = useCallback((idx: number) => {
    const el = linkRefs.current[idx];
    if (!el) return;
    setBar({ left: el.offsetLeft, width: el.offsetWidth });
  }, []);

  // 표시 대상(hover 우선, 없으면 active)이 바뀔 때 인디케이터 이동
  useEffect(() => {
    moveTo(shown);
  }, [shown, moveTo]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    const reflow = () => moveTo(shown);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', reflow);
    // 폰트 로드 후 폭이 바뀌므로 재측정
    document.fonts?.ready.then(reflow);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', reflow);
    };
  }, [shown, moveTo]);

  return (
    <div
      className={cn(
        'fixed inset-x-0 z-50 flex justify-center px-4 transition-[top] duration-300',
        scrolled ? 'top-3' : 'top-[18px]'
      )}
    >
      <div
        className={cn(
          'pointer-events-auto flex items-center gap-1 rounded-full border py-2 pr-2 pl-[18px] backdrop-blur-lg backdrop-saturate-150 transition-all duration-300',
          scrolled
            ? 'border-b1-border bg-white/85 shadow-[0_12px_28px_-14px_rgba(15,23,42,0.30)]'
            : 'border-white/65 bg-white/55 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.22)]'
        )}
      >
        <Link
          href="/"
          className="text-b1-text inline-flex items-center gap-2 text-[15px] font-extrabold tracking-[-0.02em] no-underline"
        >
          <span aria-hidden className="b1-pulse-dot bg-b1-accent inline-block h-2 w-2 rounded-full" />
          성복교회
        </Link>

        <span aria-hidden className="bg-b1-border mx-2 hidden h-[18px] w-px md:block" />

        <nav
          ref={navRef}
          className="relative hidden items-center gap-0.5 md:flex"
          onMouseLeave={() => setHoverIdx(null)}
        >
          <span
            aria-hidden
            className="bg-b1-accent absolute top-0 h-full rounded-full shadow-[0_6px_14px_-4px_rgba(37,99,235,0.50)] transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              transform: `translateX(${bar.left}px)`,
              width: bar.width,
              opacity: bar.width ? 1 : 0,
            }}
          />
          {menuItems.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              ref={(el) => {
                linkRefs.current[i] = el;
              }}
              onMouseEnter={() => setHoverIdx(i)}
              onClick={() => setActiveIdx(i)}
              className={cn(
                'relative z-10 rounded-full px-[14px] py-2 text-[14px] font-semibold transition-colors',
                i === shown ? 'text-white' : 'text-b1-sub hover:text-b1-text'
              )}
            >
              {item.children}
            </Link>
          ))}
        </nav>

        <button
          className="text-b1-text inline-flex h-[38px] w-[38px] items-center justify-center md:hidden"
          aria-label="메뉴 열기"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            className="h-[22px] w-[22px]"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};
