# ADR 0009: 디자인 시스템 — 토큰 2계층 · 글자 크기 단계 · 폰트 직접 제공 · 반응형 기준

**상태**: 채택
**날짜**: 2026-11-05

## 배경

관리자 화면(ADR 0008, 같은 앱의 `/admin`)이 공개 사이트와 **같은 사이트로 보여야** 한다. 사용자의 목적은 "일관된 디자인". 2026-11-05 실측에서 드러난 문제:

- shadcn 의미 토큰(`--primary` 등)이 shadcn 기본 무채색이라 B1 팔레트와 따로 놀았다. 부품을 쓰면 검정·회색이 나온다.
- 글자 크기 토큰이 없어 임의 값이 15종 이상이었고, 10~12px 한글이 87곳이었다.
- 폰트를 외부 CDN(jsDelivr·Google)에서 받았고, 쓰지 않는 Geist·Geist Mono까지 불러왔다.
- 반응형 기준이 없었다. 375px에서 홈이 8px 넘쳤고, 768px에서 헤더 메뉴와 예배 시간표가 깨졌다.

설계 [2026-11-05-design-system-design.md](../specs/2026-11-05-design-system-design.md), 실행 기록 [-plan.md](../specs/2026-11-05-design-system-plan.md).

## 결정

1. **토큰 2계층**: B1 원시 토큰(값)을 shadcn 의미 토큰이 가리킨다. 부품은 의미 토큰을, 연출은 B1 토큰을 쓴다. 상태 색 `b1-success/warning/danger`(+soft)를 추가했고, 다크 모드는 지원하지 않는다(`.dark` 블록 제거).
2. **글자 크기 10단계**: `display·h1·h2·h3·title·body·body-sm·label·caption·eyebrow`. 한글 최소는 13px(`caption`), 입력칸은 16px이다. 그림자 `shadow-sm|md|lg`, 모션 `duration-fast|base|slow`·`ease-standard`.
3. **폰트 직접 제공**: Pretendard는 npm `pretendard`, 붓글씨는 `@fontsource/nanum-brush-script`, 숫자·날짜용 고정폭(`.b1-mono`, 29개 파일)은 `@fontsource/jetbrains-mono`(latin 400~700)로 넣는다. 모두 unicode-range 조각이고, 런타임 외부 폰트 요청은 0이다. 쓰이지 않던 Geist·Geist Mono는 뺐다.
4. **반응형 기준**: 375·768·1280(헤더는 1024) 폭에서 확인한다. PC 메뉴 전환은 `lg`. 1024 미만 폭에서 터치 영역 44px, 가로 넘침 0. DESIGN.md §7에 반영했다.
5. **지키는 장치**:
   - `design:lint`가 임의 글자 크기·그림자·둥글기 신규 사용을 차단한다. 레거시는 baseline에 등재.
   - `design:audit`(CDP 기기 흉내)이 실제 렌더를 측정한다.
   - `/design` 견본은 dev 전용이다.

## 대안 비교

| 대안 | 결과 |
|---|---|
| Storybook으로 부품 카탈로그 | **탈락** — 이 규모에서 도구·빌드가 하나 더 늘어난다. `/design` 라우트 한 장이 같은 역할을 한다 |
| 폰트 CDN 유지 | **탈락** — 외부 장애·지연에 사이트 글꼴이 묶인다. 직접 제공해도 unicode-range 조각 방식은 유지된다 |
| `next/font/google`로 붓글씨 | **탈락** — 빌드 때 Google에 접속해야 하고, 이 개발 환경에서는 막혀 있다. fontsource는 패키지로 고정된다 |
| PC 메뉴 전환 `md`(768) 유지 | **탈락** — 메뉴 6개가 768~1023에서 줄바꿈된다(실측) |
| 의미 토큰 없이 부품에 B1 직접 | **탈락** — shadcn 부품을 추가할 때마다 손으로 바꿔야 해서 일관성이 깨지기 쉽다 |
| 제목급(18px 이상) 임의 크기까지 이번에 토큰으로 이전 | **보류** — 반응형 쌍(`text-[32px] md:text-[40px]`)이 승인된 위젯(ADR 0006·0007)에 몰려 있다. clamp 토큰으로 바꾸면 중간 폭 모양이 달라진다. baseline에 두고 별도 시각 검토 때 옮긴다 |

## 결과 / 영향

- 부품: `src/shared/components/ui/`에 shadcn 부품과 `FormField`·`ResponsiveList`·`ImageDropzone`·`EmptyState`. 목록은 [design-system.md](../design/design-system.md).
- `cn()`(tailwind-merge)에 글자 크기 토큰을 등록했다. 등록하지 않으면 `text-body-sm text-b1-sub`에서 크기가 지워진다(실제로 발생해 수정).
- **shadcn CLI 주의**: 생성 코드가 `import { cn } from "cn"`이고, 엉뚱한 npm 패키지 `cn`을 설치한 적이 있다. 추가 뒤 import·`dark:`·`next-themes`를 정리한다.
- **부서 페이지 도입부 휴대폰 구성 변경(2026-11-06, 사용자 지적)**: ADR 0007의 휴대폰 구성("사진이 화면 가득 뒤에 서 있고 시트가 올라옴")에서는 가로 사진의 양옆이 크게 잘렸다. 폭 900px 미만에서는 사진을 원래 비율대로 헤더 아래에 세우고, 시트가 사진 바로 아래에서 시작하도록 바꿨다(`--en-peek`를 `calc(100svh - 사진 아래 끝)`으로 계산). PC 구성은 그대로다.
- **스크롤바 폭 보정**: 화면 끝까지 채우는 영역에 `100vw`를 쓰면 스크롤바 폭(약 15px)만큼 넘친다. 그래서 `--sbw`(AppProvider가 측정)를 두고 `calc(100vw - var(--sbw))`를 쓴다. `design:audit`은 스크롤바를 숨기고 측정하므로 이 넘침은 잡지 못한다.
- 남은 일:
  - 제목급 임의 크기·연출 그림자·둥글기의 baseline 레거시(69건)를 시각 검토와 함께 정리한다.
  - `/worship/sunday`는 유튜브 API 키가 없으면 로컬에서 500이라 점검 대상에서 빠진다.
  - `/design`의 운영 404는 Vercel 프리뷰에서 확인한다.
