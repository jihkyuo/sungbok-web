/**
 * 사이트 네비게이션 단일 소스.
 * 독(DockNav) 드롭다운 · 모바일 SideMenu · 섹션 레이아웃(SectionShell) · next.config redirect 가 전부 여기서 파생된다.
 * 항목을 추가하면 `src/app/{section}/{child}/page.tsx` 도 함께 만들어야 한다 — siteNav.test.ts 가 잠근다.
 * 근거: .md/specs/2026-10-10-site-nav-skeleton-design.md §2 · ADR 0004
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

// as const 유니온은 하위 없는 섹션에 children 키가 없어 접근이 막힌다 → 순회·탐색은 넓힌 타입으로.
// 컴포넌트에서 children 을 읽으며 순회할 땐 siteNav 대신 이걸 쓴다.
export const sections: readonly NavSection[] = siteNav;

export const sectionHref = (s: NavSection): string =>
  s.children?.length ? `/${s.slug}/${s.children[0].slug}` : `/${s.slug}`;

export const childHref = (s: NavSection, c: NavChild): string => `/${s.slug}/${c.slug}`;

// 쿼리·해시 제거 후 빈 세그먼트(끝 슬래시) 걸러낸 경로 조각
const segments = (pathname: string): string[] =>
  pathname.split(/[?#]/)[0].split('/').filter(Boolean);

export const findSection = (pathname: string): NavSection | undefined => {
  const [first] = segments(pathname);
  return first ? sections.find(s => s.slug === first) : undefined;
};

export const findChild = (pathname: string): NavChild | undefined => {
  const [first, second] = segments(pathname);
  if (!first || !second) return undefined;
  return sections.find(s => s.slug === first)?.children?.find(c => c.slug === second);
};

// 미공개 사이트라 영구(308) 캐시를 피한다 — 전부 permanent:false(307).
const LEGACY_REDIRECTS = [
  { source: '/worship-video', destination: '/worship/sunday' },
  { source: '/map', destination: '/location' },
] as const;

export const buildRedirects = () => [
  ...sections
    .filter(s => s.children?.length)
    .map(s => ({
      source: `/${s.slug}`,
      destination: sectionHref(s),
      permanent: false as const,
    })),
  ...LEGACY_REDIRECTS.map(r => ({ ...r, permanent: false as const })),
];
