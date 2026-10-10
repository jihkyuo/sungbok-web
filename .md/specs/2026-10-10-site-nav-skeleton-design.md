# 스펙: 글로벌 IA·네비 골격 (작업 패키지 A)

**상태**: 승인 대기 → 승인 시 A1 구현 계획 작성 → A1 구현 → A2 시안 라운드 → 승격
**날짜**: 2026-10-10
**근거**: [회의록 2026-10-08](../meetings/2026-10-08-pastor-review.md) 결정 D1·D2·D4·D6·D7, 미결 O2
**후속 ADR**: 0004 (서브페이지 라우팅 구조) — 구현 시 작성

## 1. 목적과 성공 기준

**목적**: 회의에서 확정된 IA를 사이트 구조로 세운다 — 독 메뉴·드롭다운·모바일 메뉴·서브 라우트·서브페이지 공통 틀. 콘텐츠는 넣지 않는다(B~F 담당).

**성공 기준**
- 독·드롭다운·모바일 메뉴의 모든 항목이 실제 페이지로 이동한다(404 없음).
- 모든 서브페이지가 같은 틀(섹션 제목 · 현재 페이지 · 형제 탭)을 쓴다.
- 메뉴 정의와 라우트가 한 소스에서 나와, 어긋나면 테스트가 깨진다.
- 담임목사님께 "메뉴를 눌러가며" 사이트 구조 전체를 보여드릴 수 있다.

**사용자가 한 결정** (브레인스토밍, 2026-10-10)
- 상위 메뉴 6개 유지, 예배 하위 첫 항목으로 '예배 안내' 추가.
- 하위 메뉴 항목 1개 = 페이지 1개(1안). 섹션당 1페이지+앵커(2안) 기각.
- 콘텐츠 없는 페이지는 공통 틀 + "준비 중" 한 줄.
- 영문 슬러그, 상위 클릭 = 첫 하위로 redirect, `/map` → `/location`.
- 섹션 헤더에 사진 배너 없음, 형제 탭 둠.

## 1-1. 진행 순서 — 구조 먼저, 보이는 것은 시안으로

A는 성격이 다른 두 덩어리로 나눠 진행한다.

| 단계 | 내용 | 시안 필요? |
|---|---|---|
| **A1 구조** | `siteNav` · 라우트 골격 25+1 · redirect · `PagePlaceholder` · DockNav 데이터 교체(하위 링크 연결). SectionShell은 **임시 최소형**(제목 텍스트 + 상단 여백만)으로 두어 페이지가 열리게만 함 | ✕ — 시각 결정 없음 |
| **A2 시안** | SectionShell(섹션 헤더 + 형제 탭)과 SideMenu(모바일 아코디언)를 **프리뷰 라우트에서 변형 3~4개로 비교** → 사용자 선택 → 정식 승격 | ○ — [prototype-preview](../workflow/prototype-preview.md) 방식 |

A1이 먼저인 이유: 프리뷰는 "실제 페이지를 그대로 재현하고 대상 자리만 교체"해야 하는데(컨벤션 B), 서브 라우트가 있어야 그 실제 페이지가 생긴다. A1만으로도 담임목사님께 구조는 보여드릴 수 있다.

**A2 프리뷰 컨벤션 적용**
- 라우트: `src/app/section-shell-preview/page.tsx` — 실제 서브페이지(예: `/worship/sunday`, 본문이 있는 유일한 페이지)를 재현하고 셸 자리만 선택 시안으로 교체. 고정 탭바 + `?v=` 동기화.
- 변형: `src/shared/components/layout/SectionShell/_variants/` — `index.ts` 레지스트리, 0번 = A1의 임시 최소형(비교 기준). 변형은 **헤더 구성·탭 형태·여백 리듬이 서로 진짜 다르게**(예: 좌측 세로 목차형 / 상단 알약 탭형 / 제목-탭 일체 스티키형 등). 색만 다른 변주 금지.
- 모바일 메뉴 변형은 같은 프리뷰에서 뷰포트를 좁혀 확인(아코디언 / 2단 드릴다운 등 2종).
- 전용 포트: `pnpm preview`(3010부터 자동 탐색).
- 확정 후: 승자를 `SectionShell/index.tsx`로 승격, `_variants/`·프리뷰 라우트 삭제, gstack `/design-review` 라이브 감사(컨벤션 E).

## 2. 네비 정의 — 소스 오브 트루스

**파일**: `src/shared/config/siteNav.ts` (순수 데이터 + 파생 함수)

| 상위 (slug) | 하위 label → slug |
|---|---|
| 교회소개 `about` | 원로목사 `pastor-emeritus` · 담임목사 `pastor` · 섬기는 이들 `staff` · 양육·훈련 `training` · 연혁 `history` |
| 예배 `worship` | 예배 안내 `guide` · 주일예배 `sunday` · 금요 생수의 강·월삭예배 `friday` · 특별집회·행사 `special` · 수요·새벽·주일5부 `weekday` |
| 다음세대 `next-generation` | 영아부 `infant` · 유치부 `kindergarten` · 유년부 `lower-elementary` · 초등부 `elementary` · 중등부 `middle` · 고등부 `high` · 청년부 `young-adult` · 영어예배부 `english` |
| 교회소식 `news` | 주일광고 `announcements` · 주보 `bulletin` · 성복의 뜰 `garden` · 교회앨범 `album` |
| 자료실 `resources` | 주일 설교 시트지 `sunday-sermon` · 시리즈 설교 시트지 `series-sermon` · 가정·명절·절기 설교 시트지 `seasonal-sermon` |
| 찾아오시는 길 `location` | (하위 없음 — 단일 페이지) |

→ 서브페이지 25개 + 단일 페이지 1개.

**타입**
```ts
type NavChild = { label: string; slug: string };
type NavSection = { label: string; slug: string; children?: readonly NavChild[] };
export const siteNav: readonly NavSection[];
```

**파생 함수** (로직 → TDD 대상, `siteNav.test.ts` 형제)
- `sectionHref(section)` — 하위 있으면 첫 하위 경로, 없으면 `/{slug}`.
- `childHref(section, child)` — `/{section}/{child}`.
- `findSection(pathname)` — 경로 앞부분으로 섹션 판정(독 활성 표시·모바일 아코디언 초기 열림에 사용). 홈 `/`은 `undefined`.
- `findChild(pathname)` — 현재 하위 항목(섹션 헤더의 현재 페이지 이름·형제 탭 활성에 사용).

**교체·삭제**
- `NavigationMenu.tsx`의 `menuItems` → `siteNav`로 대체. 미사용 `NavigationMenu` 컴포넌트 포함 파일 삭제(이 변경으로 완전한 고아가 됨).
- `DockNav.tsx`의 `SUBMENUS` 상수 삭제.

## 3. 라우트와 redirect

**라우트 골격** (`src/app/`)
```
about/            layout.tsx + {pastor-emeritus,pastor,staff,training,history}/page.tsx
worship/          layout.tsx + {guide,sunday,friday,special,weekday}/page.tsx
next-generation/  layout.tsx + {infant,…,english}/page.tsx (8)
news/             layout.tsx + {announcements,bulletin,garden,album}/page.tsx
resources/        layout.tsx + {sunday-sermon,series-sermon,seasonal-sermon}/page.tsx
location/         page.tsx (layout 없음, 페이지가 SectionShell 직접 사용)
```
- 섹션 `layout.tsx`는 한 줄: `<SectionShell section="about">{children}</SectionShell>`.
- 각 `page.tsx`는 `<PagePlaceholder />` 렌더 + `metadata.title`(`"담임목사 | 성복교회"` 형식).

**redirect** (`next.config.ts`, 모두 permanent=false — 아직 미공개라 영구 캐시 피함)
| from | to |
|---|---|
| `/about` `/worship` `/next-generation` `/news` `/resources` | 각 첫 하위 |
| `/worship-video` | `/worship/sunday` |
| `/map` | `/location` |

- 기존 `src/app/worship-video/page.tsx`와 그 안의 `h-60` 스페이서는 삭제. `PlaylistPagination` 위젯(`domains/worship-video`)은 **삭제하지 않고** `worship/sunday/page.tsx`에서 그대로 렌더(B에서 재설계). 즉 `/worship/sunday`만 placeholder가 아니라 기존 설교 목록을 보여준다.
- `/nextgen-preview`는 시안 라우트라 이번 범위 밖(별도 정리).

## 4. SectionShell — 서브페이지 공통 틀

**파일**: `src/shared/components/layout/SectionShell/index.tsx`(서버) + `SiblingTabs.tsx`(클라이언트, `usePathname`).

> 아래 "구성"은 **A1의 임시 최소형이 보장할 정보 요소**이자 A2 시안의 출발 가설이다. 배치·형태(탭이 상단 가로인지, 좌측 세로인지, 스티키인지 등)는 A2 시안 라운드에서 결정하고, 확정안을 이 절에 반영한다.

**구성 (위→아래)**
1. 상단 여백 — fixed 독에 가리지 않는 높이. 현재 `/worship-video`의 `h-60` 역할을 흡수.
2. 섹션 헤더 — 섹션 label(큰 제목) + 현재 하위 label(작은 제목). 사진 배너 없음.
3. 형제 탭 — 하위 항목을 가로 알약 탭으로. 활성 = 독과 같은 accent 채움. 좁은 화면은 가로 스크롤(8개 부서 대응). 하위 없는 섹션은 생략.
4. 본문 컨테이너 — 좌우 패딩·최대 폭은 홈 섹션과 동일 값. `{children}`.

**규율**: 색·반경·폰트는 `b1-*` 토큰만. `prefers-reduced-motion` 외 모션 없음(정적 틀).

**모바일**: 제목 크기 축소, 탭 가로 스크롤. 별도 레이아웃 없음.

## 5. 독(DockNav)·모바일 메뉴(SideMenu)

**DockNav** — 외형 유지. 변경점만:
- 상위 링크 `href` = `sectionHref(section)`.
- 드롭다운 항목 `href` = `childHref(section, child)` (현재는 전부 상위 href → 버그 수준).
- 활성 판정 `findSection(pathname)`.

**SideMenu** — 재작성(형태는 A2 시안에서 확정, 아래는 출발 가설 = 아코디언).
- 상위 행: 하위 있으면 펼침 토글(⌄/›), 없으면 바로 링크.
- 현재 섹션은 열린 채 시작, 현재 페이지 accent 표시.
- 하위 링크 클릭 시 메뉴 닫힘(기존 동작 유지).
- 색을 `gray-*`에서 `b1-*` 토큰으로 교체(design-lint 통과 요건). 슬라이드 패널 형태·포털 구조 유지.

**Footer** — 변경 없음.

## 6. PagePlaceholder

`src/shared/components/layout/PagePlaceholder/index.tsx` — 문장 하나: "이 페이지는 준비 중입니다." 톤: 사실 진술만, 약속·환대 멘트 없음([카피 톤](../../DESIGN.md)). B~F에서 각 page.tsx가 이걸 본문으로 교체.

## 7. 검증

**단위 (RED → GREEN)** `src/shared/config/siteNav.test.ts`
- `sectionHref`: 하위 있는 섹션은 첫 하위, 없으면 자기 경로.
- `findSection`/`findChild`: `/worship/sunday` → 예배/주일예배, `/` → undefined, `/location` → 찾아오시는 길/undefined, 미등록 경로 → undefined.
- **라우트 정합성**: `siteNav`의 모든 (section, child)에 대해 `src/app/{section}/{child}/page.tsx`가 존재, 하위 없는 섹션은 `src/app/{section}/page.tsx` 존재. 메뉴만 추가하고 페이지를 빠뜨리면 실패.
- redirect 목록이 `siteNav`에서 파생되는지(상위 5개 + 레거시 2개).

**통합 (수동, 완료 조건)** dev 서버에서 Aside로:
- 독 드롭다운 25개 항목 각각 200 응답·올바른 제목.
- `/about` `/worship-video` `/map` redirect.
- 모바일 폭에서 아코디언 열림/닫힘·현재 페이지 표시.
- `pnpm design:lint --diff` · `pnpm typecheck` · `pnpm test` 통과.

## 8. 문서·메모리

- ADR 0004 작성: "서브페이지 라우팅 구조 — `/{section}/{page}` 영문 슬러그, 섹션 중첩 레이아웃, 상위→첫 하위 redirect". 대안(2안 앵커, 동적 라우트) 기각 사유 포함.
- `.md/README.md` 인덱스 갱신(ADR 0004, 이 스펙).
- `.md/domains/home.md` 변경 없음.

## 9. 범위 밖 (명시)

- 페이지 본문 콘텐츠 일체 (B~F)
- 섹션별 사진 배너 (필요 시 섹션 단위로 추가)
- 예배 시간표 표기 수정·대예배/주일학교 구분 (B)
- 홈 섹션 변경, 프리뷰 잔재(`VariantCombo`·`/nextgen-preview`) 정리 (G)
- 새가족 섹션의 메뉴화 (하지 않기로 결정 — 홈 독립 섹션 유지)
- 검색·사이트맵·SEO 메타(제목 외)
