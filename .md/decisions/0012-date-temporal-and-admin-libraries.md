# ADR 0012: 날짜는 UTC로 다루고 서버는 Temporal, 홈페이지 화면은 Intl — 관리자 대비 라이브러리 선정

**상태**: 채택
**날짜**: 2026-11-12

## 배경

관리자(`/admin`, [ADR 0008](0008-admin-backend-vercel-supabase.md))가 들어오면 날짜 입력·기간 필터·목록 정렬·폼 검증이 한꺼번에 늘어난다. 그때 가서 라이브러리를 고르면 이미 쓴 코드를 다시 옮겨야 하므로 지금 기준을 정해 둔다.

- 서버(Vercel)는 UTC로 돈다. 방문자는 한국(KST)이다. 유튜브 시각(`publishedAt`)도 UTC ISO 문자열이다.
- 표준 날짜 API **Temporal** 이 Node 26(이 프로젝트의 런타임, [ADR 0010](0010-next16-node26-perf-baseline.md)), Chrome 144+, Firefox 139+ 에 기본 탑재됐다. 2026-11-12 직접 확인: Node v26.13 에서 `Temporal.Now.zonedDateTimeISO('Asia/Seoul')` 동작.
- **Safari 정식판과 iOS(모든 iPhone·iPad 브라우저)는 아직 Temporal 이 없다**(Technology Preview 에만 있음). 홈페이지 방문자의 상당수가 아이폰이다.
- Next 16 자체는 날짜·시간대 기본값을 바꾸지 않았다. 서버 시간대는 실행 환경(`TZ`)이 정한다.
- 홈페이지의 기존 날짜 코드는 이미 이 결정과 맞다: `formatKoDate`(`src/domains/home/api/homeVideoFeed.ts`)가 `Intl.DateTimeFormat` + `timeZone: 'Asia/Seoul'` 로 표시한다. Temporal 사용처는 0곳.

## 결정

**날짜 원칙**
1. 서버·API·DB 사이에서 시각은 항상 **UTC ISO 8601 문자열**로 주고받는다(`2026-11-12T01:00:00Z`).
2. 한국 시간으로 바꾸는 건 **화면에 표시하는 순간에만** 한다. 시간대는 반드시 `'Asia/Seoul'` 로 명시한다 — 명시하면 서버 렌더와 브라우저 렌더가 같은 글자를 내서 하이드레이션 어긋남도 없다.
3. **서버 코드**는 Temporal 을 라이브러리 없이 쓴다.
4. **홈페이지 화면 코드**는 Temporal 을 쓰지 않는다. 표시는 `Intl.DateTimeFormat`(+ `timeZone: 'Asia/Seoul'`)으로 한다. Safari 10 이상 전부 지원.
5. **관리자 화면**은 Temporal 을 쓸 수 있다. 관리자 사용 브라우저는 Chrome(Edge)·Firefox 최신으로 안내한다.
6. 날짜 라이브러리(date-fns·dayjs)는 넣지 않는다.

**강제 장치** — `eslint.config.mjs` 의 `no-restricted-globals`·`no-restricted-syntax`:
- `src/**`(js·jsx·mjs·ts·tsx) 전체에서 맨 `Temporal` 과, 어떤 객체를 거치든 `.Temporal` 접근(`globalThis`·`window`·`self`·`(x as any)` 캐스트·`globalThis['Temporal']`·`const { Temporal } = globalThis`)을 오류로 막는다.
- 예외(허용): `**/*.server.ts(x)`(+ 그 테스트), `src/app/api/**`(Route Handler), `src/app/admin/**`, `src/domains/admin/**`.
- 서버 컴포넌트에서 Temporal 이 필요하면 그 계산을 `*.server.ts` 로 빼고 `import 'server-only'` 를 둔다 — 화면 코드가 가져가면 빌드가 실패한다. 파일에 `'use client'` 가 없다는 것만으로는 서버 전용이 보장되지 않아(클라이언트 컴포넌트가 import 하면 브라우저 번들에 들어감) 규칙은 파일 이름·경로로만 허용한다.

**관리자 대비 라이브러리**
- 채택: **zod**(유튜브 응답·관리자 폼·API 입력 검증을 스키마 하나로) — 2026-11-12 바로 설치해 유튜브 응답 검증에 적용(아래 «결과»). 관리자 작업을 시작할 때 설치: **react-hook-form** + `@hookform/resolvers`(zod 연결), **@tanstack/react-table**(목록 정렬·필터·페이지 — 이미 쓰는 react-query 와 같은 계열).
- 보류: **motion** — 기존 효과가 CSS·rAF 로 돌고 «동작 줄이기» 처리가 맞춰져 있다. 끌어서 순서 바꾸기·레이아웃 전환처럼 CSS 로 어려운 요구가 생기면 다시 본다. **react-youtube** — `src/shared/lib/youtubePlayer.ts` 를 감싸는 얇은 래퍼라 얻는 게 없고 유지보수가 뜸하다. 
- 탈락: **react-intersection-observer** — 비슷한 훅 3개(`useNearViewport`·`useScrollFadeIn`·`Landing` 내부 옵저버)를 모을 수 있으나 정리 효과뿐이다. 각 30~40줄에 하이드레이션 처리까지 맞게 돼 있어 그대로 둔다.
- 같은 날 정리: 개별 `@radix-ui/react-*` 4개를 통합 패키지 `radix-ui` 로 합침, 쓰지 않던 `useIsScrolled` 와 `lodash-es` 제거.

## 대안 비교

| 대안 | 판단 |
|---|---|
| date-fns v4 + `@date-fns/tz` | 탈락. 잘 만든 라이브러리지만 표준(Temporal)이 이미 서버에 있다. 지금 넣으면 Safari 가 Temporal 을 낸 뒤 표준으로 다시 옮겨야 한다 |
| dayjs + timezone 플러그인 | 탈락. 위와 같은 이유 + 플러그인을 전역 설정해야 함 |
| 화면에서도 Temporal + `temporal-polyfill` | 홈페이지는 탈락 — 표시만 하는데 polyfill(수십 KB)을 모든 방문자에게 싣는 건 과함. 관리자에서 Safari 지원이 필요해지면 관리자 레이아웃에만 넣는 선택지로 남긴다 |
| 규칙 없이 문서로만 안내 | 탈락. Chrome 에서 개발하면 문제가 안 보이고 아이폰에서만 화면이 깨진다 — 사람 기억에 맡기면 놓친다 |

## 결과 / 영향

- 홈페이지 화면 코드에 `Temporal` 을 쓰면 `pnpm lint` 와 커밋 전 검사에서 오류가 난다. 메시지가 `Intl` + `timeZone: 'Asia/Seoul'` 을 안내한다.
- 관리자 화면은 Safari 에서 Temporal 이 없으면 깨진다. Mac Safari 사용자가 있으면 관리자 레이아웃에 `temporal-polyfill` 을 넣는다. **Cache Components 를 켜면** 기본 `temporal-polyfill` 이 프리렌더 중 `new Date()` 를 불러 오류가 난다는 보고가 있으니 그때 함께 확인한다.
- Safari 정식판·iOS 가 Temporal 을 내고 지원 범위가 충분해지면 이 ADR 을 대체해 홈페이지 화면에서도 Temporal 을 허용한다(규칙의 예외 목록만 지우면 된다).
- 유튜브 응답은 `as T` 단언 대신 zod 스키마로 검사한다. `youtubeGet`·`youtubeGetDated` 는 스키마를 필수 인자로 받고, 모양이 어긋나면 `YoutubeShapeError`(어긋난 위치 포함)를 던진다 → 우리 API 는 502(재시도 안 함). 홈 피드는 유튜브 쪽 문제로 보고 마지막 성공분(10분)으로 버틴다 — 우리 코드 버그(TypeError 등)만 가리지 않는다. 목록(items)은 항목마다 따로 검사해(`validItems`) 어긋난 항목만 빼고 서버 로그에 경고(응답 경로·몇 번째 항목)를 남긴다. 없거나 null 이면 빈 목록. 홈 영상은 id·제목·게시 시각만 필수(썸네일은 라이브 직후 없을 수 있어 optional) — 영상 하나 때문에 목록 전체가 비지 않게. `YoutubeShapeError` 는 배열 자리에 객체가 오는 식으로 응답 전체의 모양이 바뀐 경우에만 난다. 그런 200 응답은 Next Data Cache 에 이미 저장된 뒤라 재검증 주기(홈 60초·예배 영상 1시간) 동안 같은 오류가 이어진다 — 이전에도 같은 경우 화면이 깨졌으므로 회귀는 아니다. 모르는 `liveBroadcastContent` 값은 피드를 깨지 않고 «방송 아님»으로 본다.
