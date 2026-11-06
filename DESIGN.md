# DESIGN.md — 성복교회 웹 디자인 바(bar)

이 파일은 **완성된 UI를 점검할 때의 채점 기준 정본**이다. 두 소비자가 읽는다:

1. gstack `/design-review` — 레포 루트에서 이 파일을 자동으로 찾아 "일반 기준" 대신 **이 바로** 채점한다.
2. 프로젝트 `design-qa` 스킬 / `auto-design-review` Stop 훅 — 변경된 UI를 이 바에 비춰 비평한다.

> 위치 주의: 프로젝트의 다른 문서는 모두 `.md/` 아래 있지만, 이 파일만 **루트에 둔 의도적 예외**다 — gstack이 루트 이름 고정으로만 탐색하기 때문. 토큰 수치 표는 여기 복제하지 말고 [.md/design/color-palette.md](.md/design/color-palette.md) 를 정본으로 본다.

채점 표기: 🔴 must-fix(바 위반) · 🟡 should-fix · 🔵 nit. 위반은 `파일:라인 — 문제 / 고칠 방향` 형태로.

---

## 1. 토큰 규율

- 색·폰트·반경은 [src/app/globals.css](src/app/globals.css) `@theme inline` 의 토큰을 Tailwind 유틸로 참조한다: `bg-b1-accent`, `text-b1-sub`, `border-b1-border` 등.
- **arbitrary 색 하드코딩 금지** — `text-[#…]`·`bg-[#…]`·`border-[#…]`·`fill-/stroke-/from-/to-/via-/ring-[#…]` 는 🔴. 정적 체크(`pnpm design:lint`)가 신규분을 잡는다.
- b1 팔레트(13토큰, 값은 color-palette.md): `bg`·`surface`·`text`·`sub`·`muted`·`border`·`accent`·`accent2`·`accent-soft`·`sunday`·`placeholder`·`placeholder-tone`·`glow`(서브페이지 머리 글로우 배경 장식 전용, 텍스트·UI 색 ❌). `sunday`(#dc2626)는 **주일 강조 포인트(워드마크·도트) 전용** — 일반 빨강으로 쓰면 🔴.
- **의미 토큰**: shadcn 부품(`src/shared/components/ui/*`)은 `bg-primary`·`border-input`·`ring-ring` 같은 의미 토큰을 쓰고, 의미 토큰은 B1 을 가리킨다(연결표는 color-palette.md). 부품에 B1 을 직접 박지 않고, 화면 연출에 의미 토큰을 끌어오지 않는다.
- **글자 크기·그림자·둥글기도 토큰**: `text-display~text-eyebrow`, `shadow-sm|md|lg`, `rounded-*`. 임의 값 `text-[Npx]`·`shadow-[…]`·`rounded-[…]` 신규는 🔴(`design:lint` 차단, 레거시는 baseline).
- 예외: 토큰이 없는 1회성 그림자/그라데이션 alpha(`shadow-[…rgba…]` 등)는 허용하되 `/* design-lint-ignore: 사유 */` 로 의도를 남긴다(🟡 경고 대상이지 차단 아님). 색을 토큰으로 표현할 수 있으면 토큰을 쓴다.

## 2. 카피 톤

- **사실 진술의 정중함**으로만 신뢰를 형성한다. 영업·약속·환대성 멘트("지금 바로 오세요!", "당신을 환영합니다!" 류)는 🔴.
- 자기 자랑·과장·감탄부호 남발 금지. 정보는 스캔되도록 짧게.
- 근거: [.md/decisions/0002-home-ia-and-tone.md](.md/decisions/0002-home-ia-and-tone.md).

## 3. 모션 바

- **transform / opacity 로만** 움직인다(레이아웃 속성 애니메이션 ❌ — jank·리플로우). 매끄럽지 않으면 후보 아님.
  - 예외: **1회성 등장 블러**(`filter: blur` → 0, ≤1.5s, 요소 수 소수, 마운트 1회)는 허용(toss.im 식 텍스트 등장, HomeHero). 스크롤 스크럽·연속·루프 블러는 여전히 ❌.
- 밝은 b1 브랜드에 맞는 톤. **다크/테크 톤·잔카(미세 떨림)·번쩍임은 🔴.**
- 등장·체류·이탈까지 설계한다(정지 상태만 보지 않음).
- **`prefers-reduced-motion: reduce` 가드 필수** — 스크롤 스크럽·Ken Burns·자동재생·무한 keyframe·연속 transform 은 reduced 시 정적 최종상태로 떨어져야 한다. 가드 없는 모션은 🔴(a11y).
- 근거: [.md/patterns/scroll-autoplay-intro.md](.md/patterns/scroll-autoplay-intro.md), 메모리 `feedback-hero-design-bar`.

## 4. 한글 타이포

- **글자 크기 단계**(.md/design/design-system.md): `display·h1·h2·h3·title·body(16)·body-sm(15)·label(14)·caption(13)·eyebrow(12)`. 한글 13px 미만 🔴. `label` 은 버튼·탭·배지 전용 — 본문에 쓰면 🟡. `eyebrow` 는 라틴 대문자 머리표 전용.
- 한글 가독성: `word-break: keep-all`(globals.css 전역). 단어 중간 줄바꿈이 보이면 🟡.
- 헤딩은 `text-wrap: balance`. 본문/헤딩 스케일은 `clamp()` 로 반응형 연속.
- 폰트는 토큰(`font-sans`=Pretendard, `font-mono`)만. 임의 폰트 인라인 ❌.

## 5. 접근성 (a11y)

- **대비**: 밝은 b1 배경 위 텍스트 — `text-b1-muted`(#8fa0b8)를 본문에 쓰면 대비 부족 위험(🟡~🔴, 크기·용도에 따라). 캡션/플레이스홀더 전용.
- **focus 가시성**: 인터랙티브 요소는 키보드 focus 링이 보여야 한다. `outline-none` 단독 사용 🔴.
- **대체 텍스트**: 의미 있는 이미지에 `alt`. 장식 이미지는 `alt=""`.
- **reduced-motion**: §3 참조.

## 6. Subtraction (절제)

- 픽셀값을 못 하는 요소는 제거한다. 장식 과잉·중복 정보·요청되지 않은 화려함은 🟡.
- "시니어 디자이너가 보면 과하다 할까?" → 그렇다면 덜어낸다.
- 시안 다양성: 같은 빌딩블록을 효과만 바꿔 리스킨한 것은 시안이 아니다(메모리 `feedback-avoid-templating`).

---

## 7. 반응형

| 기준 | 값 |
|---|---|
| 확인 필수 폭 | 375 · 768 · 1280 (헤더는 1024도) |
| 헤더 PC 메뉴 전환 | `lg`(1024). 그 아래는 메뉴 버튼 |
| 터치 영역 | 1024 미만 폭에서 44×44px 이상(문단 안 글 링크 제외). 보이는 크기가 작으면 패딩·`::before/::after` 가상 영역으로 |
| 최소 글씨 | 한글 13px · 본문 16px · **입력칸 16px**(작으면 아이폰이 확대) |
| 가로 넘침 | 0 — 위반은 🔴 |
| 떠 있는 버튼 | 콘텐츠를 가리지 않게 페이지 끝 여백 확보 |

- 확인 도구: `pnpm dev` 상태에서 `pnpm design:audit`(넘침·터치·글씨를 실제 렌더로 측정, `.design-audit/<폭>/` 캡처). 위반 0 이 승격 조건.
- 연출 위젯이 `window.innerWidth` 로 폭을 계산하면(HomeLead·TurntableStage 등) CSS 브레이크포인트와 따로 움직인다 — 768·1024 에서 반드시 확인.

## 채점 노트 (리뷰어용)

- **소스만 읽는 패스(design-qa)** 는 모션·대비를 *의심 제기*까지만 한다. 런타임 확정(실제 렌더·브레이크포인트·reduced-motion 동작)은 마일스톤의 라이브 감사(`/design-review`) 몫.
- 프리뷰 코드(`*-preview/`·`_variants/`)는 던져버릴 시안이라 **이 바의 차단 대상이 아니다** — 정식 위젯으로 승격된 코드만 본다.
- 반응형(§7)은 소스만으로 확정하지 않는다 — `pnpm design:audit` 결과를 근거로 한다.
- 문서·메모리가 코드 현실과 어긋나면 **현재 코드를 정본**으로 보고 어긋남을 보고한다.
