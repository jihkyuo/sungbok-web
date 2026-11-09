# ADR 0010: Next 16 · Node 26 업그레이드와 성능 기준선 — 유튜브는 서버 fetch, 사진은 WebP 사전 변환, 폰트는 같은 출처

**상태**: 채택
**날짜**: 2026-11-09

## 배경
main(Next 15.3.8)이 그대로 배포된 `sungbok-web.vercel.app` 홈을 1024px 화면에서 재 보니 첫 로딩이 **83요청 · 4.42MB**, 외부 도메인 8곳이었다. 큰 원인은 셋:
- CSS 배경으로 쓰는 `worship.jpg` 원본 **1.68MB**가 `next/image` 를 거치지 않고 그대로 나갔다(`first-visit.jpg` 288KB 도). `src/assets` 사진 43장이 합쳐 17.8MB.
- 모든 페이지에서 `apis.google.com` gapi 스크립트를 불렀다(실제로 쓰는 곳은 `/worship/sunday` 하나). 주일예배 탭은 방문자 브라우저가 유튜브 재생목록 전 페이지를 gapi 로 불러 쿼터가 방문자 수만큼 들었고, API 키를 `console.log` 로 찍었다.
- 홈 턴테이블·광고 릴이 페이지를 열자마자 유튜브 플레이어(iframe + IFrame API)를 만들었다. Pretendard·나눔붓글씨는 jsdelivr·Google Fonts 의 렌더 차단 외부 CSS 였다.

## 결정
- **Next 16.4.5 · React 19.3 · Node 26 LTS.** `package.json` `engines.node: "26.x"`(Vercel 이 이 값을 프로젝트 설정보다 우선한다), `.nvmrc` 26. **TypeScript 7.0 + 6.0 나란히**(MS 공식 방식): `"@typescript/native": "npm:typescript@^7.0.2"`(`tsc` = 7.0, `pnpm typecheck` 0.7초), `"typescript": "npm:@typescript/typescript6@^6.0.2"`(`require("typescript")` = 6.0 API). 7.0 은 JS API 가 없어(7.1 에서 새 API 예정) typescript-eslint·Next 빌드 타입검사 같은 도구는 6.0 API 를 쓰게 둔다 — typescript-eslint 가 7 을 지원하면 6 별칭을 지운다. **ESLint 10**: 9.x 는 전 버전 지원 종료. eslint-config-next 16.4.5 안의 react·jsx-a11y·import 플러그인은 peer 범위에 10 을 아직 안 적었지만 규칙이 실제로 걸리는 것을 확인했다(alt-text·jsx-key·no-anonymous-default-export).
  `pnpm install` 이 peer 경고를 내는 건 그 때문이다. vitest 5·jsdom 31·jest-dom 7.
- **`next lint` 폐지 대응** — `pnpm lint` = `eslint .`, `eslint-config-next` flat config 직접 사용. 새로 들어온 React Compiler 규칙(`react-hooks/set-state-in-effect`·`refs`)에 걸린 기존 코드 13곳(8파일)은 업그레이드 직후 경고로 낮췄다가 같은 브랜치에서 고쳐 규칙을 오류로 되돌렸다 — 마운트 확인은 `useIsClient`(`useSyncExternalStore`), 소리 주인은 `useAudioFocus` 가 `useSyncExternalStore` 로 읽고 음소거 표시는 `!audio.active` 로 파생, 페이지네이션은 제어값을 그대로 쓰고, DockNav 는 렌더 중 상태 맞추기, 턴테이블 rAF 용 ref 는 `useLayoutEffect` 에서 갱신.
- **이미지 화질 허용 목록** — Next 16 기본값이 `qualities: [75]` 라 `next.config.ts` 에 `[75, 85, 90]` 명시(안 하면 85·90 이 75 로 깎인다). `priority` → `preload`(16 에서 이름 변경). 화면 아래 섹션(LiveStage·NoticeReel 썸네일)의 미리받기는 뺐다 — 히어로와 대역폭을 다퉜다.
- **사진은 WebP 로 한 번 변환해 레포에 둔다** — `pnpm images:webp`(`scripts/convert-images.mjs`, 가로 최대 1920px·품질 82). 43장 17.8MB → 3.1MB. JPG 원본은 지웠다(git 이력에 남음). import 하는 파일은 이름에 내용 해시가 붙어(`worship.<hash>.webp`) 사진을 바꾸면 주소도 바뀐다 — 길게 캐시해도 «바꿨는데 안 바뀜»이 없다. `next/image` 의 화면 폭별 크기 생성은 유지했다(아래 대안 참조).
- **유튜브 호출은 서버 fetch 하나로** — `src/shared/api/youtubeApi.server.ts`(`youtubeGet`)를 홈 피드와 주일예배가 같이 쓴다. Next Data Cache 는 fetch 에만 걸리므로 axios·googleapis SDK 를 쓰지 않는다. 주일예배: 서버 컴포넌트가 재생목록 이름을 받고(ISR 1시간), 탭 영상 목록은 `/api/worship-video?playlistId=` Route Handler(채널 재생목록 상위 50개 안의 id 만 허용 — 표시용 상위 5개와 같은 요청·같은 캐시 항목을 잘라 써서 시각이 어긋나지 않고, 상위 5개 창이 바뀌어도 떠 있는 탭은 열리고, id 별 유튜브 호출이 없어 임의 id 로 쿼터를 태울 수 없다, 50개×최대 100쪽, Data Cache 1시간)에서 한 번 받아 화면에서 쪽을 나눈다. 서버(`worshipVideoPrefetch.server`)가 재생목록과 첫 탭 영상을 미리 받아 react-query 상태로 실어 보내고(첫 화면부터 영상), 화면은 `useQuery`(서스펜스 아님)로 받는다 — 불러오는 중·실패(«다시 시도»)·없음을 그 자리에서 보이고, 실패한 탭은 다시 열면 알아서 다시 받는다(ErrorBoundary·캐시 지우기 특수 처리 없음). 서버가 못 채웠으면 화면이 `/api/worship-video/playlists`·`/api/worship-video` 로 직접 받는다. 유튜브 실패 처리: ISR 재생성 중이면 던져 Next 가 직전 성공 페이지를 유지하고, 빌드(쿼터가 바닥난 날 포함)·개발 서버에서는 던지지 않는다 — 배포를 막지 않고, 실패한 데이터는 싣지 않아 화면이 직접 받으며 다음 재생성(10분) 때 서버가 채운다. gapi·`YoutubeInitialize`·googleapis·query-key-factory·axios 제거.
- **홈 영상은 서버가 미리 채운다(ISR 60초)** — `src/app/page.tsx` `revalidate = 60` + `prefetchHomeVideo`(react-query `HydrationBoundary`). 서버가 홈 HTML 을 다시 만들 때 피드를 넣고, 방문자는 캐시된 HTML 을 바로 받는다(유튜브를 기다리지 않음). 첫 화면에 광고 릴·라이브 스테이지의 회색 자리표시가 없고, 그게 빠지며 LP 섹션이 튀는 일도 없다. 실패 처리: 운영 ISR 재생성 중 실패는 던져 직전 홈을 유지하고, 빌드·개발 서버에서는 빈 상태로 넘겨 브라우저가 지금처럼 `/api/home-video` 로 이어 받는다. 브라우저용 QueryClient 는 `_provider.tsx` 컴포넌트 안에서 `useState` 로 만든다 — 모듈 스코프에 두면 서버 프로세스 전체가 한 캐시를 공유해 두 번째 ISR 재생성부터 HTML 이 첫 데이터에 굳는다(운영 빌드에서 피드를 두 번 바꿔 재현·수정 확인). 쿼리 키 `HOME_VIDEO_QUERY_KEY` 는 `'use client'` 파일이 아닌 `homeVideoFeed.ts` 에 둔다 — 서버에서 클라이언트 파일의 export 는 실제 값이 아니라 참조로 바뀌어 키가 어긋난다.
- **유튜브 실패는 종류대로 응답** — `youtubeGet` 은 상태와 유튜브가 알려 준 이유를 담은 `YoutubeApiError` 를 던지고, Route Handler 는 `upstreamErrorResponse` 로 쿼터 소진 429·유튜브 일시 장애(5xx·망 오류) 503(+Retry-After)·그 밖 502 를 돌려준다. 화면(`fetchJson`·`retryTransient`)은 망 끊김과 503 만 두 번까지 다시 시도한다(1초→2초) — 쿼터 소진에 재시도로 쿼터를 더 태우지 않게. 홈 피드도 같은 규칙. 실패는 `_provider` 의 QueryCache 한곳에서 콘솔에 기록한다.
- **유튜브 키는 서버 전용 이름** — `YOUTUBE_API_KEY`. `NEXT_PUBLIC_` 은 화면 코드에서 쓰이면 브라우저 파일에 박히고 빌드 때 값이 굳는다. 서버 전용 파일에는 `import 'server-only'`(화면 코드가 가져다 쓰면 빌드 실패). Vercel 환경변수 이름을 바꾸기 전까지만 옛 이름도 함께 읽는다(바꾼 뒤 지운다). 채널 ID 는 비밀이 아니고 화면도 써서 `NEXT_PUBLIC_YOUTUBE_CHANNEL_ID` 그대로.
- **캐시 주기는 용도별** — 홈 라이브·광고 피드(`/api/home-video`)는 Data Cache 60초 + 브라우저 60초 폴링이라 라이브 시작 후 길어야 2~3분 안에 홈에 뜬다(1시간 아님). 주일예배는 유튜브 응답 Data Cache 1시간, 페이지는 10분마다 다시 만든다 — 페이지를 다시 만들어도 Data Cache 를 읽을 뿐이라 쿼터는 그대로이고, 둘 다 1시간이면 두 시계가 엇갈려 새 재생목록이 최대 약 2시간 늦던 것이 약 1시간 10분으로 준다. 열어 둔 페이지는 자동 갱신하지 않는다(쿼터 우선 — 다른 페이지에 갔다 오면 최신).
- **폰트는 같은 출처** — Pretendard 는 `pretendard` 패키지의 dynamic-subset CSS 를 import(쓰인 글자 묶음만 받음, `/_next/static/media` 에서 서빙). 나눔붓글씨는 `next/font/google`(빌드 때 받아 자체 호스팅, `--font-brush`, 미리받기 끔). 대체 폰트로만 쓰이던 Geist·Geist Mono 는 뺐다.
- **무거운 임베드는 화면 근처에서** — `useNearViewport`(IntersectionObserver, 한 번 붙으면 유지). 턴테이블 유튜브 iframe·회전 rAF·파동(WaveRing) canvas rAF 는 섹션 1.5화면 앞, 광고 릴 플레이어는 1화면 앞에서 만든다. «동작 줄이기»(`usePrefersReducedMotion`, 페이지를 연 채 바꿔도 따라감)면 턴테이블은 임베드·회전·파동 없이 포스터만 둔다(LiveStage·광고 릴의 `autoplay: !reduced` 와 같은 규칙). 포스터는 `next/image` 지연 로딩이라 임베드보다 먼저, 폭에 맞는 크기로 받는다. 소리 버튼은 플레이어가 명령을 받을 수 있을 때만 누를 수 있다 — 턴테이블은 iframe 에 'listening' 을 보내 받은 `onReady` 메시지 뒤, 라이브는 IFrame API `onReady` 에서 소리 주인 여부를 다시 확인해 맞춘다. 페이지를 연 채 동작 줄이기로 바뀌어 턴테이블 임베드가 빠지면 포스터·준비 상태를 되돌리고 소리 주인 자리도 내놓는다. 동작 줄이기 사용자는 턴테이블 영상을 페이지 안에서 재생할 수 없고 채널 칩 링크로 본다(지금은 대체 영상 — 실제 청년 예배 영상으로 바꿀 때 LiveStage 식 네이티브 컨트롤 재생을 검토).
- **Vercel 함수 지역 서울** — `vercel.json` `regions: ["icn1"]`. 기본(미국 동부)이면 `/api/*` 가 매번 태평양을 건넌다.
- CDN 은 따로 두지 않는다 — Vercel 이 엣지 캐시·brotli·HTTP/3 를 이미 한다. Docker 파일은 Node 26 으로 맞춰 두되(corepack 대신 `npm i -g pnpm@11.9.0`, `.dockerignore`, `HOSTNAME=0.0.0.0`) 현재 배포에는 쓰지 않는다.

## 대안 비교
- **사진을 WebP 로 바꾸고 `unoptimized`(서버 변환 완전 끄기)** — 변환이 0 이 되지만 `next/image` 의 화면 폭별 `srcset` 도 사라져 휴대폰이 1920px 원본을 받는다(히어로 기준 50KB → 약 290KB). 원본을 WebP 로 줄여 두는 것만으로 큰 문제(CSS 배경 1.68MB)는 풀리고, Vercel 은 변환 결과를 엣지에 캐시하므로 폭별 변환은 남겼다. 필요하면 `images.unoptimized: true` 한 줄로 바꿀 수 있다.
- **AVIF 추가** — Safari 16.4(2023) 이상이라 이번엔 WebP 만.
- **Pretendard 를 `next/font/local` 로** — 단일 가변 파일이라 한글 전체 약 2MB 를 받는다. dynamic-subset CSS 가 낫다.
- **유튜브 영상 목록을 페이지 HTML 에 전부 실어 보내기** — 재생목록 5개 × 수백 개가 HTML 에 실린다. 탭별 Route Handler 로 지연 요청.

## 결과 / 영향
- 같은 1024px 화면 홈 첫 로딩: **83요청·4.42MB(외부 8곳) → 40요청·1.44MB(외부 0곳)**. 로컬 운영 빌드 기준이며 로컬엔 유튜브 키가 없어 영상 썸네일 몇 장(수백 KB)이 빠진 수치 — 배포 후 다시 잰다.
- 로컬에서 키 없이도 빌드가 된다(주일예배는 «영상 목록을 불러오지 못했습니다»로 내려간다). 예전엔 프리렌더에서 빌드가 죽었다.
- Next 16 은 JS 를 Chrome·Edge·Firefox 111+, Safari 16.4+ 대상으로 빌드한다(browserslist 미설정). iOS 16.3 이하 기기는 JS 가 돌지 않을 수 있다 — Tailwind 4 CSS 가 이미 같은 하한이라 실질 변화는 작지만, 더 낮춰야 하면 별도 결정.
- 남은 일: Vercel 환경변수 이름을 `YOUTUBE_API_KEY` 로 바꾼 뒤 옛 이름 읽기(`youtubeApi.server.ts`) 지우기, 배포본 Lighthouse 재측정.
