# A1 구조 — 구현 계획

> **실행 결과(2026-10-10)**: 완료. Task 2의 "임시 최소형 SectionShell"은 확정 머리 S1으로 대체 구현. Task 3에서 `/worship/sunday`는 기존 `PlaylistPagination` 대신 설교 아카이브 디자인(`domains/worship/SermonArchive`)을 올렸고, 디자인이 있는 5페이지(담임목사·섬기는 이들·영어예배부·주일예배·주보)는 도메인 위젯으로 본문을 이식했다. 커밋은 사용자 지시 대기.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 회의에서 확정된 IA를 한 소스(`siteNav`)로 정의하고, 그로부터 독 메뉴·서브 라우트 26개·redirect가 어긋남 없이 파생되게 한다. 콘텐츠·시각 결정은 넣지 않는다.

**Architecture:** `src/shared/config/siteNav.ts`가 메뉴와 라우트의 단일 소스다. 섹션별 Next.js 중첩 레이아웃(`app/<section>/layout.tsx`)이 임시 최소형 `SectionShell`을 감싸고, 각 `page.tsx`는 `PagePlaceholder` 한 줄만 렌더한다. `next.config.ts`의 redirect도 `siteNav`에서 생성한다. 테스트가 "메뉴에 있는 모든 항목에 page.tsx가 존재"함을 잠근다.

**Tech Stack:** Next.js 15 App Router · TypeScript · Tailwind 4(`b1-*` 토큰) · Vitest + Testing Library · pnpm

**Spec:** [.md/specs/2026-10-10-site-nav-skeleton-design.md](2026-10-10-site-nav-skeleton-design.md) — §2 네비 표, §3 라우트/redirect, §4 SectionShell(A1은 임시 최소형), §5 DockNav/SideMenu(A1은 데이터 교체만), §6 PagePlaceholder, §7 검증, §8 문서

## Global Constraints

- **git**: 스테이징·커밋은 **사용자가 지시할 때만** (CLAUDE.md). 각 태스크 끝의 "체크포인트"는 커밋 *제안*이지 커밋이 아니다 — 사용자에게 묻고 지시를 기다린다.
- **색·반경·폰트는 `src/app/globals.css`의 `b1-*` 토큰만** (`bg-b1-accent`, `text-b1-sub` 등). HEX 하드코딩 금지. 커밋 시 `pnpm design:lint --diff`가 차단한다.
- **카피 톤**: 사실 진술만. 영업·약속·환대 멘트 금지 (placeholder 문장: "이 페이지는 준비 중입니다.").
- **TDD(로직 한정)**: camelCase `.ts` 로직 파일은 형제 테스트를 **먼저** 만든다. `.claude/hooks/tdd-guard.sh`가 형제 테스트 없는 신규 로직 파일 생성을 차단한다 (`siteNav.ts`보다 `siteNav.test.ts`를 먼저 Write).
- **패키지 매니저**: pnpm. 테스트 `pnpm test`, 타입 `pnpm typecheck`, 린트 `pnpm lint`.
- **외과적 변경**: 이 계획이 명시하지 않은 파일·라인은 건드리지 않는다 (예: `PlaylistPagination.tsx`의 `console.log`는 그대로 둔다).
- **URL**: `/{section}/{page}` 영문 슬러그, 스펙 §2 표와 글자 하나 다르지 않게.
- **범위 밖**: SideMenu 아코디언·SectionShell 형제 탭/시각(A2), 홈 섹션 변경, `/nextgen-preview` 정리, 페이지 본문.

## Review Focus

스펙이 명시하지 않지만 실제로 깨질 입력들. 각 항목은 아래 태스크의 테스트에 반영돼 있다.

1. **접두사만 같은 경로** — `/newsletter`, `/about-us`가 `news`/`about` 섹션으로 오판되면 독이 엉뚱한 메뉴를 켠다. 세그먼트 단위로 비교해야 한다. → Task 1 `findSection`
2. **끝 슬래시·쿼리·해시가 붙은 경로** — `/about/pastor/`, `/worship/sunday?v=2`에서도 섹션·하위 판정이 같아야 한다. → Task 1
3. **하위 없는 섹션(`location`)** — `findChild`는 undefined, `sectionHref`는 `/location`, SectionShell은 부제 없이 렌더, redirect 목록에 포함되지 않아야 한다. → Task 1, Task 3
4. **메뉴 정의와 라우트의 불일치** — 슬러그 하나만 오타 나도 드롭다운이 404로 간다. 모든 (section, child)에 `page.tsx`, 하위 있는 섹션에 `layout.tsx`가 존재해야 한다. 슬러그 중복도 막는다. → Task 1(중복), Task 4(정합성)
5. **드롭다운 하위 링크가 상위로 가는 기존 버그 재발** — DockNav가 `childHref`를 쓰는지 렌더 테스트로 잠근다. → Task 6

---

### Task 1: `siteNav` 단일 소스 + 파생 함수 (TDD)

**Files:**
- Test: `src/shared/config/siteNav.test.ts` (**먼저 생성** — tdd-guard)
- Create: `src/shared/config/siteNav.ts`

**Interfaces:**
- Produces:
  ```ts
  export type NavChild = { readonly label: string; readonly slug: string };
  export type NavSection = { readonly label: string; readonly slug: string; readonly children?: readonly NavChild[] };
  export const siteNav: readonly NavSection[];                 // 스펙 §2 표 그대로, 6개 섹션
  export type SectionSlug = (typeof siteNav)[number]['slug'];  // 'about' | 'worship' | ...
  export const sectionHref: (s: NavSection) => string;         // 하위 있으면 첫 하위, 없으면 /{slug}
  export const childHref: (s: NavSection, c: NavChild) => string;
  export const findSection: (pathname: string) => NavSection | undefined;
  export const findChild: (pathname: string) => NavChild | undefined;
  export const buildRedirects: () => { source: string; destination: string; permanent: false }[];
  ```

- [ ] **Step 1: 실패하는 테스트 작성**

`src/shared/config/siteNav.test.ts`:
```ts
import {
  buildRedirects,
  childHref,
  findChild,
  findSection,
  sectionHref,
  siteNav,
} from '@/shared/config/siteNav';
import { describe, expect, it } from 'vitest';

// 네비 단일 소스의 파생 함수. 경로 판정은 세그먼트 단위라 접두사만 같은 경로에 속지 않고,
// 끝 슬래시·쿼리·해시가 붙어도 같은 결과를 낸다.
const about = siteNav.find((s) => s.slug === 'about')!;
const worship = siteNav.find((s) => s.slug === 'worship')!;
const location = siteNav.find((s) => s.slug === 'location')!;

describe('siteNav 데이터 무결성', () => {
  it('상위 섹션은 스펙 순서대로 6개다', () => {
    expect(siteNav.map((s) => s.slug)).toEqual([
      'about',
      'worship',
      'next-generation',
      'news',
      'resources',
      'location',
    ]);
  });

  it('상위 슬러그와 각 섹션 안의 하위 슬러그는 중복이 없다', () => {
    const top = siteNav.map((s) => s.slug);
    expect(new Set(top).size).toBe(top.length);
    for (const s of siteNav) {
      const subs = (s.children ?? []).map((c) => c.slug);
      expect(new Set(subs).size, s.slug).toBe(subs.length);
    }
  });

  it('슬러그는 소문자·숫자·하이픈만 쓴다', () => {
    const all = siteNav.flatMap((s) => [s.slug, ...(s.children ?? []).map((c) => c.slug)]);
    for (const slug of all) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('예배 섹션의 첫 하위는 예배 안내다', () => {
    expect(worship.children?.[0]).toEqual({ label: '예배 안내', slug: 'guide' });
  });
});

describe('sectionHref / childHref', () => {
  it('하위가 있는 섹션은 첫 하위 경로를 돌려준다', () => {
    expect(sectionHref(about)).toBe('/about/pastor-emeritus');
    expect(sectionHref(worship)).toBe('/worship/guide');
  });

  it('하위가 없는 섹션은 자기 경로를 돌려준다', () => {
    expect(sectionHref(location)).toBe('/location');
  });

  it('childHref 는 /{section}/{child} 다', () => {
    expect(childHref(about, about.children![1])).toBe('/about/pastor');
  });
});

describe('findSection', () => {
  it('경로 첫 세그먼트로 섹션을 찾는다', () => {
    expect(findSection('/worship/sunday')?.slug).toBe('worship');
    expect(findSection('/location')?.slug).toBe('location');
  });

  it('홈과 미등록 경로는 undefined 다', () => {
    expect(findSection('/')).toBeUndefined();
    expect(findSection('/nextgen-preview')).toBeUndefined();
  });

  it('접두사만 같은 경로에 속지 않는다', () => {
    expect(findSection('/newsletter')).toBeUndefined();
    expect(findSection('/about-us')).toBeUndefined();
  });

  it('끝 슬래시·쿼리·해시가 있어도 같은 결과다', () => {
    expect(findSection('/about/pastor/')?.slug).toBe('about');
    expect(findSection('/worship/sunday?v=2')?.slug).toBe('worship');
    expect(findSection('/news/album#top')?.slug).toBe('news');
  });
});

describe('findChild', () => {
  it('두 번째 세그먼트로 하위 항목을 찾는다', () => {
    expect(findChild('/about/pastor')).toEqual({ label: '담임목사', slug: 'pastor' });
    expect(findChild('/worship/sunday/')).toEqual({ label: '주일예배', slug: 'sunday' });
  });

  it('하위가 없거나 미등록이면 undefined 다', () => {
    expect(findChild('/location')).toBeUndefined();
    expect(findChild('/about')).toBeUndefined();
    expect(findChild('/about/nope')).toBeUndefined();
    expect(findChild('/')).toBeUndefined();
  });
});

describe('buildRedirects', () => {
  it('하위 있는 상위 5개 → 첫 하위, 레거시 2개, 모두 permanent=false', () => {
    const r = buildRedirects();
    expect(r).toEqual([
      { source: '/about', destination: '/about/pastor-emeritus', permanent: false },
      { source: '/worship', destination: '/worship/guide', permanent: false },
      { source: '/next-generation', destination: '/next-generation/infant', permanent: false },
      { source: '/news', destination: '/news/announcements', permanent: false },
      { source: '/resources', destination: '/resources/sunday-sermon', permanent: false },
      { source: '/worship-video', destination: '/worship/sunday', permanent: false },
      { source: '/map', destination: '/location', permanent: false },
    ]);
  });

  it('하위 없는 섹션(location)은 redirect 대상이 아니다', () => {
    expect(buildRedirects().some((r) => r.source === '/location')).toBe(false);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm exec vitest run src/shared/config/siteNav.test.ts`
Expected: FAIL — `Failed to resolve import "@/shared/config/siteNav"`

- [ ] **Step 3: 최소 구현**

`src/shared/config/siteNav.ts`:
```ts
/**
 * 사이트 네비게이션 단일 소스.
 * 독(DockNav) 드롭다운 · 모바일 SideMenu · 섹션 레이아웃 · next.config redirect 가 전부 여기서 파생된다.
 * 항목을 추가하면 `src/app/{section}/{child}/page.tsx` 도 함께 만들어야 한다 — siteNav.test.ts 가 잠근다.
 * 근거: .md/specs/2026-10-10-site-nav-skeleton-design.md §2
 */
export type NavChild = { readonly label: string; readonly slug: string };
export type NavSection = {
  readonly label: string;
  readonly slug: string;
  readonly children?: readonly NavChild[];
};

export const siteNav = [
  {
    label: '교회소개',
    slug: 'about',
    children: [
      { label: '원로목사', slug: 'pastor-emeritus' },
      { label: '담임목사', slug: 'pastor' },
      { label: '섬기는 이들', slug: 'staff' },
      { label: '양육·훈련', slug: 'training' },
      { label: '연혁', slug: 'history' },
    ],
  },
  {
    label: '예배',
    slug: 'worship',
    children: [
      { label: '예배 안내', slug: 'guide' },
      { label: '주일예배', slug: 'sunday' },
      { label: '금요 생수의 강·월삭예배', slug: 'friday' },
      { label: '특별집회·행사', slug: 'special' },
      { label: '수요·새벽·주일5부', slug: 'weekday' },
    ],
  },
  {
    label: '다음세대',
    slug: 'next-generation',
    children: [
      { label: '영아부', slug: 'infant' },
      { label: '유치부', slug: 'kindergarten' },
      { label: '유년부', slug: 'lower-elementary' },
      { label: '초등부', slug: 'elementary' },
      { label: '중등부', slug: 'middle' },
      { label: '고등부', slug: 'high' },
      { label: '청년부', slug: 'young-adult' },
      { label: '영어예배부', slug: 'english' },
    ],
  },
  {
    label: '교회소식',
    slug: 'news',
    children: [
      { label: '주일광고', slug: 'announcements' },
      { label: '주보', slug: 'bulletin' },
      { label: '성복의 뜰', slug: 'garden' },
      { label: '교회앨범', slug: 'album' },
    ],
  },
  {
    label: '자료실',
    slug: 'resources',
    children: [
      { label: '주일 설교 시트지', slug: 'sunday-sermon' },
      { label: '시리즈 설교 시트지', slug: 'series-sermon' },
      { label: '가정·명절·절기 설교 시트지', slug: 'seasonal-sermon' },
    ],
  },
  { label: '찾아오시는 길', slug: 'location' },
] as const satisfies readonly NavSection[];

export type SectionSlug = (typeof siteNav)[number]['slug'];

export const sectionHref = (s: NavSection): string =>
  s.children?.length ? `/${s.slug}/${s.children[0].slug}` : `/${s.slug}`;

export const childHref = (s: NavSection, c: NavChild): string => `/${s.slug}/${c.slug}`;

// 쿼리·해시 제거 후 빈 세그먼트(끝 슬래시) 걸러낸 경로 조각
const segments = (pathname: string): string[] =>
  pathname.split(/[?#]/)[0].split('/').filter(Boolean);

export const findSection = (pathname: string): NavSection | undefined => {
  const [first] = segments(pathname);
  return first ? siteNav.find((s) => s.slug === first) : undefined;
};

export const findChild = (pathname: string): NavChild | undefined => {
  const [first, second] = segments(pathname);
  if (!first || !second) return undefined;
  return siteNav.find((s) => s.slug === first)?.children?.find((c) => c.slug === second);
};

// 미공개 사이트라 영구(308) 캐시를 피한다 — 전부 permanent:false(307).
const LEGACY_REDIRECTS = [
  { source: '/worship-video', destination: '/worship/sunday' },
  { source: '/map', destination: '/location' },
] as const;

export const buildRedirects = () => [
  ...siteNav
    .filter((s) => s.children?.length)
    .map((s) => ({ source: `/${s.slug}`, destination: sectionHref(s), permanent: false as const })),
  ...LEGACY_REDIRECTS.map((r) => ({ ...r, permanent: false as const })),
];
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm exec vitest run src/shared/config/siteNav.test.ts`
Expected: PASS (14 tests)

- [ ] **Step 5: 타입 확인**

Run: `pnpm typecheck`
Expected: 오류 없음

- [ ] **Step 6: 체크포인트** — 사용자에게 커밋 여부 확인. 제안 메시지: `feat: 사이트 네비 단일 소스 siteNav + 파생 함수 (TDD)`

---

### Task 2: `PagePlaceholder` + 임시 최소형 `SectionShell`

**Files:**
- Create: `src/shared/components/layout/PagePlaceholder/index.tsx`
- Create: `src/shared/components/layout/SectionShell/index.tsx` (서버)
- Create: `src/shared/components/layout/SectionShell/CurrentPageTitle.tsx` (클라이언트)
- Test: `src/shared/components/layout/SectionShell/SectionShell.test.tsx`

**Interfaces:**
- Consumes: `siteNav`, `findChild`, `SectionSlug`, `NavSection` (Task 1)
- Produces:
  ```tsx
  export const PagePlaceholder: () => JSX.Element;
  export const SectionShell: (p: PropsWithChildren<{ section: SectionSlug }>) => JSX.Element;
  ```

> A1의 SectionShell은 **정보 요소만** 보장한다(상단 여백 · 섹션명 · 현재 페이지명 · 본문 컨테이너). 형제 탭·배치·크기는 A2 시안에서 정한다. 컨테이너 수치는 홈 `Section`(`px-[6vw]`, `max-w-[1320px]`)과 동일하게 맞춘다.

- [ ] **Step 1: 실패하는 렌더 테스트 작성**

`src/shared/components/layout/SectionShell/SectionShell.test.tsx`:
```tsx
import { SectionShell } from '@/shared/components/layout/SectionShell';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const pathname = vi.hoisted(() => ({ current: '/about/pastor' }));
vi.mock('next/navigation', () => ({ usePathname: () => pathname.current }));

describe('SectionShell (A1 임시 최소형)', () => {
  it('섹션명을 h1로, 현재 하위 페이지명을 부제로, 본문을 그대로 렌더한다', () => {
    pathname.current = '/about/pastor';
    render(
      <SectionShell section="about">
        <p>본문</p>
      </SectionShell>
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('교회소개');
    expect(screen.getByText('담임목사')).toBeInTheDocument();
    expect(screen.getByText('본문')).toBeInTheDocument();
  });

  it('하위가 없는 섹션은 부제 없이 섹션명만 보여준다', () => {
    pathname.current = '/location';
    const { container } = render(
      <SectionShell section="location">
        <p>본문</p>
      </SectionShell>
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('찾아오시는 길');
    expect(container.querySelectorAll('header p')).toHaveLength(1); // 섹션 라벨(eyebrow)만
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm exec vitest run src/shared/components/layout/SectionShell`
Expected: FAIL — 모듈 없음

- [ ] **Step 3: 구현**

`src/shared/components/layout/PagePlaceholder/index.tsx`:
```tsx
/** 콘텐츠가 아직 없는 서브페이지의 본문. 사실 진술 한 줄만 — 약속·환대 멘트 금지(DESIGN.md 카피 톤). */
export const PagePlaceholder = () => (
  <p className="text-b1-sub text-[15px] leading-[1.8] md:text-[16px]">이 페이지는 준비 중입니다.</p>
);
```

`src/shared/components/layout/SectionShell/CurrentPageTitle.tsx`:
```tsx
'use client';

import { findChild, type NavSection } from '@/shared/config/siteNav';
import { usePathname } from 'next/navigation';

/** 섹션명(h1) + 현재 하위 페이지명(부제). 하위가 없는 섹션은 부제를 생략한다. */
export const CurrentPageTitle = ({ section }: { section: NavSection }) => {
  const child = findChild(usePathname());
  return (
    <>
      <h1 className="text-b1-text m-0 text-[32px] font-bold tracking-[-0.02em] text-balance md:text-[44px]">
        {section.label}
      </h1>
      {child && (
        <p className="text-b1-sub mt-3 text-[16px] font-medium md:text-[18px]">{child.label}</p>
      )}
    </>
  );
};
```

`src/shared/components/layout/SectionShell/index.tsx`:
```tsx
import { siteNav, type SectionSlug } from '@/shared/config/siteNav';
import type { PropsWithChildren } from 'react';
import { CurrentPageTitle } from './CurrentPageTitle';

interface Props {
  section: SectionSlug;
}

/**
 * 서브페이지 공통 틀 — A1 임시 최소형.
 * 상단 여백(fixed 독 회피) · 섹션 라벨 · 제목/부제 · 본문 컨테이너만 보장한다.
 * 형제 탭·배치·크기는 A2 시안(section-shell-preview)에서 확정 후 교체한다.
 * 컨테이너 수치는 홈 Section(px-[6vw] / max-w-[1320px])과 동일.
 */
export const SectionShell = ({ section, children }: PropsWithChildren<Props>) => {
  const s = siteNav.find((x) => x.slug === section);
  if (!s) throw new Error(`siteNav 에 없는 섹션: ${section}`);

  return (
    <div className="px-[6vw] pt-[120px] pb-20 md:pt-[140px] md:pb-28">
      <div className="mx-auto w-full max-w-[1320px]">
        <header className="mb-10 md:mb-14">
          <p className="b1-mono text-b1-accent mb-3 text-[11px] font-semibold tracking-[0.16em]">
            {s.label}
          </p>
          <CurrentPageTitle section={s} />
        </header>
        {children}
      </div>
    </div>
  );
};
```

> 두 번째 테스트의 `header p` 개수: 하위 있으면 eyebrow + 부제 = 2, 없으면 eyebrow만 = 1.

- [ ] **Step 4: 통과 확인**

Run: `pnpm exec vitest run src/shared/components/layout/SectionShell`
Expected: PASS (2 tests)

- [ ] **Step 5: 체크포인트** — 커밋 제안: `feat: SectionShell(A1 임시 최소형) + PagePlaceholder`

---

### Task 3: 라우트 골격 26개 + 정합성 테스트

**Files:**
- Modify: `src/shared/config/siteNav.test.ts` (정합성 describe 추가)
- Create: `src/app/{about,worship,next-generation,news,resources}/layout.tsx` (5)
- Create: `src/app/{section}/{child}/page.tsx` (25)
- Create: `src/app/location/page.tsx` (1)
- Delete: `src/app/worship-video/page.tsx` (디렉토리째)

**Interfaces:**
- Consumes: `SectionShell`, `PagePlaceholder` (Task 2), 기존 `PlaylistPagination`(`@/domains/worship-video/components/widgets/PlaylistPagination`, default export, async 서버 컴포넌트)

- [ ] **Step 1: 실패하는 정합성 테스트 추가**

`src/shared/config/siteNav.test.ts` 맨 아래에 추가:
```ts
import { existsSync } from 'node:fs';
import { join } from 'node:path';

// 메뉴 항목 ↔ 라우트 파일 정합성. 메뉴에만 추가하고 page.tsx 를 빠뜨리면 드롭다운이 404 로 간다.
describe('라우트 정합성 (siteNav ↔ src/app)', () => {
  const appDir = join(process.cwd(), 'src/app');
  const pages = siteNav.flatMap((s) =>
    s.children?.length
      ? s.children.map((c) => [`/${s.slug}/${c.slug}`, join(appDir, s.slug, c.slug, 'page.tsx')] as const)
      : [[`/${s.slug}`, join(appDir, s.slug, 'page.tsx')] as const]
  );

  it.each(pages)('%s → page.tsx 존재', (_href, file) => {
    expect(existsSync(file)).toBe(true);
  });

  it.each(siteNav.filter((s) => s.children?.length).map((s) => [s.slug] as const))(
    '%s 섹션 → layout.tsx 존재',
    (slug) => {
      expect(existsSync(join(appDir, slug, 'layout.tsx'))).toBe(true);
    }
  );
});
```
(import 두 줄은 파일 상단 import 블록으로 올린다.)

- [ ] **Step 2: 실패 확인**

Run: `pnpm exec vitest run src/shared/config/siteNav.test.ts`
Expected: FAIL — 정합성 31건(page 26 + layout 5) 실패, 나머지 PASS

- [ ] **Step 3: 라우트 파일 생성 (스크립트)**

프로젝트 루트에서 실행. 생성 내용은 전부 동일 패턴이라 손으로 26개를 치지 않고 한 번에 만든다. 라벨은 스펙 §2 표와 동일해야 한다(아래 배열이 그 복제본).

```bash
cd /Users/jiohyeon/Desktop/private/sungbok-web

gen_layout() { # $1 section-slug  $2 ComponentName
  mkdir -p "src/app/$1"
  cat > "src/app/$1/layout.tsx" <<EOF
import { SectionShell } from '@/shared/components/layout/SectionShell';
import type { PropsWithChildren } from 'react';

export default function $2({ children }: PropsWithChildren) {
  return <SectionShell section="$1">{children}</SectionShell>;
}
EOF
}

gen_page() { # $1 section-slug  $2 child-slug  $3 label
  mkdir -p "src/app/$1/$2"
  cat > "src/app/$1/$2/page.tsx" <<EOF
import { PagePlaceholder } from '@/shared/components/layout/PagePlaceholder';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '$3 | 성복교회' };

export default function Page() {
  return <PagePlaceholder />;
}
EOF
}

gen_layout about AboutLayout
gen_page about pastor-emeritus 원로목사
gen_page about pastor 담임목사
gen_page about staff '섬기는 이들'
gen_page about training '양육·훈련'
gen_page about history 연혁

gen_layout worship WorshipLayout
gen_page worship guide '예배 안내'
gen_page worship sunday 주일예배
gen_page worship friday '금요 생수의 강·월삭예배'
gen_page worship special '특별집회·행사'
gen_page worship weekday '수요·새벽·주일5부'

gen_layout next-generation NextGenerationLayout
gen_page next-generation infant 영아부
gen_page next-generation kindergarten 유치부
gen_page next-generation lower-elementary 유년부
gen_page next-generation elementary 초등부
gen_page next-generation middle 중등부
gen_page next-generation high 고등부
gen_page next-generation young-adult 청년부
gen_page next-generation english 영어예배부

gen_layout news NewsLayout
gen_page news announcements 주일광고
gen_page news bulletin 주보
gen_page news garden '성복의 뜰'
gen_page news album 교회앨범

gen_layout resources ResourcesLayout
gen_page resources sunday-sermon '주일 설교 시트지'
gen_page resources series-sermon '시리즈 설교 시트지'
gen_page resources seasonal-sermon '가정·명절·절기 설교 시트지'
```

- [ ] **Step 4: 단일 페이지 `/location` (layout 없음 — SectionShell 직접 사용)**

`src/app/location/page.tsx`:
```tsx
import { PagePlaceholder } from '@/shared/components/layout/PagePlaceholder';
import { SectionShell } from '@/shared/components/layout/SectionShell';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '찾아오시는 길 | 성복교회' };

export default function Page() {
  return (
    <SectionShell section="location">
      <PagePlaceholder />
    </SectionShell>
  );
}
```

- [ ] **Step 5: `/worship/sunday` 는 기존 설교 목록을 그대로 렌더 (placeholder 아님)**

`src/app/worship/sunday/page.tsx` 를 아래로 **덮어쓴다** (Step 3가 만든 placeholder 버전 대체):
```tsx
import PlaylistPagination from '@/domains/worship-video/components/widgets/PlaylistPagination';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '주일예배 | 성복교회' };

// 기존 /worship-video 의 설교 목록을 그대로 옮김. 4분류 재설계는 작업 패키지 B.
export default function Page() {
  return <PlaylistPagination />;
}
```

- [ ] **Step 6: 옛 라우트 삭제**

Run: `rm -r src/app/worship-video`
(`src/domains/worship-video/` 도메인은 **삭제하지 않는다** — Step 5가 쓴다.)

- [ ] **Step 7: 포맷 + 테스트 + 타입**

Run:
```bash
pnpm exec prettier --write "src/app/{about,worship,next-generation,news,resources,location}/**/*.tsx"
pnpm exec vitest run src/shared/config/siteNav.test.ts
pnpm typecheck
```
Expected: 정합성 31건 포함 전부 PASS, 타입 오류 없음

- [ ] **Step 8: 체크포인트** — 커밋 제안: `feat: 서브 라우트 골격 26개 + 섹션 레이아웃 5개 (worship-video → worship/sunday 이전)`

---

### Task 4: redirect (`next.config.ts`) + 홈 내부 링크 정규화

**Files:**
- Modify: `next.config.ts`
- Modify: `src/domains/home/components/widgets/RecentSermons/data.ts:24`
- Modify: `src/domains/home/components/widgets/RecentSermons/index.tsx:30,71`
- Modify: `src/domains/home/components/widgets/WorshipTimes/index.tsx:17`

**Interfaces:**
- Consumes: `buildRedirects` (Task 1)

> `buildRedirects`는 Task 1에서 단위 테스트됐다. 여기선 Next에 연결하고, 홈이 옛 경로(`/worship-video`)로 링크하던 4곳을 정식 경로로 바꿔 불필요한 redirect 홉을 없앤다. `/news`·`/next-generation`으로 가는 홈 링크는 redirect로 첫 하위에 도달하므로 **건드리지 않는다**(G 범위).

- [ ] **Step 1: `next.config.ts`에 redirect 연결**

```ts
import type { NextConfig } from 'next';
import { buildRedirects } from './src/shared/config/siteNav';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
      },
    ],
  },
  output: 'standalone',
  // 상위 메뉴 → 첫 하위, 레거시 경로 → 새 경로. 목록은 siteNav 에서 파생(siteNav.test.ts 가 검증).
  async redirects() {
    return buildRedirects();
  },
};

export default nextConfig;
```
(`next.config.ts`는 `@/` 별칭이 아니라 **상대 경로**로 import한다 — Next가 설정 파일을 컴파일할 때 tsconfig paths를 보장하지 않는다.)

- [ ] **Step 2: 홈 링크 4곳을 `/worship/sunday` 로**

- `RecentSermons/data.ts:24` → `export const ARCHIVE_HREF = '/worship/sunday';`
- `RecentSermons/index.tsx:30`, `:71` → `href="/worship/sunday"`
- `WorshipTimes/index.tsx:17` → `href="/worship/sunday"`

확인: `grep -rn "worship-video" src --include='*.tsx' --include='*.ts' | grep -v "domains/worship-video"` 결과가 비어 있어야 한다.

- [ ] **Step 3: dev 서버로 redirect·라우트 실동작 확인**

Run (dev 서버가 3005에 떠 있어야 한다. 없으면 `pnpm dev`를 백그라운드로):
```bash
for p in /about /worship /next-generation /news /resources /worship-video /map; do
  printf '%-18s ' "$p"; curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}\n' "http://localhost:3005$p"
done
for p in /about/pastor-emeritus /about/pastor /about/staff /about/training /about/history \
         /worship/guide /worship/sunday /worship/friday /worship/special /worship/weekday \
         /next-generation/infant /next-generation/kindergarten /next-generation/lower-elementary \
         /next-generation/elementary /next-generation/middle /next-generation/high \
         /next-generation/young-adult /next-generation/english \
         /news/announcements /news/bulletin /news/garden /news/album \
         /resources/sunday-sermon /resources/series-sermon /resources/seasonal-sermon /location; do
  printf '%-36s ' "$p"; curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:3005$p"
done
```
Expected: 상위 5개 + 레거시 2개는 `307 -> http://localhost:3005/<첫 하위>`; 26개 페이지는 전부 `200`.

- [ ] **Step 4: 체크포인트** — 커밋 제안: `feat: 상위→첫 하위·레거시 redirect 연결, 홈 설교 링크 /worship/sunday 로 정규화`

---

### Task 5: DockNav · SideMenu 를 `siteNav`로 교체, `NavigationMenu.tsx` 삭제

**Files:**
- Modify: `src/shared/components/layout/Header/DockNav.tsx`
- Modify: `src/shared/components/layout/Header/SideMenu.tsx` (import·데이터만)
- Delete: `src/shared/components/layout/Header/NavigationMenu.tsx`
- Test: `src/shared/components/layout/Header/DockNav.test.tsx`

**Interfaces:**
- Consumes: `siteNav`, `sectionHref`, `childHref`, `findSection` (Task 1)

> 외형·모션은 그대로. 바꾸는 것은 (1) 데이터 소스 (2) 드롭다운 하위 링크가 **자기 페이지**로 가게 (3) 활성 판정을 `findSection`으로. SideMenu는 A1에선 상위 6개 평면 유지 + 링크만 `sectionHref`(아코디언은 A2).

- [ ] **Step 1: 실패하는 렌더 테스트 작성**

`src/shared/components/layout/Header/DockNav.test.tsx`:
```tsx
import { DockNav } from '@/shared/components/layout/Header/DockNav';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ usePathname: () => '/about/pastor' }));
// 모바일 메뉴는 포털·아이콘 자산을 끌어와 이 테스트와 무관 — 격리한다.
vi.mock('@/shared/components/layout/Header/SideMenu', () => ({ SideMenu: () => null }));

// 회귀 잠금: 드롭다운 하위 링크가 상위 href 로 가던 버그(SUBMENUS 상수 시절).
describe('DockNav 링크', () => {
  it('상위 링크는 첫 하위 페이지로, 하위 링크는 자기 페이지로 간다', () => {
    render(<DockNav />);
    expect(screen.getByRole('link', { name: '교회소개' })).toHaveAttribute('href', '/about/pastor-emeritus');
    expect(screen.getByRole('link', { name: '담임목사' })).toHaveAttribute('href', '/about/pastor');
    expect(screen.getByRole('link', { name: '주일예배' })).toHaveAttribute('href', '/worship/sunday');
    expect(screen.getByRole('link', { name: '찾아오시는 길' })).toHaveAttribute('href', '/location');
  });

  it('하위가 없는 섹션은 드롭다운을 그리지 않는다', () => {
    render(<DockNav />);
    // 교회소개 드롭다운엔 5개, 찾아오시는 길은 상위 링크 1개뿐
    expect(screen.getAllByRole('link', { name: /원로목사|담임목사|섬기는 이들|양육·훈련|연혁/ })).toHaveLength(5);
    expect(screen.getAllByRole('link', { name: '찾아오시는 길' })).toHaveLength(1);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm exec vitest run src/shared/components/layout/Header/DockNav.test.tsx`
Expected: FAIL — `담임목사` 링크의 href가 `/about`(현재 버그) 또는 `교회소개` href가 `/about`

- [ ] **Step 3: DockNav 수정**

`DockNav.tsx` 변경점만:
```tsx
// import 교체
- import { menuItems } from '@/shared/components/layout/Header/NavigationMenu';
+ import { childHref, findSection, sectionHref, siteNav } from '@/shared/config/siteNav';

// SUBMENUS 상수(주석 포함 11~19행) 삭제

// 활성 인덱스
- const activeIdx = menuItems.findIndex((m) => pathname.startsWith(m.href));
+ const activeSlug = findSection(pathname)?.slug;
+ const activeIdx = siteNav.findIndex((s) => s.slug === activeSlug);

// 메뉴 렌더
- {menuItems.map((item, i) => {
-   const subs = SUBMENUS[item.href] ?? [];
+ {siteNav.map((item, i) => {
+   const subs = item.children ?? [];
    ...
-   <div key={item.href} ...>
+   <div key={item.slug} ...>
-     <Link href={item.href} ...>{item.children}</Link>
+     <Link href={sectionHref(item)} ...>{item.label}</Link>
    ...
-     {subs.map((s) => (
-       <Link key={s} href={item.href} ...>
-         ...<span ...>{s}</span>
+     {subs.map((c) => (
+       <Link key={c.slug} href={childHref(item, c)} ...>
+         ...<span ...>{c.label}</span>
```
JSDoc의 "서브메뉴 — IA 미확정으로 잠정" 주석도 함께 삭제한다(더 이상 사실이 아님).

- [ ] **Step 4: SideMenu 수정 (데이터만)**

```tsx
- import { menuItems } from '@/shared/components/layout/Header/NavigationMenu';
+ import { sectionHref, siteNav } from '@/shared/config/siteNav';
...
- {menuItems.map((item, index) => (
-   <li key={item.href}>
-     <Link href={item.href} ...>{item.children}</Link>
-     {index < menuItems.length - 1 && (
+ {siteNav.map((item, index) => (
+   <li key={item.slug}>
+     <Link href={sectionHref(item)} ...>{item.label}</Link>
+     {index < siteNav.length - 1 && (
```
`gray-*` 색은 **이번에 손대지 않는다**(A2에서 재작성). 변경 라인에 새 색 하드코딩이 없으므로 `design:lint --diff`를 통과한다.

- [ ] **Step 5: `NavigationMenu.tsx` 삭제**

Run: `rm src/shared/components/layout/Header/NavigationMenu.tsx`
확인: `grep -rn "NavigationMenu'" src` 가 비어 있어야 한다 (`ui/navigation-menu.tsx`는 별개 파일 — 건드리지 않는다).

- [ ] **Step 6: 통과 확인**

Run:
```bash
pnpm exec vitest run src/shared/components/layout/Header
pnpm typecheck && pnpm lint
```
Expected: PASS (2 tests), 타입·린트 오류 없음

- [ ] **Step 7: 브라우저 확인 (Aside)**

dev 서버(3005)에서:
- 데스크톱 폭: 독 "교회소개" hover → 드롭다운 5개, "담임목사" 클릭 → `/about/pastor`에서 제목 "교회소개 / 담임목사", 독의 "교회소개"가 accent로 켜짐.
- `/worship/sunday`: 기존 설교 목록이 SectionShell 안에 렌더됨. 상단이 독에 가리지 않음.
- 모바일 폭(390px): 햄버거 → 상위 6개, "예배" 탭 → `/worship/guide` 이동 후 메뉴 닫힘.

- [ ] **Step 8: 체크포인트** — 커밋 제안: `refactor: DockNav·SideMenu 를 siteNav 로 교체, 드롭다운 하위 링크 연결, NavigationMenu 삭제`

---

### Task 6: ADR 0004 + 문서·메모리 갱신

**Files:**
- Create: `.md/decisions/0004-subpage-routing.md`
- Modify: `.md/README.md` (Decisions 목록, Specs 목록의 상태)
- Modify: `.md/specs/2026-10-10-site-nav-skeleton-design.md` (상태 필드)
- Modify: 메모리 `project_header_dock.md` ("서브메뉴 IA 잠정" → 확정)

- [ ] **Step 1: ADR 0004 작성**

`.md/decisions/0004-subpage-routing.md`:
```markdown
# ADR 0004: 서브페이지 라우팅 구조 — `/{section}/{page}` + 섹션 중첩 레이아웃

**상태**: 채택
**날짜**: 2026-10-10
**관련**: [specs/2026-10-10-site-nav-skeleton-design.md](../specs/2026-10-10-site-nav-skeleton-design.md), [meetings/2026-10-08-pastor-review.md](../meetings/2026-10-08-pastor-review.md)

## 배경

2026-10-08 담당 목사님 리뷰에서 5개 섹션의 하위 IA가 확정됐다(교회소개 5 · 예배 5 · 다음세대 8 · 교회소식 4 · 자료실 3 + 찾아오시는 길). 당시 사이트는 `/`와 `/worship-video`만 있었고, 독 드롭다운은 잠정 상수(`SUBMENUS`)에 박힌 라벨이 전부 상위 href로 연결돼 있었다. 하위 항목 26개를 어떤 단위로 페이지화하고, 메뉴와 라우트의 어긋남을 어떻게 막을지 정해야 했다.

## 결정

- **하위 메뉴 항목 1개 = 페이지 1개**, URL은 `/{section}/{page}` 영문 슬러그(예: `/about/pastor`).
- **섹션별 Next.js 중첩 레이아웃**(`app/{section}/layout.tsx`)이 공통 `SectionShell`을 감싸고, 각 `page.tsx`는 본문만 가진다.
- **상위 경로(`/about`)는 첫 하위로 redirect**(307). 레거시 `/worship-video → /worship/sunday`, `/map → /location`.
- **`src/shared/config/siteNav.ts`가 단일 소스** — 독·모바일 메뉴·레이아웃·redirect가 전부 여기서 파생되며, `siteNav.test.ts`가 모든 항목에 `page.tsx`가 존재함을 잠근다.
- 섹션 헤더에 사진 배너를 두지 않는다. 형제 탭 등 시각 구성은 A2 시안에서 확정한다.

## 대안 비교

| 대안 | 탈락 이유 |
|---|---|
| 섹션당 1페이지 + 앵커(`/about#pastor`) | 설교 목록(4분류·페이지네이션)·부서 8개·앨범처럼 자기 목록을 가진 콘텐츠가 한 페이지에 들어가지 않아 결국 섹션마다 구조가 갈린다 |
| 동적 라우트 `app/[section]/[page]`로 전부 처리 | B~F에서 페이지별 데이터 패칭·컴포넌트가 붙는 순간 하나의 page.tsx가 거대한 분기가 되거나 결국 쪼개게 된다 |
| 레이아웃 없이 페이지마다 `SectionShell` 직접 import | 26곳 반복, 한 곳 누락 시 섹션 안에서 틀이 사라지는 불일치 |

## 결과 / 영향

- 라우트 폴더 31개(레이아웃 5 + 페이지 26)가 생기지만 A1에서는 전부 3줄짜리 placeholder.
- 메뉴 항목 추가 절차: `siteNav`에 추가 → 테스트 실패 → `page.tsx` 생성. 역순 불가.
- 홈 `/`은 이 구조 밖(히어로 풀블리드 유지). `/nextgen-preview`는 시안 라우트로 별도 정리 대상.
- 미공개 사이트라 redirect는 전부 비영구(307). 공개 후 URL을 바꾸면 그때 영구 redirect를 검토한다.
```

- [ ] **Step 2: README 인덱스 갱신**

`.md/README.md`:
- 디렉토리 트리 `decisions/` 아래에 `0004-subpage-routing.md` 추가.
- "### Decisions" 목록에 추가:
  `- [0004-subpage-routing.md](decisions/0004-subpage-routing.md) — 2026-10-10 — 서브페이지를 `/{section}/{page}` 영문 슬러그 + 섹션 중첩 레이아웃으로, `siteNav` 단일 소스에서 메뉴·라우트·redirect 파생`
- "### Specs" 항목 끝에 ` · **A1 구현 완료**, A2 시안 대기` 추가. 구현 계획 링크 추가: `(구현 계획: [-a1-plan.md](specs/2026-10-10-site-nav-skeleton-a1-plan.md))`

- [ ] **Step 3: 스펙 상태 갱신**

`.md/specs/2026-10-10-site-nav-skeleton-design.md` 상단:
`**상태**: A1 구현 완료 (2026-10-XX) → A2 시안 라운드 대기` (XX는 실제 날짜)

- [ ] **Step 4: 메모리 갱신**

`/Users/jiohyeon/.claude/projects/-Users-jiohyeon-Desktop-private-sungbok-web/memory/project_header_dock.md`의 "잠정 (확정 아님)" 절을 다음으로 교체:
```
**확정 (2026-10-10, A1)**: 서브메뉴 IA는 `src/shared/config/siteNav.ts` 단일 소스로 확정(ADR 0004). 26개 서브 라우트 실존, 드롭다운 하위 링크는 각자 페이지로. `NavigationMenu.tsx` 삭제됨. SideMenu 아코디언·SectionShell 시각은 A2 시안(`section-shell-preview`) 대기.
```
`MEMORY.md`의 해당 줄 hook도 "서브메뉴 IA는 잠정" → "서브메뉴 IA 확정(ADR 0004), A2 시안 대기"로.

- [ ] **Step 5: 최종 전체 검증**

Run:
```bash
pnpm test && pnpm typecheck && pnpm lint && pnpm design:lint --diff
```
Expected: 전부 통과.

- [ ] **Step 6: 체크포인트** — 커밋 제안: `docs: ADR 0004 서브페이지 라우팅 구조 + 인덱스·스펙 상태 갱신`

---

## 완료 조건 (스펙 §1 성공 기준 대응)

- [ ] 독 드롭다운 25개 + 찾아오시는 길, 모두 200 (Task 4 Step 3)
- [ ] 상위 5개 + 레거시 2개 redirect 307 (Task 4 Step 3)
- [ ] 모든 서브페이지가 SectionShell 안에서 섹션명·페이지명을 보여줌 (Task 2 테스트 + Task 5 Step 7)
- [ ] `siteNav` ↔ 라우트 정합성 테스트 GREEN (Task 3)
- [ ] `pnpm test` · `typecheck` · `lint` · `design:lint --diff` 통과 (Task 6 Step 5)
- [ ] ADR 0004 · README · 스펙 상태 · 메모리 갱신 (Task 6)
