'use client';

import { HeaderGlow } from '@/shared/components/layout/SectionShell/HeaderGlow';
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

/* 등장 — 제목은 홈 히어로 텍스트(hh-in-text)와 같은 어휘: blur 12→0 · X -32→0, 1500ms EXPO.
 * 알약은 아래서 16px, 블러 없음(15px 글자·채운 활성 알약은 블러가 번진 자국으로 보인다), 300ms 뒤 50ms 스태거.
 * 제목은 key={title} 로 형제 전환마다 재생(페이지가 바뀌었다는 유일한 신호), 알약 줄은 마운트 때 1회만(방금 누른 줄이 다시 튀면 점프로 보인다).
 * 숨김 상태는 from 에만 두고 both → reduced-motion 에서 animation:none 이면 최종 상태. */
const EXPO = 'cubic-bezier(0.16,1,0.3,1)';
const ENTRANCE = `
  @keyframes ss-in-title{from{opacity:0;transform:translateX(-32px);filter:blur(12px)}to{opacity:1;transform:none;filter:blur(0)}}
  @keyframes ss-in-pill{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
  .ss-in-title{animation:ss-in-title 1500ms ${EXPO} both}
  .ss-in-pill{animation:ss-in-pill 700ms ${EXPO} both}
  @media (prefers-reduced-motion: reduce){.ss-in-title,.ss-in-pill{animation:none!important}}
`;

/**
 * 서브페이지 공통 머리 — 확정안 S1 (2026-10-10, 20종 비교 시트에서 선택).
 * 페이지명 64px + 형제 알약 15px(활성 accent) + hairline. 섹션명 eyebrow·사진 배너·브레드크럼 없음 —
 * 독이 이미 섹션을 표시하고, 요소는 정보 기능이 있을 때만 둔다.
 * 머리와 본문은 같은 패딩 래퍼(px-[6vw] → max-w-[1320px]) 안에 있어 hairline 과 본문 좌우가 맞는다.
 * 본문 레이아웃은 공통이 아니다 — 섹션(콘텐츠 유형)별로 각 page 가 설계한다.
 * 머리 뒤에는 HeaderGlow(반원 고리 파면, 섹션 진입 시 1회)가 깔린다 — 레이아웃에 있어 형제 페이지 이동에서는 재생되지 않는다.
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
    <div className="relative px-[6vw] pb-20 md:pb-28">
      <style>{ENTRANCE}</style>
      <HeaderGlow />
      <header className="relative mx-auto w-full max-w-[1320px] pt-[112px] md:pt-[128px]">
        <h1
          key={title}
          className="ss-in-title text-b1-text text-[40px] leading-[1.05] font-bold tracking-[-0.03em] text-balance md:text-[64px]"
        >
          {title}
        </h1>
        {subs.length > 0 && (
          <nav aria-label={`${s.label} 하위 메뉴`} className="mt-8 flex flex-wrap gap-1.5">
            {subs.map((c, i) => {
              const active = c.slug === child?.slug;
              return (
                <Link
                  key={c.slug}
                  href={childHref(s, c)}
                  aria-current={active ? 'page' : undefined}
                  style={{ animationDelay: `${300 + i * 50}ms` }}
                  className={cn(
                    'ss-in-pill inline-flex min-h-11 items-center rounded-full px-4 py-2 text-body-sm font-semibold transition-colors',
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
        )}
        <hr className="border-b1-border mt-10 mb-14" />
      </header>
      <div className="relative mx-auto w-full max-w-[1320px]">{children}</div>
    </div>
  );
};
