# 작업 패키지 1: 디자인 시스템 + 모바일·태블릿 보완 — 설계

**상태**: 구현 완료 (2026-11-05) — 결정 기록 [ADR 0009](../decisions/0009-design-system-tokens-responsive.md) — 구현 계획: [2026-11-05-design-system-plan.md](2026-11-05-design-system-plan.md)
**날짜**: 2026-11-05
**선행 결정**: [ADR 0008](../decisions/0008-admin-backend-vercel-supabase.md) — 관리자 화면은 `sungbok-web` 안의 `/admin`에 두고, 공개 사이트와 같은 토큰과 부품을 쓴다.
**후속 패키지**: 2. 관리자 기반(Supabase, 로그인, 권한, `/admin` 화면 틀) → 3. 관리 기능과 기존 사이트 이전. 이 문서는 1번만 다룬다.

---

## 1. 의도

**어느 화면을 누가 만들어도 같은 사이트로 보이게 한다.** (사용자 표현: "일관된 디자인으로 만들려고")

곧 관리자 화면이라는 **두 번째 얼굴**이 생기고, 나중에는 다른 사람이 사이트를 넘겨받을 수 있다(ADR 0008). 그 전에 다음을 정해 둔다.
- "이 색, 이 크기, 이 버튼"을 매번 새로 고르지 않고 이름으로 고르게 한다.
- 휴대폰, 태블릿, PC 어디서나 제대로 동작하는 것을 **기본값**으로 만든다. 지금은 화면마다 따로 맞추고 있다.

## 2. 목표 / 비목표 / 반목표

**목표**
1. 색 토큰을 **한 벌**로 만든다. shadcn 의미 토큰을 B1 팔레트에 연결한다.
2. 글자 크기, 둥글기, 그림자, 모션을 **이름 붙인 단계**로 정한다.
3. 공개 사이트와 관리자 화면이 함께 쓰는 **공용 부품 세트**를 만든다.
4. 개발할 때만 열리는 **견본 페이지 `/design`** 를 만든다.
5. **반응형 기준**(세 가지 폭, 터치 영역, 최소 글씨)을 정하고, 이번 점검에서 찾은 기존 화면 문제를 고친다.
6. 이 기준을 **lint와 점검 스크립트로 지키게** 한다.

**비목표 (이번에 하지 않음)**
- 관리자 로그인, 권한, `/admin` 화면 틀(AdminShell) → 패키지 2
- 다크 모드
- Storybook, Figma 같은 외부 디자인 도구
- "준비 중" 페이지 채우기, 히어로나 쇼케이스 재설계

**반목표 (기술적으로 돌아가도 이렇게 되면 실패)**
- 공개 사이트의 연출(히어로, 사진 띠, 부채, 턴테이블 등)이 부품 틀에 끼워져 **찍어 낸 듯** 보이게 되는 것. 연출 위젯은 토큰(색, 폰트, 모션 시간)만 지키고 형태는 자유롭게 둔다.
- 관리자 화면이 **다른 사이트처럼** 보이는 것. 예를 들어 shadcn 기본 검정과 회색 그대로인 경우.
- 휴대폰에서 입력칸을 누르면 화면이 확대되는 것(입력 글씨가 16px보다 작은 경우).
- 토큰을 정리하다가 기존 화면이 **눈에 띄게 달라지는** 것. 의도한 보완(§5.9)을 빼면, 바뀌기 전과 후의 화면이 같아야 한다.

## 3. 현재 상태 (2026-11-05 실측)

| 항목 | 지금 | 문제 |
|---|---|---|
| 색 | B1 토큰 13개(`--color-b1-*`)와, 따로 노는 shadcn 의미 토큰(`--primary` 등, 기본 무채색) | shadcn 부품을 쓰면 검정과 회색이 나온다. `.dark` 블록도 있지만 쓰는 곳이 없다 |
| 글자 크기 | 토큰이 없다. 임의 값 15종 이상: `text-[11px]` 42곳, `text-[13px]` 40곳, `text-[15px]` 37곳, `text-[10px]` 29곳, `text-[14px]` 29곳 … (프리뷰 코드 포함) | 10~12px가 87곳으로 휴대폰에서 작다. 같은 역할인데 크기가 제각각이다 |
| 둥글기 | 대부분 Tailwind 단계(`rounded-full` 131, `2xl` 29 …), 임의 값 6곳(`28px`, `45px` 등) | 비교적 양호 |
| 그림자 | 임의 `shadow-[...]` 17곳 | 단계가 없다 |
| 폰트 | Pretendard Variable(jsDelivr CDN), Nanum Brush Script(Google CSS), Geist와 Geist Mono(대체용), JetBrains Mono(`font-mono` 사용처 0) | 외부 CDN에 의존한다. 쓰지 않는 폰트 3벌을 불러온다 |
| shadcn 부품 | `button`, `card`, `navigation-menu`, `pagination`, `table`, `tabs`, `tooltip` | Button 기본 높이가 36px(`h-9`)로 터치 영역 44px보다 작다. 입력칸, 대화상자 등은 없다 |
| lint | `design:lint` — 색 hex 하드코딩만 차단 | 글자 크기, 그림자, 둥글기 하드코딩은 잡지 못한다 |

**반응형 점검 결과** (CDP 기기 흉내로 캡처. headless 크롬은 창 최소 폭이 500px이라 `--window-size` 캡처는 쓸 수 없다)

| 폭 | 문제 | 위치 |
|---|---|---|
| 375 | 홈이 **8px 가로로 넘친다**(383px). `max-w-[360px]` 문단에 좌우 여백 24px이 더해진 것 | [LocationMap:43](../../src/domains/home/components/widgets/LocationMap/index.tsx), [CommunityGallery:24](../../src/domains/home/components/widgets/CommunityGallery/index.tsx) |
| 375 | 메뉴 버튼이 22×22px. **첫 화면(히어로 위)에서는 보이지 않고** 스크롤해야 나타난다(원인 미확인) | `src/shared/components/layout/Header/` |
| 375 | 로고와 링크의 터치 높이가 24px 안팎, 예배 장소 표시가 11px 연회색 | Header, WorshipTimes |
| 375 | 떠 있는 "새가족 등록·문의" 버튼이 목록 카드의 글자를 가린다 | 홈 전역 |
| 768 | 헤더가 PC 메뉴로 바뀌는데 폭이 모자라 **"찾아오시는 길"이 두 줄로 깨진다**. 메뉴 버튼은 사라진다(`md:hidden`) | `Header/SideMenu.tsx` |
| 768 | 예배 시간표: 다음세대 카드가 가운데 좁은 한 줄로 쌓이고, 아래 세 칸은 "월~ / 금", "임마누엘성전 / 3F"로 줄이 깨진다 | WorshipTimes |
| 768 | 영아부 페이지 1px 넘침(캡처는 멈춰서 얻지 못함) | DepartmentPage |

## 4. 결정한 것 (사용자 확정)

- 디자인 시스템의 목적은 일관성이다. 범위는 §2의 목표 1~6.
- 관리자 화면은 **같은 색과 폰트를 쓰되 촘촘한 업무 도구 느낌**으로 한다. 브랜드 색은 주요 동작에만 쓰고, 연출 모션은 넣지 않는다.
- 공개 사이트의 모바일과 태블릿 보완을 **이 패키지에 함께** 넣는다.
- 기준 폭은 **375 / 768 / 1280** 세 가지.
- 견본 페이지는 Storybook이 아니라 **`/design` 라우트**로 만든다.

## 5. 설계

### 5.1 토큰 계층

```
원시 토큰 (값)         → 의미 토큰 (역할)              → 유틸 / 부품
--color-b1-accent      → --primary, --ring            → bg-primary, <Button>
--color-b1-border      → --border, --input            → border, <Input>
```

- **원시 토큰**: 지금의 `--color-b1-*`를 그대로 쓴다. 이름과 값을 바꾸지 않는다.
- **의미 토큰**: shadcn 변수(`:root`의 `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--border`, `--input`, `--ring`, `--card`, `--popover`, `--destructive` 와 각 `-foreground`)를 **원시 토큰을 가리키도록** 다시 정의한다. 연결 안은 아래와 같다.

| shadcn 의미 토큰 | → B1 |
|---|---|
| background / foreground | b1-bg / b1-text |
| card, popover | b1-surface (글자 b1-text) |
| primary / primary-foreground | b1-accent / 흰색 |
| secondary | b1-accent-soft (글자 b1-accent) |
| muted / muted-foreground | b1-placeholder / b1-sub ※ |
| accent (shadcn에서 hover 배경) | b1-accent-soft |
| border, input | b1-border |
| ring | b1-accent |
| destructive | **새 토큰 `b1-danger`** (`b1-sunday`는 주일 강조 전용이라 재사용 금지) |

  ※ `muted-foreground`는 본문 보조 글자로 쓰이니 대비가 충분한 `b1-sub`에 연결한다. `b1-muted`(#8fa0b8)는 DESIGN.md §5대로 캡션과 플레이스홀더 전용이다.
- **새 상태 색**: 관리자 화면의 저장 완료, 경고, 오류 표시용으로 `b1-success`, `b1-warning`, `b1-danger`(각각 글자색과 연한 배경색 한 쌍)를 추가한다. 값은 B1 톤에 맞춰 만드는 사람이 정하되 **흰 배경 위 텍스트 대비 4.5:1 이상**. [color-palette.md](../design/color-palette.md)에 함께 기록한다.
- 차트 토큰(`--chart-*`)과 사이드바 토큰은 쓰는 곳이 없으니 정리한다. `.dark` 블록과 `dark:` 클래스(5곳)도 제거한다. *(구현 쪽 판단 — 다크 모드는 비목표)*

### 5.2 글자 크기 (타이포 스케일)

Tailwind v4 `@theme`의 `--text-*` 변수로 정의하고 `text-body`, `text-h2` 같은 유틸로 쓴다. 줄 간격과 굵기도 함께 묶는다.

| 이름 | 용도 | 휴대폰 → PC |
|---|---|---|
| `display` | 히어로 표어 | clamp, 약 36 → 54px |
| `h1` | 페이지 제목 | clamp, 약 30 → 40px |
| `h2` | 섹션 제목 | clamp, 약 24 → 36px |
| `h3` | 카드나 블록 제목 | 20px |
| `title` | 목록 항목 제목 | 17px |
| `body` | 본문 | **16px** |
| `body-sm` | 보조 본문, 표 | 15px |
| `caption` | 날짜, 장소 등 | **13px (한글 최소)** |
| `eyebrow` | `● WORSHIP` 같은 라틴 대문자 머리표 | 12px, 라틴 문자 전용 |

- 정확한 clamp 값은 지금 쓰이는 크기(54, 36, 30, 40px 등)에서 가장 가까운 값을 골라, **기존 화면이 거의 같게** 보이게 정한다.
- 10~12px 한글 글씨(87곳)는 `caption`(13px)으로 올린다. 이건 의도한 시각 변화다.
- 입력칸(`input`, `textarea`, `select`)의 글씨는 휴대폰에서 **16px 이상**.

### 5.3 둥글기, 그림자, 모션

- **둥글기**: Tailwind 단계(`sm`·`md`·`lg`·`xl`·`2xl`·`3xl`·`full`)를 그대로 쓰고 `--radius` 값만 B1에 맞춘다. 임의 값 6곳은 가장 가까운 단계로 바꾸거나, 형태가 연출의 일부면 `design-lint-ignore`로 남긴다.
- **그림자**: `--shadow-*` 3단계(`sm` 떠 있는 카드, `md` 드롭다운과 떠 있는 버튼, `lg` 대화상자). 임의 그림자 17곳을 여기로 모은다. 연출용 1회성 그림자(빛 번짐 등)는 ignore로 남겨도 된다.
- **모션**: `--duration-fast`(150ms), `--duration-base`(250ms), `--duration-slow`(400ms)와 `--ease-standard`. 부품의 hover, 열고 닫기에 쓴다. 연출 위젯의 긴 모션은 지금처럼 자유롭게 두되, DESIGN.md §3의 모션 기준은 그대로 지킨다. 관리자 화면에서는 연출 모션 없이 상태 전환에만 쓴다.

### 5.4 폰트

- **Pretendard**: CDN `<link>`를 없애고 npm `pretendard` 패키지의 dynamic-subset CSS를 앱에서 import한다. 우리 도메인에서 함께 제공되고, 필요한 글자 조각만 받는 장점은 유지된다. *(구현 쪽 판단. `next/font/local`로 전체 woff2를 넣는 방식은 2MB 안팎이라 제외)*
- **Nanum Brush Script**: `next/font/google`로 옮긴다. 빌드할 때 내려받아 직접 제공된다.
- **Geist, Geist Mono, JetBrains Mono**는 제거한다(사용처 0). `--font-mono`는 시스템 고정폭 폰트로 대체한다.
- 결과: 런타임에 외부 폰트 서버로 가는 요청이 없다.

### 5.5 반응형 기준

| 기준 | 값 |
|---|---|
| 확인 필수 폭 | **375, 768, 1280** (헤더는 1024도 확인) |
| 브레이크포인트 | Tailwind 기본(`sm` 640, `md` 768, `lg` 1024, `xl` 1280)을 그대로 쓴다 |
| 헤더 PC 메뉴 전환 | `md` → **`lg`(1024)**. 태블릿은 메뉴 버튼과 옆 메뉴(SideMenu)를 쓴다 |
| 터치 영역 | 버튼, 링크 버튼, 아이콘 버튼, 탭은 **44×44px 이상**(보이는 크기가 작으면 패딩이나 가상 영역으로). 문단 안의 글 링크는 예외 |
| 최소 글씨 | 한글 13px(`caption`), 본문 16px |
| 가로 넘침 | 세 폭 모두 `scrollWidth == innerWidth` |
| 떠 있는 버튼 | 화면 하단 고정 요소가 콘텐츠를 가리지 않게, 페이지 하단에 그만큼 여백을 둔다 |

DESIGN.md에 **§7 반응형** 절로 추가해서 디자인 QA 채점 기준이 되게 한다.

### 5.6 공용 부품 세트

위치는 `src/shared/components/ui/`(shadcn 구조 유지). 모든 부품은 §5.1~5.5의 토큰만 쓴다.

| 묶음 | 부품 | 비고 |
|---|---|---|
| 기존 정비 | Button, Card, Table, Tabs, Tooltip, Pagination, NavigationMenu | 토큰을 연결하고 터치 44px 적용. Button 크기는 `sm`(관리자 표 안, 36px — 대신 PC 전용), `default` 44px, `lg` |
| 입력 | Input, Textarea, Select, Checkbox, Switch, RadioGroup, **FormField**(라벨 + 도움말 + 오류 메시지 묶음) | 휴대폰 16px, 오류 상태는 `b1-danger` |
| 겹침 | Dialog, **Sheet**(휴대폰에서는 아래에서 올라오는 시트), DropdownMenu, Toast | Radix 기반 shadcn 부품 |
| 표시 | Badge(상태 색), Skeleton, EmptyState(빈 목록 안내), Avatar | |
| 패턴 | **ResponsiveList** — `md` 이상은 표, 그 아래는 카드 목록으로 바뀌는 목록 | 관리자 목록 화면의 기본 틀 |
| 업로드 껍데기 | ImageDropzone — 여러 장 선택, 미리보기, 순서 바꾸기, 삭제 **UI만** | 실제 축소와 업로드 로직은 패키지 2·3 |

- shadcn CLI(`components.json` 설정 그대로)로 추가한 뒤 토큰에 맞게 손본다.
- 부품의 변형(variant)은 cva로 정의한다. 새 변형은 **두 곳 이상에서 쓰일 때만** 추가한다.
- 기존 `src/shared/components/features/`(Pagination, Table, Tabs 래퍼 등)는 새 부품 위에서 동작하게 맞춘다. 이름이 겹치는 래퍼는 하나로 합친다. 어떻게 합칠지는 만드는 사람이 판단한다.

### 5.7 견본 페이지 `/design`

- 라우트는 `src/app/design/page.tsx`. **운영 빌드에서는 404**(`process.env.NODE_ENV === 'production'`이면 `notFound()`). 검색 엔진에도 노출하지 않는다.
- 내용:
  1. 색 — 원시 토큰과 의미 토큰 견본, 대비값
  2. 글자 크기 단계
  3. 둥글기, 그림자, 모션
  4. 부품 — 상태별로(기본, hover, focus, disabled, 오류)
  5. 반응형 기준 요약
- 넘겨받는 사람의 **첫 입구**가 되도록, 각 묶음 옆에 코드 이름(`text-caption`, `<Button size="lg">`)을 적는다.

### 5.8 지키게 하는 장치

- **`design:lint` 확장**: 프로덕션 코드에서 새 `text-[Npx]`, `shadow-[…]`, `rounded-[…]` 임의 값을 차단한다(지금 hex처럼 error). 기존 위반은 `--update-baseline`으로 grandfather하고, 이 패키지 안에서 줄여 간다. 탈출구는 같은 줄의 `design-lint-ignore: 사유`.
- **반응형 점검 스크립트 `pnpm design:audit`** *(구현 쪽 판단)*: CDP 기기 흉내로 주요 라우트를 375, 768, 1280 폭에서 열어 다음을 보고하고, 캡처를 남긴다.
  - 가로 넘침
  - 44px 미만 터치 영역
  - 13px 미만 글씨

  이번 점검에 쓴 방식을 정식 도구로 만드는 것이다. 개발 서버가 떠 있어야 동작하고, 커밋 게이트로 쓰지 않고 수동으로 돌린다.
  - 대상 라우트는 `siteNav`에서 뽑는다. `PagePlaceholder`만 그리는 "준비 중" 페이지와 프리뷰 라우트(`*-preview`), `/design`은 제외한다.
  - 판정 기준: 터치 영역은 `a`, `button`, `[role=button]`, `[role=tab]` 중 보이는 것(문단 안 `a`는 제외). 글씨는 텍스트를 직접 가진 요소의 계산된 `font-size`. 한글이 없는 `eyebrow`는 12px까지 허용한다.

### 5.9 기존 화면 보완 (이번 점검 결과)

§3의 표를 전부 고친다. 핵심:
1. 375 가로 넘침(LocationMap, CommunityGallery) — 문단 폭을 부모 폭 안으로
2. 헤더 — PC 메뉴 전환을 `lg`로, 메뉴 버튼 44px, **첫 화면에서 메뉴 버튼이 보이지 않는 원인을 찾아 고침**
3. 예배 시간표 — 태블릿 배치를 다시 짜고(다음세대 카드 격자, 아래 세 칸 줄바꿈), 장소 글씨를 `caption`으로
4. 떠 있는 새가족 버튼 — 콘텐츠를 가리지 않게
5. 10~12px 한글 글씨를 `caption`으로
6. 영아부 1px 넘침
7. 위를 고친 뒤 `design:audit`로 **모든 비-placeholder 라우트**를 다시 점검하고, 새로 나온 문제도 고친다

## 6. 성공 기준 (검증)

| # | 기준 | 확인 방법 |
|---|---|---|
| 1 | shadcn `<Button>` 기본값이 B1 accent로 보인다. 검정과 회색 부품이 없다 | `/design` 캡처 |
| 2 | 프로덕션 코드에 새 임의 글자 크기, 그림자, 둥글기가 없다(baseline과 ignore 제외) | `pnpm design:lint` 통과 |
| 3 | 비-placeholder 라우트 전부 375, 768, 1280에서 가로 넘침 0 | `pnpm design:audit` |
| 4 | 같은 조건에서 44px 미만 터치 영역 0(문단 안 링크 제외), 13px 미만 한글 0 | `pnpm design:audit` |
| 5 | 768px 헤더가 한 줄이고 메뉴 버튼이 있다. 375px 첫 화면에서 메뉴 버튼이 보인다 | 캡처 |
| 6 | 의도한 보완(§5.9) 외에는 바뀌기 전과 후 화면이 같다 | 세 폭 전후 캡처 비교 |
| 7 | 런타임 외부 폰트 요청 0 | 네트워크 탭 또는 `design:audit` 요청 목록 |
| 8 | `/design`이 dev에서는 열리고 `pnpm build && pnpm start`에서는 404 | 수동 |
| 9 | `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm design:lint` 통과 | 명령 |
| 10 | DESIGN.md 바에 비춘 디자인 QA 통과 | `design-qa` 스킬, 승격 마일스톤이라 `/design-review` 라이브 감사 |

TDD 대상(CLAUDE.md "로직 한정"): `design:audit`의 판정 함수(넘침, 터치 영역, 글씨 크기 판별)는 순수 함수로 떼어 테스트를 먼저 쓴다. 부품과 스타일은 테스트를 강제하지 않는다.

## 7. 함께 갱신할 문서

- [color-palette.md](../design/color-palette.md) — 의미 토큰 연결표, 새 상태 색
- **새 문서 `.md/design/design-system.md`** — 글자 크기, 둥글기, 그림자, 모션 토큰과 부품 목록, `/design` 안내(살아있는 문서)
- [DESIGN.md](../../DESIGN.md) — §1에 의미 토큰 규칙, §4에 글자 크기 단계, **§7 반응형** 신설
- [README.md](../README.md) — 문서 목록, 코드↔문서 동기화 표(`globals.css` 글자·그림자 토큰 ↔ design-system.md)
- **ADR 0009** — "토큰 2계층(원시→의미) + 반응형 기준 + 폰트 직접 제공" 결정 기록

## 8. 만드는 사람에게 맡기는 것

- 상태 색(`success`, `warning`, `danger`)의 정확한 값(대비 4.5:1 조건 안에서)
- clamp 수치, 그림자 3단계 값, 모션 이징 곡선
- 부품의 세부 API(prop 이름), 기존 `features/` 래퍼를 합치는 방식
- 임의 둥글기와 그림자 중 무엇을 단계로 바꾸고 무엇을 ignore로 남길지(연출 형태 보존이 기준)
- 작업 순서. 단 **토큰과 폰트 → 부품 → 견본 페이지 → 기존 화면 보완 → lint와 audit 강화** 순서를 권장한다(lint를 먼저 강화하면 작업 중에 막힌다)

## 9. 리스크

- 토큰을 바꾸면 기존 화면이 조금씩 달라질 수 있다 → 세 폭 전후 캡처 비교(성공 기준 6).
- `md`→`lg` 헤더 전환은 768~1023px 구간의 헤더 동작을 바꾼다 → 1024 경계에서 확인한다.
- 연출 위젯의 JS 폭 계산(`window.innerWidth`를 쓰는 HomeLead, MorphFrame, TurntableStage, DepartmentPage Intro)은 CSS 브레이크포인트와 따로 움직인다 → 태블릿 폭에서 반드시 확인한다.
