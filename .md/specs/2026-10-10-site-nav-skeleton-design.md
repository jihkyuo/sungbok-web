# 스펙: 글로벌 IA·네비 골격 (작업 패키지 A)

**상태**: **A1 구현 완료 + S1 승격 완료**(2026-10-10, ADR 0004). `siteNav` · 라우트 26 · redirect 7 · `SectionShell`(S1) · 독/모바일 메뉴 연결. 디자인 본문 5페이지 이식. 모바일 메뉴(M1/M2)·모바일 머리 세부는 미확정
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

## 4. SectionShell — 서브페이지 공통 머리 (확정: S1, 2026-10-10)

**파일**: `src/shared/components/layout/SectionShell/index.tsx` — 단일 클라이언트 컴포넌트(`usePathname` 으로 현재 하위 판정). 서버 layout → SectionShell → 서버 page children(RSC 페이로드) 구조. 시안 원본: `_variants/header/S1.tsx`.

**원칙 (2라운드에서 확정)**
- 공통인 것은 **머리(제목 + 형제 이동 + hairline)** 뿐이다. **본문 레이아웃은 섹션(콘텐츠 유형)별로 각각 설계**한다 — 부서 페이지·설교 아카이브·인물 그리드·문서 목록은 구조가 다르다. "공통 셸 + 본문 교체" 전제는 폐기. ([round2-analysis](2026-10-10-subpage-layouts-round2-analysis.md))
- 요소 하나하나가 정보 기능 또는 명확한 시각 의도를 가져야 한다. 섹션명 eyebrow(11px 모노)는 독이 이미 섹션을 표시하므로 **두지 않는다**.
- 글자 하한: 본문 16px · 보조 14px · 캡션 13px.
- 위계: **독 = accent 알약 1개**. 머리 알약은 S1 원안대로 accent 채움을 쓰되, 그 밖의 서브 내비(모바일 메뉴 등)는 먹색(`b1-text`)/bold로 독과 구분한다.

**S1 구성 (위→아래)** — 20종 비교 시트(`section-header-preview`, S1~S20)에서 선택
1. 상단 여백: 독 아래 40px (콘텐츠 시작 112px, md 128px). 1라운드의 240px 공백 제거.
2. 제목: **페이지명**(현재 하위 label) 64px / 1.05 / -0.03em bold. 하위 없는 섹션은 섹션명.
3. 형제 알약: 15px semibold, `px-4 py-2`, `gap-1.5`, 활성 = `bg-b1-accent text-white` + 그림자, 비활성 = `text-b1-sub`, hover `bg-b1-accent-soft`. 넘치면 줄바꿈(8개도 데스크톱 한 줄). 하위 없으면 행 생략.
4. hairline: `border-b1-border`, 위 40px / 아래 56px.
5. 진입 모션: 제목은 blur 12→0 + X −32→0(1500ms, EXPO, 형제 페이지 전환마다 `key={title}` 로 재생) → 알약은 Y 16→0 fade-up(블러 없음, 700ms, 제목 시작 300ms 뒤 50ms 간격, 마운트 1회). transform/opacity/filter 만. 스크롤 연동 없음(정적). reduced-motion 은 최종 상태. (2026-10-25 갱신)
6. 좌우: 본문과 **같은 패딩 래퍼**(`px-[6vw]` → `max-w-[1320px]`) 안에 둔다. 머리와 본문 hairline이 어긋나면 안 된다.

**머리에 들어가지 않는 것**: 섹션 설명문, 사진 배너, 브레드크럼, 숫자 인덱스. 페이지별 사실 정보(설교자·최신 호 날짜·교역자 수 등)는 **본문 첫 줄**에 둔다.

**모바일·태블릿 (2026-11-12 갱신, 머리 시안 A+)**: 위 1~4번 값은 데스크톱(lg 1024 이상)에만 그대로 둔다. lg 미만은 머리가 본문을 화면 절반 아래로 밀던 문제(휴대폰 본문 시작 427px)를 줄인다 — 휴대폰 약 211px.
- 상단 여백 84px(md 100px), 제목 30px(md 44px), hairline 위 18px·아래 24px(md 24·32px).
- 알약은 **한 줄 가로 스크롤**(손가락으로 밀기), 14px·높이 38px. 줄바꿈 두 줄은 공간을 너무 써서 버렸다.
- 휴대폰(md 미만)만 줄 양옆에 **이전·다음 꺾쇠**(배경 없는 작은 아이콘, 줄 바깥). 누르면 **바로 옆 형제 페이지로 이동**한다 — 줄을 미는 버튼이 아니다. 첫 메뉴엔 다음만, 마지막 메뉴엔 이전만. 태블릿은 알약이 다 보여 꺾쇠 없음.
- 활성 표시는 알약 뒤 파란 배경 하나(인디케이터)가 형제 이동 때 옆으로 미끄러진다(420ms). SectionShell 이 섹션 layout 에 있어 형제 이동에서 다시 마운트되지 않기 때문에 가능하다. 선택된 알약은 줄 가운데로 스크롤. JS 전(서버 HTML)에는 활성 알약이 직접 파란 배경을 칠한다. reduced-motion 이면 미끄러짐·부드러운 스크롤 없음.
- 구현: `SectionShell/SubNav.tsx`. 비교 시안: 머리 시안 아티팩트(지금·A·A-1~3·S1~S3·B·C → A+ 확정).

**예외**: 홈(`/`)은 이 레이아웃을 안 탐(히어로 풀블리드). `/location`은 하위가 없으니 `app/location/page.tsx`가 직접 `SectionShell`을 쓰고 알약 없이 제목만.

**적용 확인**: `section-shell-preview`의 B·F·G·H·I(담임목사·영어예배부·주일예배·섬기는 이들·주보)에 S1 적용, 본문 각자 구조 유지.

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
