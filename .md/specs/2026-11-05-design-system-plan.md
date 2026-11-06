# 디자인 시스템 + 모바일·태블릿 보완 — 구현 계획

> **실행 결과(2026-11-05)**: 12 태스크 완료(커밋은 사용자 지시 대기). 계획과 달라진 점:
> - 관리자 버튼 `sm`은 `lg` 이상 전용이고, 터치 기준은 1024 미만 폭에만 적용한다.
> - Badge는 `variant` prop이다.
> - 붓글씨는 `@fontsource`로 넣는다(`next/font/google` 대신).
> - duration 유틸은 `@utility`로 만든다.
> - 제목급(18px 이상) 임의 크기·연출 그림자·둥글기는 baseline으로 grandfather했다(시각 검토 때 이전).
> - 예배 시간표는 `lg` 미만에서 목록형이다.
> - `cn()`에 글자 크기 토큰을 등록했다(tailwind-merge 가 크기를 지우던 버그).
>
> 판단 근거는 ADR 0009와 진행 기록에 있다.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 공개 사이트와 앞으로 만들 관리자 화면이 같은 토큰과 같은 부품을 쓰게 한다. 또 375, 768, 1280 폭 어디서나 넘침, 작은 터치 영역, 작은 글씨가 없게 만든다.

**Architecture:** `globals.css`에 토큰을 2계층으로 둔다. B1 원시 토큰을 shadcn 의미 토큰이 가리키고, 그 위에 글자 크기, 그림자, 모션 토큰을 더한다. 부품은 `src/shared/components/ui/`에 shadcn 구조로 두고, dev 전용 `/design`에서 전부 보여 준다. 기준은 두 도구가 지킨다. `design:lint`(정적, 임의 값 차단)와 `design:audit`(CDP로 기기를 흉내 내 실제 렌더를 측정)이다.

**Tech Stack:** Next.js 15.3 App Router, React 19, Tailwind 4(`@theme inline`), shadcn/ui(new-york) + Radix, Vitest + Testing Library, Node 24(`.ts` 타입 제거 실행), 로컬 Chrome(CDP), pnpm

**Spec:** [2026-11-05-design-system-design.md](2026-11-05-design-system-design.md) — §5.1 토큰 계층, §5.2 타이포, §5.3 둥글기·그림자·모션, §5.4 폰트, §5.5 반응형 기준, §5.6 부품, §5.7 `/design`, §5.8 lint·audit, §5.9 기존 화면 보완, §6 성공 기준, §7 문서

## Global Constraints

- **git**: 스테이징, 커밋, 푸시는 **사용자가 지시할 때만** 한다(CLAUDE.md). 각 태스크 끝의 "체크포인트"는 변경을 보고하고 멈추는 지점이지 커밋이 아니다. 커밋 지시가 오면 `git-commit-jwkim` 스킬을 따른다(일감번호 먼저 확인, `feature/<번호>_<슬러그>` 브랜치).
- **기존 원시 토큰** `--color-b1-*` 13개의 **이름과 값은 바꾸지 않는다**.
- `b1-sunday`는 주일 강조 전용이다. 오류색으로 재사용하지 않는다.
- **기준 폭**: 375 / 768 / 1280, 헤더는 1024도.
- **터치 영역**: 44×44px 이상. 문단 안 글 링크는 예외. 관리자 표 안의 `Button size="sm"`(36px)은 `md` 이상에서만 쓴다.
- **최소 글씨**: 한글 13px, 본문 16px, 입력칸 16px. 한글이 없는 `eyebrow`는 12px까지 허용.
- **대비**: 흰 배경 위 텍스트는 4.5:1 이상.
- **반목표**:
  - 의도한 보완(§5.9) 말고는 바뀌기 전과 후 화면이 같아야 한다.
  - 연출 위젯(HomeLead, HomeHero, 사진 띠, 부채, 턴테이블, 쇼케이스)은 토큰만 지키고 형태는 바꾸지 않는다.
- **모션**: DESIGN.md §3을 따른다. transform과 opacity만 쓰고, 새 부품의 열고 닫는 애니메이션에도 `prefers-reduced-motion` 가드를 둔다.
- **TDD(로직 한정)**: camelCase `.ts` 로직 파일은 형제 테스트를 **먼저** Write한다. `.claude/hooks/tdd-guard.sh`가 차단한다. 부품과 스타일은 테스트를 강제하지 않는다.
- **명령**: `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm design:lint`, `pnpm design:audit`(Task 1 이후). 개발 서버는 `pnpm dev`(포트 3005).
- **외과적 변경**: 이 계획이 명시하지 않은 파일은 건드리지 않는다. 프리뷰 코드(`*-preview/`, `_variants/`)는 범위 밖이다.

## Review Focus

1. **audit가 특정 페이지에서 멈춘다.** 지난 점검에서 `/next-generation/infant` 768px 캡처가 끝나지 않았다. 페이지 하나가 멈추면 그 라우트를 `timeout` 위반으로 보고하고 다음으로 넘어가야 한다. → Task 1 `withTimeout` 테스트
2. **입력칸 글씨 16px 미만**은 아이폰에서 화면을 확대시킨다. 입력 부품을 손보다 `text-sm`으로 돌아가는 회귀를 잡아야 한다. → Task 1 `judgeFontSizes`의 input 규칙 테스트
3. **1024px 헤더**: PC 메뉴 6개와 로고가 1024에서도 한 줄이어야 한다("찾아오시는 길" 줄바꿈 재발 금지). → Task 1 audit 폭에 1024 포함, Task 10 확인
4. **긴 한글 라벨**("금요 생수의 강·월삭예배", "가정·명절·절기 설교 시트지")이 375에서 탭, 배지, 버튼을 넘치게 하면 안 된다. → Task 8 `/design`에 긴 라벨 예시를 두고 audit로 확인
5. **키보드 focus 링**: 토큰을 다시 연결한 뒤에도 모든 부품에서 focus 링이 보여야 한다(`ring` = b1-accent, DESIGN.md §5). → Task 5, 6, 7 수동 확인 단계

---

### Task 1: 반응형 점검 도구 `design:audit` + 바뀌기 전 기준 캡처

토큰을 건드리기 **전에** 만든다. 바뀌기 전 화면을 캡처해 두어야 성공 기준 6(전후 비교)을 확인할 수 있기 때문이다. 스펙 §8의 권장 순서와 다르지만 이 이유로 앞으로 당겼다.

**Files:**
- Create: `src/shared/lib/designAudit.ts`, `src/shared/lib/designAudit.test.ts`
- Create: `scripts/design-audit.mjs`
- Modify: `src/shared/components/layout/PagePlaceholder/index.tsx`(`<p>`에 `data-page-placeholder` 속성 추가)
- Modify: `package.json`(`"design:audit": "node scripts/design-audit.mjs"`), `.gitignore`(`/.design-audit/`)

**Interfaces:**
- Produces (`designAudit.ts`, import 없는 순수 모듈):
  - `type TargetInfo = { label: string; tag: string; role: string | null; inParagraph: boolean; width: number; height: number }`
  - `type TextInfo = { text: string; fontSizePx: number; isFormControl: boolean }`
  - `type Violation = { kind: 'overflow' | 'touch' | 'font' | 'timeout'; detail: string }`
  - `judgeOverflow(innerWidth: number, scrollWidth: number): Violation[]`
  - `judgeTouchTargets(targets: TargetInfo[], minPx = 44): Violation[]`
  - `judgeFontSizes(texts: TextInfo[]): Violation[]`
  - `hasHangul(s: string): boolean`
  - `withTimeout<T>(p: Promise<T>, ms: number): Promise<T | 'timeout'>`
- Produces (`design-audit.mjs`): `pnpm design:audit [--widths 375,768,1024,1280] [--routes /,/about/staff]`. 환경변수는 `AUDIT_BASE_URL`(기본 `http://localhost:3005`), `CHROME_PATH`(기본 macOS Chrome 경로). 캡처는 `.design-audit/<폭>/<라우트를 -로 이은 이름>.png`에 저장한다. 위반이 있으면 exit 1.

- [ ] **Step 1: 실패 테스트 작성** — `designAudit.test.ts`
  - `judgeOverflow(375, 383)` → `[{ kind: 'overflow', detail: contains '383' }]`, `judgeOverflow(375, 375)` → `[]`, `judgeOverflow(375, 376)` → `[]`(1px 반올림 오차 허용, `scrollWidth > innerWidth + 1`일 때만 위반)
  - `judgeTouchTargets([{label:'메뉴 열기',tag:'button',role:null,inParagraph:false,width:22,height:22}])` → 1건. 44×44는 0건. `inParagraph: true`인 22px `a`는 0건. `width: 0`(숨김)은 0건
  - `judgeFontSizes`: `{text:'예루살렘성전 3F', fontSizePx:11}` → 1건. 13 → 0건. `{text:'● WORSHIP', fontSizePx:12}` → 0건. `{text:'WORSHIP', fontSizePx:11}` → 1건. `{text:'', ...}` → 0건. **`{text:'이름', fontSizePx:14, isFormControl:true}` → 1건, 16 → 0건**(Review Focus 2)
  - `hasHangul('주일')` true, `hasHangul('3F')` false
  - `withTimeout(new Promise(()=>{}), 10)` → `'timeout'`, `withTimeout(Promise.resolve(1), 10)` → `1`(Review Focus 1)
- [ ] **Step 2: RED 확인** — `pnpm test src/shared/lib/designAudit.test.ts` → 모듈이 없어서 FAIL
- [ ] **Step 3: `designAudit.ts` 구현.** 한글 판정은 `/[가-힣ㄱ-ㆎ]/`. 글씨 기준: 입력칸 16, 한글 13, 그 외 12.
- [ ] **Step 4: GREEN 확인** — 같은 명령 → PASS
- [ ] **Step 5: `scripts/design-audit.mjs` 작성.** 스크래치에서 검증한 방식(`/private/tmp/claude-501/-Users-jaewon-Documents-church-sungbok-web/b1ae090f-e743-4601-b5a5-8f3db33c8771/scratchpad/cdpshot.mjs`)을 따른다. 그 파일이 없어져도 아래 내용만으로 만들 수 있다.
  - Chrome을 `--headless=new --remote-debugging-port`로 띄우고 Node 내장 `WebSocket`으로 CDP에 붙는다.
  - 폭마다 `Emulation.setDeviceMetricsOverride({width, height: 900, deviceScaleFactor: 1, mobile: width < 768})`. 1024 미만이면 `Emulation.setTouchEmulationEnabled`도 켠다.
  - **`--window-size`는 쓰지 않는다**(headless 창 최소 폭 500px 때문에 375 측정이 틀린다).
  - 라우트 목록: `import { sections, childHref, sectionHref } from '../src/shared/config/siteNav.ts'`(Node 24 타입 제거). 대상은 `/` + 모든 child href + 하위 없는 섹션 href. 로드 뒤 `[data-page-placeholder]`가 있으면 건너뛴다.
  - 라우트마다 `withTimeout(…, 20000)`으로 감싼다. 로드하고 4초 기다린 뒤 페이지 안에서 `TargetInfo[]`, `TextInfo[]`, `innerWidth`, `scrollWidth`를 모은다.
    - 터치 대상: 보이는 `a, button, [role=button], [role=tab]`. 문단 안 여부는 `closest('p')`.
    - 글씨: 직접 텍스트 노드를 가진 요소. 입력칸은 `input, textarea, select`.
  - judge를 적용하고, 그 페이지 맨 위 화면을 캡처한다.
  - 결과는 `폭 라우트 kind detail` 표로 출력한다.
- [ ] **Step 6: 실행 확인** — `pnpm dev`를 띄운 상태에서 `pnpm design:audit --widths 375 --routes /`. 기대 결과: overflow 1건(383)과 touch 위반이 보고되고 exit 1. 설계 §3의 실측과 같아야 한다.
- [ ] **Step 7: 바뀌기 전 기준 캡처** — `pnpm design:audit` 전체를 한 번 돌리고, `.design-audit/`를 `.design-audit-before/`로 복사해 둔다(gitignore에 함께 추가). 위반 목록 전체를 `.design-audit-before/report.txt`로 저장한다.
- [ ] **Step 8: 체크포인트** — `pnpm test`, `pnpm typecheck` 통과를 확인하고, 바뀌기 전 위반 개수를 보고한 뒤 멈춘다.

---

### Task 2: 의미 토큰 연결 + 상태 색 + 대비 함수

**Files:**
- Create: `src/shared/lib/contrast.ts`, `src/shared/lib/contrast.test.ts`
- Create: `tests/design/tokens.test.ts`
- Modify: `src/app/globals.css`(`:root` 의미 토큰, `@theme inline` 상태 색, `.dark`, `chart`, `sidebar` 정리), `@custom-variant dark` 줄 삭제
- Modify: `dark:` 클래스가 있는 5곳(`grep -rn "dark:" src`)에서 `dark:` 유틸만 지운다
- Modify: `.md/design/color-palette.md`(의미 토큰 연결표, 상태 색 6개와 대비값)

**Interfaces:**
- Produces: `contrastRatio(fg: string, bg: string): number` — `#rgb`나 `#rrggbb`, WCAG 2.x 상대 휘도 공식, 소수 둘째 자리에서 반올림하지 않은 원값
- Produces (CSS): `--color-b1-success`, `--color-b1-success-soft`, `--color-b1-warning`, `--color-b1-warning-soft`, `--color-b1-danger`, `--color-b1-danger-soft` → 유틸 `text-b1-danger`, `bg-b1-danger-soft` 등. shadcn 변수(`--primary` 등)는 `var(--color-b1-*)`나 `#fff`를 가리킨다.

- [ ] **Step 1: 실패 테스트** — `contrast.test.ts`: `contrastRatio('#000000','#ffffff')`는 21에 가깝다(`toBeCloseTo(21, 1)`). `('#fff','#fff')` → 1. `('#2563eb','#ffffff')` → `toBeCloseTo(5.17, 1)`. 인자 순서가 바뀌어도 같은 값.
- [ ] **Step 2: RED** — `pnpm test src/shared/lib/contrast.test.ts` → FAIL
- [ ] **Step 3: `contrast.ts` 구현** → **Step 4: GREEN**
- [ ] **Step 5: 실패 테스트** — `tests/design/tokens.test.ts`: `src/app/globals.css`를 문자열로 읽어서 확인한다.
  - (a) `:root` 안의 `--primary`, `--ring` 값이 `var(--color-b1-accent)`
  - (b) `--border`, `--input` 값이 `var(--color-b1-border)`
  - (c) `--destructive` 값이 `var(--color-b1-danger)`
  - (d) `--muted-foreground` 값이 `var(--color-b1-sub)`
  - (e) `.dark {` 블록과 `oklch(`이 없다
  - (f) 상태 색 6개가 정의돼 있다
  - (g) `success`, `warning`, `danger` 글자색의 `contrastRatio(값, '#ffffff') >= 4.5`
  - (h) 원시 토큰 13개의 값이 지금 값과 같다(`--color-b1-accent: #2563eb` 등, 현재 값을 테스트에 박는다)
- [ ] **Step 6: RED** — `pnpm test tests/design/tokens.test.ts` → FAIL
- [ ] **Step 7: `globals.css` 수정.** 연결표는 설계 §5.1 그대로이고, `--radius`는 `0.625rem`을 유지한다. 상태 색 값은 B1 톤에서 고르되 (g)를 만족해야 한다(만드는 사람이 결정). → **Step 8: GREEN**
- [ ] **Step 9: 화면 확인** — `pnpm design:audit` 뒤 `.design-audit-before/`와 캡처를 비교한다. shadcn 부품을 쓰는 6개 파일(`grep -rl "components/ui/" src`)만 회색이나 검정에서 B1 톤으로 바뀌고, 나머지는 같아야 한다.
- [ ] **Step 10: 체크포인트** — `pnpm test`, `pnpm typecheck`, `pnpm build` 통과를 확인하고 보고한 뒤 멈춘다.

---

### Task 3: 글자 크기, 그림자, 모션 토큰 정의 (아직 적용하지 않음)

**Files:**
- Modify: `src/app/globals.css`(`@theme inline`)
- Modify: `tests/design/tokens.test.ts`
- Create: `.md/design/design-system.md`(살아있는 문서의 뼈대: 토큰 표 → 이후 태스크에서 부품, `/design` 절 추가)

**Interfaces:**
- Produces (Tailwind 유틸):
  - 글자: `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-title`, `text-body`, `text-body-sm`, `text-label`, `text-caption`, `text-eyebrow`
  - 그림자: `shadow-sm`, `shadow-md`, `shadow-lg`(기본값을 B1 값으로 덮어씀)
  - 모션: `duration-fast`, `duration-base`, `duration-slow`, `ease-standard`
- 값:

| 토큰 | 크기 | 줄 간격 / 굵기 |
|---|---|---|
| display | `clamp(36px, 7vw, 54px)` | 1.15 / 700 |
| h1 | `clamp(30px, 5vw, 40px)` | 1.2 / 700 |
| h2 | `clamp(24px, 4vw, 36px)` | 1.25 / 700 |
| h3 | 20px | 1.4 / 600 |
| title | 17px | 1.5 / 600 |
| body | 16px | 1.8 |
| body-sm | 15px | 1.7 |
| label | 14px | 1.4 / 500 (버튼, 탭, 배지 전용. 본문 금지) |
| caption | 13px | 1.5 |
| eyebrow | 12px | 1.2 / 600, letter-spacing 0.08em (라틴 전용) |

  `--text-<이름>--line-height`, `--text-<이름>--font-weight` 형식으로 묶는다.
  - 모션: fast 150ms, base 250ms, slow 400ms, `--ease-standard: cubic-bezier(0.16, 1, 0.3, 1)`(DockNav가 쓰는 곡선)
  - 그림자 3단계 값은 기존 `shadow-[…]` 17곳 중 많이 쓰인 값을 골라 정한다(만드는 사람이 결정)

  ※ 스펙 §5.2 표에 없는 `label`(14px)을 추가했다. 지금 `text-[14px]` 29곳이 버튼과 탭에 몰려 있어서, 15px로 올리면 반목표(눈에 띄는 변화)에 걸린다.

- [ ] **Step 1: 실패 테스트** — `tokens.test.ts`에 추가: 위 10개 `--text-*`가 정의돼 있다. `--text-caption: 13px`, `--text-body: 16px`. 모션 4개와 그림자 3개가 정의돼 있다.
- [ ] **Step 2: RED** → **Step 3: `globals.css`에 추가** → **Step 4: GREEN**
- [ ] **Step 5: `design-system.md` 작성** — 위 표와 "연출 위젯은 토큰만, 형태 자유" 원칙, `label`이 본문 금지라는 규칙을 적는다.
- [ ] **Step 6: 체크포인트** — 아직 사용처가 없으니 화면 변화가 없어야 한다. `pnpm build` 통과를 보고한다.

---

### Task 4: 폰트 직접 제공

**Files:**
- Modify: `package.json`(`pnpm add pretendard`)
- Modify: `src/app/layout.tsx`
  - Pretendard CDN `<link>`, Google Fonts `<link>`과 preconnect 2줄을 삭제한다
  - `import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'`를 추가한다
  - `Geist`, `Geist_Mono`, `JetBrains_Mono`를 제거한다
  - `Nanum_Brush_Script`를 추가한다(`next/font/google`, `weight: '400'`, `preload: false`, `variable: '--font-brush'`)
- Modify: `src/app/globals.css`
  - `--font-sans`에서 `var(--font-geist-sans)`를 뺀다
  - `--font-mono: ui-monospace, SFMono-Regular, Menlo, monospace`로 바꾼다
  - `.b1-brush`의 `font-family`를 `var(--font-brush), cursive`로 바꾼다

**Interfaces:** Produces: CSS 변수 `--font-brush`

- [ ] **Step 1: 수정** — 위 세 파일을 고친다.
- [ ] **Step 2: 확인** — `pnpm build` 통과. `pnpm dev` 상태에서 `/`를 열었을 때 네트워크에 `cdn.jsdelivr.net`, `fonts.googleapis.com`, `fonts.gstatic.com` 요청이 0건이다(design-audit.mjs에 `Network.requestWillBeSent`로 외부 폰트 호스트를 세는 경고 출력을 추가해 확인).
- [ ] **Step 3: 화면 확인** — 표어 붓글씨와 본문이 `.design-audit-before/`와 같아 보인다. → **체크포인트**

---

### Task 5: 기존 shadcn 부품 정비 + features 래퍼 정리

**Files:**
- Modify: `src/shared/components/ui/{button,card,table,tabs,tooltip,pagination,navigation-menu}.tsx`
- Modify: `src/shared/components/features/{Pagination,Table,Tabs}/*`(새 부품 위로 맞춤. 이름이 겹치는 래퍼를 합칠지는 만드는 사람이 판단하되, 사용처의 import 경로가 깨지지 않게 한다)

**Interfaces:**
- Produces: `<Button variant="default|secondary|outline|ghost|destructive|link" size="sm|default|lg|icon">`
  - 높이: `sm` 36px(`md` 이상 전용), `default` 44px(`h-11`), `lg` 48px, `icon` 44×44
  - 글씨: `text-label`. 모든 `dark:` 유틸 제거
  - focus는 `focus-visible:ring-ring/50 ring-[3px]`를 유지(이제 B1 accent)
- Tabs 트리거와 Pagination 항목도 최소 44px

- [ ] **Step 1: 부품 수정** — 토큰 유틸(`text-label`, `shadow-sm`, `duration-fast`)로 바꾸고 높이를 맞춘다.
- [ ] **Step 2: 확인** — `pnpm typecheck`, `pnpm test`(기존 `renderPageNumbers.test.tsx`, `DockNav.test.tsx` 포함) 통과
- [ ] **Step 3: 수동 확인(Review Focus 5)** — 사용처 페이지에서 Tab 키로 이동하며 모든 버튼, 탭, 페이지 번호에 B1 focus 링이 보이는지 확인한다.
- [ ] **Step 4: 체크포인트**

---

### Task 6: 입력 부품 + FormField

**Files:**
- Create(shadcn CLI): `pnpm dlx shadcn@latest add input textarea select checkbox switch radio-group label` → `src/shared/components/ui/{input,textarea,select,checkbox,switch,radio-group,label}.tsx`
- Create: `src/shared/components/ui/form-field.tsx`

**Interfaces:**
- Produces: `<FormField label: string; htmlFor: string; help?: string; error?: string; required?: boolean; children: ReactNode>`
  - 라벨은 `text-label`, 도움말은 `text-caption text-b1-sub`, 오류는 `text-caption text-b1-danger`이고 `role="alert"`
  - `error`가 있으면 자식 입력칸에 `aria-invalid`와 `aria-describedby`를 연결한다
- 입력칸 공통: 높이 44px 이상, **글씨 `text-body`(16px), md 이상에서도 16px 유지**, 오류 테두리 `border-b1-danger`, 모든 `dark:` 제거

- [ ] **Step 1: CLI로 추가한 뒤 토큰에 맞게 수정**(CLI 기본 `text-sm`, `md:text-sm`을 반드시 제거 — Review Focus 2)
- [ ] **Step 2: FormField 작성**
- [ ] **Step 3: 확인** — `pnpm typecheck`. Task 8의 `/design`이 생긴 뒤 `pnpm design:audit --routes /design --widths 375`에서 font 위반 0(입력칸 16px)
- [ ] **Step 4: 수동 확인(Review Focus 5)** — 각 입력 부품의 focus 링과 오류 상태를 확인한다. → **체크포인트**

---

### Task 7: 겹침, 표시 부품 + ResponsiveList + ImageDropzone

**Files:**
- Create(shadcn CLI): `dialog sheet dropdown-menu sonner badge skeleton avatar`
- Create: `src/shared/components/ui/empty-state.tsx`, `src/shared/components/ui/responsive-list.tsx`, `src/shared/components/ui/image-dropzone.tsx`
- Create: `src/shared/lib/reorder.ts`, `src/shared/lib/reorder.test.ts`
- Modify: `src/app/globals.css` — `@media (prefers-reduced-motion: reduce)`일 때 `[data-state="open"], [data-state="closed"]`의 `animation-duration`과 `transition-duration`을 `0.01ms`로

**Interfaces:**
- `reorder<T>(items: readonly T[], from: number, to: number): T[]` — 새 배열을 돌려준다. 범위 밖 인덱스는 원본 복사본을 돌려준다.
- `<Badge tone="neutral|accent|success|warning|danger">`
- `<EmptyState title: string; description?: string; action?: ReactNode>`
- `<ResponsiveList<T> items: T[]; columns: { key: string; header: string; cell: (item: T) => ReactNode }[]; card: (item: T) => ReactNode; getKey: (item: T) => string>` — `md` 이상은 `<Table>`, 그 아래는 `card` 목록. 둘 다 렌더하고 CSS(`hidden md:block` / `md:hidden`)로 바꾼다.
- `<ImageDropzone value: { id: string; previewUrl: string }[]; onChange(next): void; onAddFiles(files: File[]): void; max?: number>` — UI만 담당한다. 여러 장 선택(`accept="image/*"`, `multiple`, 휴대폰 카메라 사용 가능), 미리보기 격자, 앞뒤 이동 버튼(`reorder` 사용, 44px), 삭제. 업로드와 축소는 하지 않는다.
- `Sheet`는 휴대폰에서 `side="bottom"`을 기본으로 쓴다(사용처에서 지정)

- [ ] **Step 1: 실패 테스트** — `reorder.test.ts`: `reorder(['a','b','c'],0,2)` → `['b','c','a']`. `reorder(['a','b','c'],2,0)` → `['c','a','b']`. `(…,1,1)` → 같은 순서의 **새 배열**(`not.toBe(원본)`). `(…,5,0)` → 원본과 같은 순서.
- [ ] **Step 2: RED** → **Step 3: 구현** → **Step 4: GREEN**
- [ ] **Step 5: CLI로 추가하고 부품 작성** — 토큰 유틸, 44px, `dark:` 제거, Toast는 `sonner`(`<Toaster>`는 아직 레이아웃에 두지 않는다. 패키지 2에서 둔다)
- [ ] **Step 6: 확인** — `pnpm typecheck`, `pnpm test`. reduced-motion에서 Dialog와 Sheet가 즉시 열리는지 DevTools 렌더링 에뮬레이션으로 확인한다. → **체크포인트**

---

### Task 8: 견본 페이지 `/design`

**Files:**
- Create: `src/app/design/page.tsx`, 필요하면 `src/app/design/_sections/*.tsx`(색, 글자, 둥글기·그림자·모션, 부품, 반응형 기준)
- Modify: `.md/design/design-system.md`(부품 목록, `/design` 안내 절)

**Interfaces:**
- Consumes: Task 2~7의 토큰, 부품, `contrastRatio`
- `page.tsx`: `if (process.env.NODE_ENV === 'production') notFound()`, `export const metadata = { title: '디자인 견본', robots: { index: false, follow: false } }`. `siteNav`에는 넣지 않는다.

- [ ] **Step 1: 페이지 작성** — 설계 §5.7의 다섯 묶음. 색 견본마다 흰 배경과 `b1-bg` 위 대비값(`contrastRatio`)을 표시한다. 부품은 상태별로(기본, hover, focus, disabled, 오류) 보여 주고, 묶음마다 코드 이름을 적는다.
- [ ] **Step 2: 긴 라벨 예시(Review Focus 4)** — Tabs에 "금요 생수의 강·월삭예배", "가정·명절·절기 설교 시트지", Badge와 Button에 15자 이상 라벨, ResponsiveList에 긴 제목 행을 둔다.
- [ ] **Step 3: 확인** — `pnpm design:audit --routes /design` 4개 폭에서 위반 0. `pnpm build && pnpm start` 뒤 `curl -s -o /dev/null -w "%{http_code}" localhost:3000/design` → `404`.
- [ ] **Step 4: 체크포인트** — 375와 1280 `/design` 캡처를 사용자에게 보여 주고 멈춘다(부품 모양을 확인받는 지점).

---

### Task 9: 기존 화면 글자 크기 이전

**Files:**
- Modify: `src/**/*.tsx` 중 프로덕션 파일(`*-preview/`, `_variants/` 제외)의 `text-[Npx]`, 그리고 `clamp` 글자 크기 6곳

**기본 대응표**(역할이 다르면 역할을 따른다):

| 지금 | → | 비고 |
|---|---|---|
| 10, 11, 12px 한글 | `text-caption`(13) | **의도한 변화** |
| 10, 11, 12px 라틴 대문자 머리표 | `text-eyebrow` | |
| 13 | `text-caption` | |
| 14 | `text-label`(버튼, 탭, 배지) / 본문이면 `text-body-sm` | 본문 14→15는 의도한 변화 |
| 15 | `text-body-sm` | |
| 16 | `text-body` | |
| 17 | `text-title` | |
| 20, 22 | `text-h3` | 22→20 |
| 28, 30, 36, 40 | `text-h2` / `text-h1` (섹션 제목 / 페이지 제목) | clamp |
| 54 및 표어용 clamp | `text-display` | |

연출 위젯 안에서 크기가 **연출의 일부**인 것(예: 턴테이블 위 숫자, 쇼케이스 캡션의 특수 크기)은 토큰이 안 맞으면 남기고, 같은 줄에 `/* design-lint-ignore: 연출 고유 크기 */`를 단다. 단 한글 13px 미만은 남기지 않는다.

- [ ] **Step 1: 도메인 하나씩 바꾼다**(home → about → worship → next-generation → news → shared). 도메인마다 `pnpm design:audit`로 font 위반이 줄었는지, 캡처가 `.design-audit-before/`와 비교해 의도한 변화만 있는지 확인한다.
- [ ] **Step 2: 확인** — `grep -rnE "text-\[[0-9.]+px\]" src --include='*.tsx' | grep -v -e '-preview/' -e '_variants/' | grep -v design-lint-ignore` → 0줄. audit font 위반 0.
- [ ] **Step 3: 체크포인트** — 2px 이상 바뀐 곳의 전후 캡처 목록을 보고한다.

---

### Task 10: 반응형 보완 (설계 §5.9)

**Files:**
- Modify: `src/domains/home/components/widgets/LocationMap/index.tsx:43`, `CommunityGallery/index.tsx:24`(문단 폭)
- Modify: `src/shared/components/layout/Header/DockNav.tsx`, `SideMenu.tsx`(`md:` → `lg:` 전환, 메뉴 버튼 44px)
- Modify: `src/domains/home/components/widgets/WorshipTimes/{index,desktop,mobile}.tsx`
- Modify: `src/domains/home/components/widgets/FirstVisit/RegisterPanel.tsx`(떠 있는 버튼) 및 홈 하단 여백
- Modify: `src/domains/next-generation/components/widgets/DepartmentPage/*`(1px 넘침)

- [ ] **Step 1: 375 넘침** — 두 문단의 `max-w-[360px]`가 부모 폭을 넘지 않게 한다(`w-full max-w-[360px]`이고, 부모 `shrink-0`이 원인이면 `min-w-0`). 확인: `pnpm design:audit --widths 375 --routes /` overflow 0.
- [ ] **Step 2: 첫 화면 메뉴 버튼이 안 보이는 원인 찾기** — `superpowers:systematic-debugging`으로 진행한다. 375에서 `scrollY=0`일 때 `document.elementFromPoint(버튼 중심)`이 버튼이 아니면 무엇이 덮는지(HomeLead의 z-index나 고정 레이어 의심), 아이콘이 배경과 같은 색인지 확인한다. 원인을 고친 뒤 같은 검사로 버튼이 맨 위에 있는지 확인한다.
- [ ] **Step 3: 헤더 전환** — DockNav의 `md:flex`, `md:block`, `md:px-…`를 `lg:`로, SideMenu의 `md:hidden`을 `lg:hidden`으로 바꾼다. 메뉴 버튼은 아이콘 22px 그대로 두고 터치 영역을 `size-11`(44px)로 넓힌다. DockNav.test.tsx가 클래스에 의존하면 함께 고친다.
- [ ] **Step 4: 예배 시간표 태블릿** — 768~1023에서 다음세대 카드를 격자로(좁은 한 줄 금지) 놓고, 아래 세 칸은 `md`에서 1열 또는 2열로 바꾸거나 시간과 이름을 위아래로 쌓는다. "월~금", "임마누엘성전 3F"가 **한 줄**에 들어가야 한다(`whitespace-nowrap`을 줄 단위로). 장소 글씨는 `text-caption text-b1-sub`.
- [ ] **Step 5: 떠 있는 새가족 버튼** — 버튼 높이와 여백만큼 홈 하단에 패딩을 더해 마지막 콘텐츠가 가려지지 않게 한다. 버튼도 44px 이상.
- [ ] **Step 6: 영아부 1px 넘침** — audit로 원인 요소를 찾아 고친다.
- [ ] **Step 7: 전체 audit** — `pnpm design:audit`(4개 폭, 모든 비-placeholder 라우트) → overflow, touch, font, timeout **0**. 남은 위반은 같은 방식으로 고친다. 고칠 수 없는 연출 요소는 사용자 확인을 받는 목록으로 보고한다.
- [ ] **Step 8: 화면 확인** — 768과 1024 헤더가 한 줄이고(Review Focus 3), 375 첫 화면에서 메뉴 버튼이 보인다. 전후 캡처를 비교한다. → **체크포인트**: 375, 768, 1280 홈과 영아부 캡처를 사용자에게 보여 준다.

---

### Task 11: 둥글기와 그림자 이전 + `design:lint` 확장

**Files:**
- Modify: 프로덕션 `*.tsx`의 `shadow-[…]` 17곳, `rounded-[…]` 6곳
- Modify: `scripts/design-lint.sh`
- Modify: `.design-lint-baseline`(형식 `파일<TAB>토큰`. 기존 hex 줄은 그대로 유효)
- Create: `tests/scripts/design-lint.test.ts`(`tests/hooks/auto-design-review.test.ts`처럼 임시 git 레포에 `CLAUDE_PROJECT_DIR`를 두고 `bash scripts/design-lint.sh` 실행)

**Interfaces:**
- 새 error 정규식(색 hex와 같은 취급): `text-\[[0-9.]+(px|rem)\]`, `shadow-\[[^]]+\]`, `rounded(-[trbl]{1,2})?-\[[^]]+\]`. 같은 줄에 `design-lint-ignore`가 있으면 면제.
- baseline 키는 `파일<TAB>위반 토큰 원문`(hex는 지금처럼 소문자 정규화).

- [ ] **Step 1: 실패 테스트** — `design-lint.test.ts`:
  - (a) 스테이징한 `src/x/A.tsx`에 `className="text-[11px]"` → `--diff` exit 1, 출력에 `text-[11px]`
  - (b) 같은 줄에 `design-lint-ignore` → exit 0
  - (c) `shadow-[0_2px_4px_rgba(0,0,0,.1)]` → exit 1
  - (d) `rounded-[28px]` → exit 1
  - (e) baseline에 `src/x/A.tsx<TAB>text-[11px]` → exit 0
  - (f) 기존 hex 규칙 회귀: `bg-[#ff0000]` → exit 1
  - (g) `src/app/nextgen-preview/x.tsx`의 위반 → exit 0
- [ ] **Step 2: RED** — `pnpm test tests/scripts/design-lint.test.ts` → (a), (c), (d), (e)가 FAIL
- [ ] **Step 3: 스크립트 수정** — `extract_hexes`를 위반 토큰 일반 추출로 넓히고, `in_baseline`을 토큰 원문 비교로 바꾼다(hex는 소문자). 출력 문구는 "토큰 규율 위반(하드코딩)"으로. → **Step 4: GREEN**
- [ ] **Step 5: 그림자와 둥글기 이전** — 그림자 17곳을 `shadow-sm|md|lg`로 바꾼다. 연출 고유 그림자(빛 번짐, 강한 색 그림자)는 ignore 주석으로 남긴다. 둥글기 6곳도 같은 방식이고, `rounded-[45px_0_45px_45px]` 같은 형태 연출은 ignore.
- [ ] **Step 6: baseline 갱신** — `pnpm design:lint --update-baseline`. 남은 항목은 이 패키지에서 해결하지 못한 레거시만이어야 한다(hex 3건 + 해소하지 못한 것). 개수를 보고한다.
- [ ] **Step 7: 확인** — `pnpm design:lint` 위반 0(baseline 제외), 전후 캡처 비교(그림자 미세 변화만). → **체크포인트**

---

### Task 12: 문서, ADR, 최종 검증

**Files:**
- Modify: `DESIGN.md`
  - §1: 의미 토큰 규칙("shadcn 의미 토큰은 B1을 가리킨다. 부품은 의미 토큰, 화면 연출은 B1 토큰")
  - §4: 글자 크기 단계와 `label` 본문 금지
  - **§7 반응형 신설**: 설계 §5.5 표 그대로, `pnpm design:audit` 사용법
  - 채점 노트에 audit 언급
- Modify: `.md/design/design-system.md`(최종), `.md/design/color-palette.md`(Task 2에서 했으면 확인만)
- Create: `.md/decisions/0009-design-system-tokens-responsive.md` — 토큰 2계층(원시→의미), 타이포 스케일(+label), 폰트 직접 제공, 반응형 기준, lint/audit. 대안은 Storybook, CDN 유지, 브레이크포인트 `md` 유지이고 각각 탈락 이유를 적는다.
- Modify: `.md/README.md`
  - 문서 목록: design-system.md, ADR 0009
  - 설계 스펙 상태: "구현 완료"
  - 코드↔문서 동기화 표에 `globals.css` 글자·그림자·모션 토큰 ↔ `design/design-system.md`, `src/shared/components/ui/*` ↔ `design/design-system.md`
- Modify: 설계 스펙 상태 줄, 이 계획 상단에 실행 결과 한 단락

- [ ] **Step 1: 문서 작성**
- [ ] **Step 2: 최종 검증**(설계 §6 기준 1~10)
  - `pnpm typecheck && pnpm test && pnpm lint && pnpm build && pnpm design:lint`
  - `pnpm design:audit`이 4개 폭에서 위반 0
  - 외부 폰트 요청 0
  - `/design`이 운영에서 404
  - 전후 캡처 비교(의도한 변화 목록과 일치)
- [ ] **Step 3: 디자인 QA** — `design-qa` 스킬(또는 `design-reviewer` 서브에이전트)로 변경 전체를 DESIGN.md 바에 비춰 점검하고, 🔴를 고친다. 승격 마일스톤이므로 gstack `/design-review` 라이브 감사를 사용자에게 제안한다.
- [ ] **Step 4: 체크포인트** — 결과를 보고하고 커밋 지시를 기다린다.
