'use client';

import { Reveal } from '@/shared/components/features/Reveal';
import {
  childHref,
  findChild,
  siteNav,
  type NavSection,
  type SectionSlug,
} from '@/shared/config/siteNav';
import { cn } from '@/shared/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PropsWithChildren } from 'react';

interface Props {
  section: SectionSlug;
}

/**
 * 서브페이지 공통 머리 — 확정안 S1 (2026-10-10, 20종 비교 시트에서 선택).
 * 페이지명 64px + 형제 알약 15px(활성 accent) + hairline. 섹션명 eyebrow·사진 배너·브레드크럼 없음 —
 * 독이 이미 섹션을 표시하고, 요소는 정보 기능이 있을 때만 둔다.
 * 머리와 본문은 같은 패딩 래퍼(px-[6vw] → max-w-[1320px]) 안에 있어 hairline 과 본문 좌우가 맞는다.
 * 본문 레이아웃은 공통이 아니다 — 섹션(콘텐츠 유형)별로 각 page 가 설계한다.
 * 근거: .md/specs/2026-10-10-site-nav-skeleton-design.md §4
 */
export const SectionShell = ({ section, children }: PropsWithChildren<Props>) => {
  // as const 유니온 → 넓힌 타입으로 받아야 children 접근이 된다(하위 없는 섹션엔 키가 없음)
  const s: NavSection | undefined = siteNav.find(x => x.slug === section);
  if (!s) throw new Error(`siteNav 에 없는 섹션: ${section}`);
  const child = findChild(usePathname());
  const subs = s.children ?? [];
  const title = child?.label ?? s.label;

  return (
    <div className="px-[6vw] pb-20 md:pb-28">
      <header className="mx-auto w-full max-w-[1320px] pt-[112px] md:pt-[128px]">
        <Reveal>
          <h1 className="text-b1-text text-[40px] leading-[1.05] font-bold tracking-[-0.03em] text-balance md:text-[64px]">
            {title}
          </h1>
        </Reveal>
        {subs.length > 0 && (
          <Reveal delay={100}>
            <nav aria-label={`${s.label} 하위 메뉴`} className="mt-8 flex flex-wrap gap-1.5">
              {subs.map(c => {
                const active = c.slug === child?.slug;
                return (
                  <Link
                    key={c.slug}
                    href={childHref(s, c)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'rounded-full px-4 py-2 text-[15px] font-semibold transition-colors',
                      active
                        ? 'bg-b1-accent text-white shadow-[0_6px_14px_-4px_rgba(37,99,235,0.45)]' /* design-lint-ignore: 활성 알약 accent 그림자(DockNav 와 동일 값) */
                        : 'text-b1-sub hover:bg-b1-accent-soft hover:text-b1-text'
                    )}
                  >
                    {c.label}
                  </Link>
                );
              })}
            </nav>
          </Reveal>
        )}
        <hr className="border-b1-border mt-10 mb-14" />
      </header>
      <div className="mx-auto w-full max-w-[1320px]">{children}</div>
    </div>
  );
};
