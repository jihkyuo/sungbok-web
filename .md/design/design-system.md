# 디자인 시스템 — 토큰·부품·반응형 기준

> 살아있는 문서. 현재 상태만 적는다. 결정 경위는 [ADR 0009](../decisions/0009-design-system-tokens-responsive.md)와 설계 [2026-11-05-design-system-design.md](../specs/2026-11-05-design-system-design.md).
> 색 값과 대비표는 [color-palette.md](color-palette.md)가 정본이다.

## 원칙

- **어느 화면을 누가 만들어도 같은 사이트로 보이게.** 색·글자 크기·그림자·모션은 이름(토큰)으로 고른다.
- **부품은 의미 토큰, 연출은 B1 토큰.** `src/shared/components/ui/*`는 `bg-primary`·`border-input` 같은 의미 토큰을 쓰고, 공개 사이트의 연출 위젯(히어로·사진 띠·부채·턴테이블·쇼케이스)은 B1 토큰을 쓴다.
- **연출 위젯은 토큰만 지키고 형태는 자유.** 부품 틀에 끼워 맞추지 않는다. 토큰이 안 맞는 연출 고유 값은 같은 줄에 `/* design-lint-ignore: 사유 */`.
- **관리자 화면은 같은 색과 폰트, 더 촘촘하게.** 브랜드 색은 주요 동작에만, 연출 모션은 넣지 않는다.

## 토큰 (`src/app/globals.css` `@theme inline`)

### 글자 크기

| 유틸 | 크기 | 줄 간격 / 굵기 | 용도 |
|---|---|---|---|
| `text-display` | `clamp(36px, 7vw, 54px)` | 1.15 / 700 | 히어로 표어 |
| `text-h1` | `clamp(30px, 5vw, 40px)` | 1.2 / 700 | 페이지 제목 |
| `text-h2` | `clamp(24px, 4vw, 36px)` | 1.25 / 700 | 섹션 제목 |
| `text-h3` | 20px | 1.4 / 600 | 카드·블록 제목 |
| `text-title` | 17px | 1.5 / 600 | 목록 항목 제목 |
| `text-body` | 16px | 1.8 | 본문 |
| `text-body-sm` | 15px | 1.7 | 보조 본문, 표 |
| `text-label` | 14px | 1.4 / 500 | 버튼·탭·배지 **전용 — 본문 금지** |
| `text-caption` | 13px | 1.5 | 날짜·장소 등. **한글 최소 크기** |
| `text-eyebrow` | 12px | 1.2 / (굵기는 요소가 정함), 자간 0.08em | `● WORSHIP` 같은 **라틴 대문자 머리표 전용** |

### 그림자·모션

| 유틸 | 용도 |
|---|---|
| `shadow-sm` | 떠 있는 카드 |
| `shadow-md` | 드롭다운, 떠 있는 버튼 |
| `shadow-lg` | 대화상자, 시트 |
| `duration-fast` 150ms · `duration-base` 250ms · `duration-slow` 400ms | hover, 열고 닫기 |
| `ease-standard` | `cubic-bezier(0.16, 1, 0.3, 1)` (DockNav와 같은 곡선) |

둥글기는 Tailwind 단계(`rounded-sm`~`rounded-3xl`, `rounded-full`)를 쓴다.

## 반응형 기준

| 기준 | 값 |
|---|---|
| 확인 필수 폭 | 375 · 768 · 1280 (헤더는 1024도) |
| 브레이크포인트 | Tailwind 기본 `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 |
| 헤더 PC 메뉴 전환 | `lg`(1024). 태블릿은 메뉴 버튼 + 옆 메뉴 |
| 터치 영역 | 1024 미만 폭(터치 기기)에서 44×44px 이상(문단 안 글 링크 제외). 관리자 표 안 `Button size="sm"`(36px)은 `lg` 이상(PC) 전용 |
| 최소 글씨 | 한글 13px, 본문 16px, **입력칸 16px**(작으면 아이폰이 화면을 확대한다) |
| 가로 넘침 | 0 |

확인 도구: `pnpm dev` 상태에서 `pnpm design:audit` — 375·768·1024·1280 폭에서 모든 비-placeholder 라우트의 넘침·터치 영역·글씨 크기를 재고 `.design-audit/<폭>/`에 캡처를 남긴다. 옵션 `--widths 375 --routes /,/about/staff`.

## 부품 (`src/shared/components/ui/`)

**견본: 개발 서버에서 `/design`** — 모든 토큰과 부품을 상태별로 보여 준다(운영 빌드에서는 404). 넘겨받는 사람은 여기서 시작한다.

| 묶음 | 부품 | 규칙 |
|---|---|---|
| 버튼 | `Button` variant `default·secondary·outline·ghost·destructive·link`, size `default`(44px)·`lg`(48px)·`icon`(44px)·`sm`(36px, **PC 관리자 표 안 전용**) | 글자 `text-label` |
| 입력 | `Input`·`Textarea`·`Select`·`Checkbox`·`Switch`·`RadioGroup`·`Label`·**`FormField`**(라벨+도움말+오류, aria 연결) | 입력 글씨는 모든 폭에서 16px. 체크박스·라디오·스위치는 보이는 크기 16px, 누르는 영역 44px(`::after`) |
| 겹침 | `Dialog`·`Sheet`(휴대폰은 `side="bottom"`)·`DropdownMenu`·`Toaster`(sonner, 레이아웃 배치는 관리자 패키지에서) | 닫기 버튼 44px. 움직임 줄이기 설정이면 즉시 열고 닫음 |
| 표시 | `Badge` variant `neutral·accent·success·warning·danger`, `Skeleton`, `Avatar`, `EmptyState` | 상태 색은 B1 상태 토큰만 |
| 목록 | **`ResponsiveList`** — `md` 이상 표, 그 아래 카드 | 관리자 목록 화면의 기본 틀 |
| 업로드 | **`ImageDropzone`** — 여러 장 선택(휴대폰 카메라·앨범), 미리보기, 앞뒤 이동, 삭제 | UI만. 축소·업로드는 부르는 쪽 |
| 기존 | `Card`·`Table`·`Tabs`(긴 라벨은 탭 줄만 옆 스크롤)·`Tooltip`·`Pagination`·`NavigationMenu` | 토큰 연결·44px 적용 |

**shadcn CLI 주의**: `pnpm dlx shadcn@latest add …` 가 `import { cn } from "cn"` 로 생성하고 엉뚱한 npm 패키지 `cn` 을 설치한 적이 있다(2026-11-05). 추가 뒤 import 를 `@/shared/lib/utils` 로 고치고, `dark:` 유틸과 `next-themes` 를 지운다.
