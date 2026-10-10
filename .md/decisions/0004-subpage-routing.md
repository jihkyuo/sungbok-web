# ADR 0004: 서브페이지 라우팅 구조 — `/{section}/{page}` + 섹션 중첩 레이아웃 + 공통 머리 S1

**상태**: 채택
**날짜**: 2026-10-10
**관련**: [specs/2026-10-10-site-nav-skeleton-design.md](../specs/2026-10-10-site-nav-skeleton-design.md), [specs/2026-10-10-subpage-layouts-round2-analysis.md](../specs/2026-10-10-subpage-layouts-round2-analysis.md), [meetings/2026-10-08-pastor-review.md](../meetings/2026-10-08-pastor-review.md)

## 배경

2026-10-08 담당 목사님 리뷰에서 5개 섹션의 하위 IA가 확정됐다(교회소개 5 · 예배 5 · 다음세대 8 · 교회소식 4 · 자료실 3 + 찾아오시는 길). 당시 사이트는 `/`와 `/worship-video`만 있었고, 독 드롭다운은 잠정 상수(`SUBMENUS`)에 박힌 라벨이 전부 상위 href로 연결돼 있었다. 하위 항목 26개를 어떤 단위로 페이지화하고, 메뉴와 라우트의 어긋남을 어떻게 막으며, 서브페이지 윗부분을 어떤 모양으로 통일할지 정해야 했다.

## 결정

- **하위 메뉴 항목 1개 = 페이지 1개**, URL은 `/{section}/{page}` 영문 슬러그(예: `/about/pastor`).
- **섹션별 Next.js 중첩 레이아웃**(`app/{section}/layout.tsx`)이 공통 머리 `SectionShell`을 감싸고, 각 `page.tsx`는 본문만 가진다.
- **상위 경로(`/about`)는 첫 하위로 redirect**(307). 레거시 `/worship-video → /worship/sunday`, `/map → /location`.
- **`src/shared/config/siteNav.ts`가 단일 소스** — 독·모바일 메뉴·레이아웃·redirect가 전부 여기서 파생되며, `siteNav.test.ts`가 모든 항목에 `page.tsx`가 존재함을 잠근다.
- **공통인 것은 머리뿐(S1)**: 페이지명 64px + 형제 알약 15px(활성 accent) + hairline. 섹션명 eyebrow·사진 배너·브레드크럼 없음. **본문 레이아웃은 섹션(콘텐츠 유형)별로 각각 설계**한다 — 부서 페이지·설교 아카이브·인물 그리드·문서 목록은 구조가 다르다.
- 시각 위계: 독 = accent 알약 1개. 머리 알약 외의 서브 내비(모바일 메뉴 등)는 먹색/bold.

## 대안 비교

| 대안 | 탈락 이유 |
|---|---|
| 섹션당 1페이지 + 앵커(`/about#pastor`) | 설교 목록(4분류·페이지네이션)·부서 8개·앨범처럼 자기 목록을 가진 콘텐츠가 한 페이지에 들어가지 않아 결국 섹션마다 구조가 갈린다 |
| 동적 라우트 `app/[section]/[page]`로 전부 처리 | B~F에서 페이지별 데이터 패칭·컴포넌트가 붙는 순간 하나의 page.tsx가 거대한 분기가 되거나 결국 쪼개게 된다 |
| 레이아웃 없이 페이지마다 `SectionShell` 직접 import | 26곳 반복, 한 곳 누락 시 섹션 안에서 틀이 사라지는 불일치 |
| "공통 셸 + 본문 교체"(1라운드 A~E) | 콘텐츠 구조가 다른 페이지에 같은 본문 틀을 씌우는 것은 품질 포기. 사용자가 거부 |
| 머리 S2~S20 (좌우 분할·중앙·셀렉터·좌측 레일·틴트 밴드·인덱스·스티키 축소·설명문·서브독·사진 밴드·머리 없음·독 2단·스플릿·하단 서브독·연속 축소·세로쓰기·카드 레일·책장·독 모프) | 20종 라이브 비교 후 S1 채택. 독 바로 아래 붙는 서브 바(S6·S8·S10)는 독과 위계가 겹쳐 탈락 |

## 결과 / 영향

- 라우트 폴더 31개(레이아웃 5 + 페이지 26). 디자인이 있는 5개(`/about/pastor` `/about/staff` `/next-generation/english` `/worship/sunday` `/news/bulletin`)는 도메인 위젯으로 본문을 가지고, 나머지 21개는 "준비 중" 한 줄.
- `/worship/sunday`는 설교 아카이브 디자인(스탠드인 데이터)이다. 기존 유튜브 API 목록(`domains/worship-video`)은 B 작업에서 이 디자인에 연결한다.
- 메뉴 항목 추가 절차: `siteNav`에 추가 → 테스트 실패 → `page.tsx` 생성. 역순 불가.
- 홈 `/`은 이 구조 밖(히어로 풀블리드 유지). 시안 라우트(`*-preview`)는 모바일 메뉴 확정 후 정리.
- 미공개 사이트라 redirect는 전부 비영구(307). 공개 후 URL을 바꾸면 그때 영구 redirect를 검토한다.
