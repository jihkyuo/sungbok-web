# 주일예배 설교 영상(G안) — 구현 계획

> 상태: **구현 완료(2026-11-12)** — 커밋은 사용자 지시 대기
> 실행 결과: 「결정 1」대로 페이지↔재생목록은 코드 설정(`config/worshipPages.ts`), 칩은 제목의 시리즈. 그래서 라이브러리는 `Sermon[]` 하나(시리즈는 화면에서 계산 — `sermonList.buildSeries`)이고, 아래 Task 2~4 의 `SermonLibrary`·`playlistId(s)` 표기는 `Sermon[]`·`series` 로 구현됐다. 훅·API 는 `page` 를 받는다(`/api/worship-video/library?page=`, `/description?page=&v=`). 고른 영상은 `useSearchParams` 대신 `useVideoParam`(history) — 정적 페이지의 서버 HTML 을 지키려고. 살아있는 문서: [.md/domains/worship-video.md](../domains/worship-video.md)
> 시안: `~/Downloads/sungbok-worship-G.html` (G안 최종 — 머리 A+, 디자인 검수 반영, 설교 목록·무한스크롤·업로드 날짜 표기)

**Goal:** `/worship/sunday` 의 탭+쪽넘김 재생목록(`PlaylistPagination`)과 스탠드인(`SermonArchive`)을 G안으로 바꾼다 — 페이지 안 플레이어, 유튜브식 설명란, 오른쪽(휴대폰은 가로 줄) 「설교 목록」, 아래 검색·필터·정렬·무한스크롤 전체 목록.

**Architecture:** 서버가 채널 재생목록과 그 영상(제목·설명·날짜)을 유튜브에서 모아 **설교 라이브러리** 하나로 만든다(Data Cache 1시간, 기존 `youtubeGet` 그대로). 페이지는 지금처럼 ISR(10분) + `HydrationBoundary` 로 라이브러리를 실어 보내고, 목록 필터·정렬·검색·무한스크롤은 전부 화면에서 한다. 설명 본문은 무거워서 라이브러리에 싣지 않고 고른 영상 것만 따로 받는다(같은 캐시에서 꺼내므로 쿼터 추가 없음).

**운영 규칙(관리자 할 일 = 유튜브에 올리기만):**
- 시리즈 = 유튜브 재생목록. 새 시리즈는 재생목록을 하나 만들면 칩이 생긴다.
- 제목 `시리즈 N | 제목 | 본문 | 설교자` → 회차·제목·본문을 뽑는다(지금 79편 중 78편이 이 형식).
- 설명 첫 줄 `2026년 10월 25일 …` → **설교일**. 없으면 유튜브 **업로드 날짜**를 쓰고 화면에 「업로드 2026.10.25」로 표시.
- 설명란 본문은 그대로 보여 준다(`*설교본문:` 줄 포함). 첫 줄이 날짜면 숨긴다(굵은 날짜 줄과 중복).

## Global Constraints

- git: 스테이징·커밋·푸시는 **사용자 지시 때만**(CLAUDE.md). 태스크 끝 「체크포인트」는 제안일 뿐.
- 색·글자·반경·그림자는 `b1-*`/텍스트 토큰만. 토큰 없는 1회성 그림자는 `/* design-lint-ignore: 사유 */`. `pnpm design:lint --diff` 통과.
- DESIGN.md §7: 1024 미만 터치 44×44(보이는 크기는 두고 `::before` 가상 영역 — SubNav `HIT_44` 방식), 한글 13px 이상(`text-caption` 이하 금지), **입력칸 16px**(`text-body`), 가로 넘침 0.
- 모션: transform/opacity 만, `usePrefersReducedMotion`·`motion-reduce:` 가드. 스크롤은 Lenis 경로(`PlaylistGrid.goTo` 방식).
- TDD(로직 한정): camelCase `.ts` 와 `use*` 훅은 형제 테스트를 **먼저**(tdd-guard 가 막는다). UI 컴포넌트는 렌더 테스트만 필요한 곳에.
- 유튜브 호출은 서버만(`server-only`). 키 `YOUTUBE_API_KEY`. 로컬은 `.env.local` 에 각자 키 — **지금 로컬에 `.env.local` 이 없어서** `/worship/sunday` 가 「영상 목록을 불러오지 못했습니다」를 보인다. 시작 전에 넣는다.
- 카피: 사실 진술만. 화면 문구는 이 문서의 표기를 그대로(「설교 목록」, 「재생목록 N개」, 「전체 설교」, 「업로드 」 접두, 빈 결과 문구).
- 머리(SectionShell A+)는 `app/worship/layout.tsx` 가 이미 감싼다 — 손대지 않는다.

## 파일 구조

| 파일 | 할 일 |
|---|---|
| `domains/worship-video/api/sermonParse.ts` (+test) | 순수: 제목·설명 파싱 |
| `domains/worship-video/api/sermonList.ts` (+test) | 순수: 필터·검색·정렬·시리즈 순서·연도 묶음·이전/다음 편 |
| `domains/worship-video/api/worshipVideo.types.ts` | `Sermon`·`SermonSeries`·`SermonLibrary` 추가 |
| `domains/worship-video/api/worshipVideo.server.ts` (+test) | `fetchSermonLibrary()`·`fetchSermonDescription(id)` 추가, 옛 함수 정리 |
| `domains/worship-video/api/worshipVideoQueries.ts` (+test) | 키·응답 검사(`toLibrary`, `toDescription`) |
| `domains/worship-video/api/useSermonLibrary.ts` (+test) | `useSermonLibrary()`·`useSermonDescription(id)` |
| `domains/worship-video/api/worshipVideoPrefetch.server.ts` (+test) | 라이브러리 미리 받기로 교체 |
| `app/api/worship-video/library/route.ts` (+test) | 서버가 못 실었을 때 화면이 받는 라이브러리 |
| `app/api/worship-video/description/route.ts` (+test) | `?v=` 설명 본문(라이브러리에 있는 id 만) |
| `domains/worship-video/components/widgets/SermonLibrary.tsx` | 서버: 미리 받기 + HydrationBoundary + `<SermonPage/>` |
| `domains/worship-video/components/features/SermonPage/index.tsx` | 클라이언트: 고른 영상·시리즈 상태, 레이아웃(lg 2단) |
| `…/features/SermonPlayer/index.tsx` | 포스터 → 유튜브 iframe |
| `…/features/SermonInfo/index.tsx` | 제목·시리즈 태그·이전/다음 편·설명란·시트지 자리 |
| `…/features/SermonSidebar/index.tsx` | 「설교 목록」 칩·전체 고르기·회차 목록 |
| `…/features/SermonSearchList/index.tsx` | 선택칸·검색·정렬·목록·무한스크롤 |
| `app/worship/sunday/page.tsx` | `SermonLibrary` 로 교체 |
| 삭제 | `PlaylistPagination`·`PlaylistTabs`·`Playlist`·`PlaylistGrid`(+테스트)·`app/api/worship-video/route.ts`·`…/playlists/route.ts`(+테스트)·`usePlaylistVideos`(+테스트)·`domains/worship/…/SermonArchive` |

`StatusText`(`QueryStatus`)는 재사용(불러오는 중·실패·다시 시도).

## Review Focus

1. **제목 형식이 다른 영상**(형식 밖 1편, 절기 설교, `|` 없음) — 제목 전체를 제목으로, 회차·본문 없이 보이고 목록·검색에서 빠지지 않는다. → Task 1
2. **설교일이 없는 영상의 정렬** — 날짜가 업로드 날짜로 채워져 오래된 순에서 맨 앞에 몰리지 않는다(시안의 「15편 다음 144편」). → Task 1·2
3. **같은 영상이 두 재생목록에 있음** — 전체 목록에 한 번만, 칩 목록에는 각 재생목록에 다 보인다. → Task 3
4. **검색 「12장」·「13장 4절」** — 본문 표기 `12:`·`13:4` 로 찾힌다(빈 결과 안내문이 이 검색을 권한다). → Task 2
5. **`?v=` 에 라이브러리에 없는 id**(삭제·비공개·오타) — 최신 설교로 떨어지고 에러가 나지 않는다. 설명 API 도 404. → Task 4·6

---

### Task 1: 제목·설명 파싱 (순수, TDD)

**Files:** Create `domains/worship-video/api/sermonParse.ts`, `sermonParse.test.ts`

**Produces:**
```ts
export type ParsedTitle = { series?: string; no?: number; title: string; passage?: string; preacher?: string };
export const parseSermonTitle: (raw: string) => ParsedTitle;
export type ParsedDescription = { date?: string /* 'YYYY.MM.DD' */; body: string /* 첫 날짜 줄·앞 빈 줄 제거 */ };
export const parseSermonDescription: (raw: string) => ParsedDescription;
export const toDotDate: (iso: string) => string; // '2026-10-25T…' → '2026.10.25'(KST 기준)
```

- [ ] 테스트 먼저(실제 표본 — `scratchpad/worship/PLE3XUsm60vXT1E1WdySse96bcg097uLhe.json`·`legacy-all.json` 에서 그대로 옮긴다):
  - `parseSermonTitle('사도행전 강해 66 | 구원을 위한 영과 육의 도장깨기 | 사도행전 13:4-7 | 이요셉 목사')` → `{ series: '사도행전 강해', no: 66, title: '구원을 위한 영과 육의 도장깨기', passage: '사도행전 13:4-7', preacher: '이요셉 목사' }`
  - `'[마태복음 28장] 부활의 아침'`·`|` 없는 제목 → `{ title: 원문 그대로 }`, 나머지 undefined
  - 칸이 3개(설교자 없음) → passage 까지만
  - `parseSermonDescription('2026년 10월 25일 성복교회 주일예배\n\n[사도행전 강해 66]\n*설교본문: …')` → `{ date: '2026.10.25', body: '[사도행전 강해 66]\n*설교본문: …' }`
  - 한 자리 월·일(`2026년 9월 7일`) → `'2026.09.07'`; 날짜 없는 설명 → `{ body: 원문 }`; 빈 문자열 → `{ body: '' }`
  - `toDotDate('2026-10-24T15:30:00Z')` → `'2026.10.25'`(KST)
- [ ] `pnpm test sermonParse` RED → 구현 → GREEN
- [ ] 체크포인트(커밋 제안)

### Task 2: 목록 로직 (순수, TDD)

**Files:** Create `domains/worship-video/api/sermonList.ts`, `sermonList.test.ts`

**Consumes:** `Sermon`, `SermonSeries`(Task 3 의 타입 — 이 태스크에서 `worshipVideo.types.ts` 에 먼저 추가)

```ts
// worshipVideo.types.ts 에 추가
export type Sermon = {
  id: string; title: string; series: string; playlistIds: string[];
  no?: number; passage?: string;
  date: string;            // 'YYYY.MM.DD' — 설교일, 없으면 업로드 날짜
  dateFrom: 'sermon' | 'upload';
  thumbnail: string;       // high(목록)
  poster: string;          // maxres→standard→high(플레이어 포스터)
};
export type SermonSeries = { playlistId: string; title: string; count: number; latest: string /* date */ };
export type SermonLibrary = { series: SermonSeries[]; sermons: Sermon[] }; // sermons 최신순, series 최신 편 순
```

**Produces:**
```ts
export const PAGE_STEP = 12;
export type ListQuery = { q: string; playlistId: string /* '' = 전체 */; sort: 'new' | 'old' };
export const searchKey: (q: string) => string;               // '12장' → '12:', '13장 4절' → '13:4', 소문자
export const filterSermons: (lib: SermonLibrary, query: ListQuery) => Sermon[];
export const seriesSermons: (lib: SermonLibrary, playlistId: string) => Sermon[]; // 최신순
export const topSeries: (lib: SermonLibrary, current: string, n?: number /* 4 */) => SermonSeries[]; // 최신 4개, current 없으면 4번째 자리에
export const seriesByYear: (lib: SermonLibrary) => [string /* '2026년' */, SermonSeries[]][];       // 첫 편 연도, 최신 연도 먼저
export const neighbors: (lib: SermonLibrary, id: string, playlistId: string) => { older?: Sermon; newer?: Sermon };
export const dateLabel: (s: Sermon) => string;               // 'sermon' → '2026.10.25', 'upload' → '업로드 2026.10.25'
```

- [ ] 테스트 먼저:
  - `filterSermons` 정렬 `old` — 설교일·업로드 날짜 섞인 목록이 날짜 오름차순(같은 날은 회차 오름차순). 표본: 사도행전 1~15(업로드)·마태복음 144~151·사도행전 16~66 → 마태복음 → 사도행전 1 → … 순
  - 검색: 제목·본문·시리즈·`N편` 대상, `'12장'` 이 `passage: '사도행전 12:23-25'` 와 맞고 `'13장 4절'` 이 `'13:4-7'` 와 맞는다, 대소문자 무시, 공백만인 q 는 전체
  - `playlistId` 필터는 `playlistIds.includes`
  - `topSeries` 가 current 를 4번째로 끼워 넣는다(이미 있으면 그대로)
  - `neighbors` — 시리즈 첫 편은 older 없음, 최신 편은 newer 없음
  - `dateLabel` 두 경우
- [ ] RED → 구현 → GREEN → 체크포인트

### Task 3: 서버 라이브러리 (`worshipVideo.server.ts`)

**Files:** Modify `domains/worship-video/api/worshipVideo.server.ts`, `worshipVideo.server.test.ts`

**Produces:**
```ts
export const fetchSermonLibrary: () => Promise<SermonLibrary>;
export const fetchSermonDescription: (videoId: string) => Promise<string | null>; // 라이브러리에 없는 id → null
```

- 채널 재생목록: 기존 `fetchChannelPlaylists()`(50개 창, 같은 캐시 항목) 전부에서 설명란 페이지 태그(「결정 1」)로 거른다. 태그 읽기는 순수 함수 `playlistPage(description): WorshipPage`(Task 1 파일에 추가·테스트: 태그별 4종, 태그 없음 → `sunday`, 첫 줄 아닌 곳의 태그는 무시).
- 각 재생목록: `playlistItems` `part=snippet,contentDetails`(쿼터 동일 1유닛/쪽), 기존 쪽 넘김·`MAX_PLAYLIST_PAGES` 유지. `contentDetails.videoPublishedAt` = 업로드 날짜. 썸네일 빈 항목(삭제·비공개)은 기존처럼 뺀다.
- 같은 id 는 하나로 합치고 `playlistIds` 에 모은다. 날짜: `parseSermonDescription(desc).date ?? toDotDate(videoPublishedAt)`.
- 설명 본문은 내부 `Map<id, body>` 로만 두고 `fetchSermonDescription` 이 같은 수집 결과(같은 Data Cache)에서 꺼낸다 — 라이브러리 응답에는 싣지 않는다(HTML 무게: 300편 기준 목록 약 60KB, 설명까지 실으면 수백 KB).
- 옛 `fetchPlaylists`·`fetchPlaylistVideos`·`SUNDAY_PLAYLIST_COUNT` 는 Task 8 에서 쓰는 곳이 없어지면 지운다(`isChannelPlaylist` 도).
- [ ] 테스트 먼저(기존 테스트처럼 `fetch` 목): 두 재생목록에 같은 영상 → 1편·`playlistIds` 2개 / 설명 날짜 없음 → `dateFrom: 'upload'` / 썸네일 없는 항목 제외 / 라이브러리 없는 id 설명 → null / 유튜브 실패는 그대로 던진다(라우트가 `upstreamErrorResponse`)
- [ ] RED → 구현 → GREEN → 체크포인트

### Task 4: 라우트·쿼리·훅·미리 받기

**Files:** Create `app/api/worship-video/library/route.ts`(+test), `app/api/worship-video/description/route.ts`(+test), `domains/worship-video/api/useSermonLibrary.ts`(+test); Modify `worshipVideoQueries.ts`(+test), `worshipVideoPrefetch.server.ts`(+test)

**Produces:**
```ts
// worshipVideoQueries.ts
export const LIBRARY_QUERY_KEY = ['worship-library'] as const;
export const descriptionQueryKey = (id: string) => ['worship-description', id] as const;
export const toLibrary: (body: unknown) => SermonLibrary;      // 모양 틀리면 throw, 틀린 항목은 거른다(toVideos 와 같은 방침)
export const toDescription: (body: unknown) => string;          // { body: string }
// useSermonLibrary.ts
export const useSermonLibrary: () => UseQueryResult<SermonLibrary>;
export const useSermonDescription: (id: string | undefined) => UseQueryResult<string>;
// worshipVideoPrefetch.server.ts
export const prefetchSermonLibrary: () => Promise<DehydratedState>; // prefetchForIsr 그대로, 최신 1편 설명도 함께
```

- 라우트: `/library` → `fetchSermonLibrary()`; `/description?v=` → v 없으면 400, null 이면 404, 성공 `{ body }`. 실패는 `upstreamErrorResponse`.
- 훅: 기존 `STALE`·`retryTransient`·`fetchJson` 재사용. 설명은 `staleTime: Infinity`(바뀌어도 1시간 캐시라 의미 없음).
- [ ] 테스트 먼저: 라우트 400/404/200/429 전달, `toLibrary` 비배열 throw·깨진 항목 거름, 미리 받기가 라이브러리 키와 최신 편 설명 키를 채운다
- [ ] RED → 구현 → GREEN → 체크포인트

### Task 5: 플레이어·설명란 (`SermonPlayer`, `SermonInfo`)

**Files:** Create `features/SermonPlayer/index.tsx`, `features/SermonInfo/index.tsx`(+렌더 테스트)

**Interfaces:**
```ts
SermonPlayer: ({ sermon, autoplay }: { sermon: Sermon; autoplay: boolean }) => JSX.Element
SermonInfo: ({ sermon, older, newer, onPick, sheet }: {
  sermon: Sermon; older?: Sermon; newer?: Sermon; onPick: (id: string) => void;
  sheet?: { href: string } /* 관리자 시트지 — 지금은 데이터 없음, 자리만 */ }) => JSX.Element
```

- 플레이어: `autoplay=false` 면 포스터(`next/image`, `preload`) + 재생 버튼(흰 원 64px·`b1-accent` 삼각형, 1회성 그림자 lint-ignore, `aria-label="{제목} 재생"`). 누르면 `https://www.youtube-nocookie.com/embed/{id}?autoplay=1&rel=0&playsinline=1` iframe(`allow="autoplay; encrypted-media; picture-in-picture; fullscreen"`, `title="설교 영상"`). `autoplay=true`(목록에서 고른 경우)면 바로 iframe. `key={sermon.id}`. 휴대폰은 좌우 끝까지(`-mx-[6vw] md:mx-0 md:rounded-2xl`).
- 설명란: 날짜 줄(`dateLabel`, 굵게) + 본문 3줄 `line-clamp-3` + `…더보기`(상자 전체가 버튼, `aria-expanded`) / 펼치면 `간략히` 버튼. `#해시태그` 줄은 `text-b1-accent`. 본문은 `useSermonDescription` — 받는 중엔 날짜 줄만.
- 이전/다음 편: `‹ 65편` / `최신 편 ›`(없으면 비활성), 높이 34 + `HIT_44`.
- 시트지: `sheet` 있을 때만 카드(`accent-soft` 아이콘).
- [ ] 렌더 테스트: 포스터 버튼 클릭 → iframe src 에 id, `autoplay` 이면 처음부터 iframe, 더보기 토글 `aria-expanded`, 첫/최신 편에서 버튼 비활성, `sheet` 없으면 시트지 없음
- [ ] 체크포인트

### Task 6: 설교 목록·검색 목록·페이지 조립

**Files:** Create `features/SermonSidebar/index.tsx`, `features/SermonSearchList/index.tsx`, `features/SermonPage/index.tsx`, `widgets/SermonLibrary.tsx`; Modify `app/worship/sunday/page.tsx`

**Interfaces:**
```ts
SermonSidebar: ({ lib, current, playlistId, onSeries, onPick }) // playlistId = 보고 있는 칩
SermonSearchList: ({ lib, current, onPick })                     // 목록 상태(q·필터·정렬·개수)는 안에서
SermonPage: () => JSX.Element                                    // useSermonLibrary + ?v= 동기화
```

- 상태: 고른 영상은 `?v=` (`useSearchParams` 읽기 — `Suspense` 안, 바꿀 땐 `router.replace(…, { scroll: false })`). 없거나 라이브러리에 없으면 최신 편. 목록에서 고르면 플레이어로 스크롤(Lenis, `scroll-padding-top` 기준 — `PlaylistGrid.goTo` 패턴) + `autoplay`.
- 사이드바: 머리 「설교 목록」 + `재생목록 N개`(caption). 칩: `topSeries` 4개 + `전체 N개 ▾`(점선, `aria-expanded`) → 연도별 고르기 상자(썸네일·이름·`영상 N개`, 휴대폰 2열·md 4열·lg 2열). 칩 활성 = `bg-b1-accent-soft text-b1-accent`(머리 알약보다 한 단계 낮게), 높이 34 + 가상 44. 회차 목록: 휴대폰 가로 스냅 72%, md 3칸 + `‹ ›` 화살표(가상 44), **lg** 세로 목록 `max-h-[470px]` 얇은 스크롤바(lg 만). 재생 중 = 썸네일 3px 테두리 + 「재생 중」 배지(caption).
- 레이아웃: lg 이상 `grid-cols-[minmax(0,1fr)_340px] gap-7`, 사이드바 `sticky top-[72px]`. lg 미만 한 단(플레이어 → 정보 → 설교 목록).
- 검색 목록: 위 구분선 뒤 `[선택칸 「전체 설교」/시리즈(N)] [검색 입력 + 44 버튼]`(선택칸 왼쪽, 검색 바로 오른쪽, 둘 다 높이 48·`text-body`), `N편` + 최신순/오래된 순(높이 36 + 가상 44). 목록 1열 / md 2열, 항목 = 썸네일 + `시리즈 N편 · dateLabel`(accent caption) + 제목(2줄) + 본문(검색어 `<mark>` = `bg-b1-accent-soft text-b1-accent`). 빈 결과: 「찾는 설교가 없습니다. 본문(예: 사도행전 12장)이나 제목의 낱말로 찾아보세요.」
- 무한스크롤: 처음 12편, 끝의 센티널이 보이면 +12. 센티널은 `useNearViewport(ref, '0px 0px 600px 0px')` 를 쓰는 작은 컴포넌트를 **`key={shown}`** 으로 다시 마운트(한 번만 true 가 되는 기존 훅을 그대로 재사용). 센티널 = 점 3개(`motion-reduce` 면 정지), 끝나면 아무것도 안 남긴다(문구 없음). 화면낭독기용 `role="status"` 숨김 문구 「N편 중 M편 표시」. 검색·필터·정렬이 바뀌면 12편으로.
- `widgets/SermonLibrary.tsx`: `HydrationBoundary state={await prefetchSermonLibrary()}` → `<Suspense><SermonPage/></Suspense>`. `sunday/page.tsx` 는 이것만 렌더(`revalidate = 600` 유지).
- [ ] 렌더 테스트(라이브러리 목 데이터): 칩 누르면 회차 목록 바뀜, 목록 항목 누르면 `?v=` 바뀌고 플레이어가 iframe, 검색 「12장」 결과 수, 오래된 순 첫 항목, 센티널 보이면(IO 목) 24편
- [ ] 체크포인트

### Task 7: 검증

- [ ] `pnpm test` · `pnpm typecheck` · `pnpm lint` · `pnpm design:lint --diff`
- [ ] `pnpm dev` + `pnpm design:audit` — 375·768·1024·1280 넘침 0·터치 44·글씨 13/입력 16
- [ ] agent-browser(동작 검증 전 `set media light no-preference`): 페이지 안 재생, 목록 고르기 → 플레이어로 스크롤·자동재생, 무한스크롤 끝까지·문구 없음, 오래된 순, 「12장」, `?v=없는id` → 최신 편, 동작 줄이기(점 정지·즉시 스크롤)
- [ ] `/design-review` 라이브 감사(승격 마일스톤)

### Task 8: 정리

- [ ] 쓰는 곳 없어진 옛 파일 삭제(파일 구조 표의 「삭제」 줄) — `grep -rn` 으로 참조 0 확인 후. `/worship-video` → `/worship/sunday` redirect(siteNav) 는 유지.
- [ ] `.md/domains/` 에 예배 영상 운영 규칙(재생목록=시리즈, 제목·설명 형식, 업로드 날짜 표기) 추가, `.md/README.md` 인덱스 갱신
- [ ] 체크포인트(커밋은 지시 대기)

---

## 결정

1. **페이지 ↔ 재생목록은 우리가 코드에 정한다(확정, 2026-11-12)** — 관리자는 지금처럼 예배별 재생목록에 올리기만 한다.
   - 설정 파일 `domains/worship-video/config/worshipPages.ts`: `{ sunday: ['PLE3XUsm60vXSn-fvZtoUk-VrDlESt0jDJ'(주일 예배 설교)], friday: [4. 금요 생수의 강, 월삭 새벽예배], special: [특별집회 및 행사], weekday: [새벽예배 설교, 수요·금요·주일 5부 교구목사설교] }`. 설정에 없는 재생목록(예배 찬양·방역활동·장별 마태복음 등)은 어디에도 안 나온다.
   - **칩(설교 목록) = 제목의 시리즈 이름**(`사도행전 강해 66 | …` → 「사도행전 강해」). 시리즈 번호가 없으면 「단편 설교」 칩 하나. 2026-11 실측(주일 예배 설교 최근 100편): 시리즈 8개가 87편, 단편 13편.
   - 따라서 `Sermon.series` 는 재생목록이 아니라 제목에서, `SermonSeries` 는 `playlistId` 대신 `name` 으로 묶는다. Task 2·3 의 `playlistId`·`playlistIds` 는 `series: string` 으로 바꿔 읽는다(필터 값 = 시리즈 이름, `''` = 전체).
   - 채널 재생목록 조회(`fetchChannelPlaylists`, 50개 창)는 더 쓰지 않는다 — 채널 재생목록은 68개라 창을 넘는다. 설정의 id 를 바로 `playlistItems` 로 부른다(새벽예배 설교 816편 = 17쪽, 1시간 캐시라 쿼터 문제 없음).
   - 시작 전: origin/main 의 zod 검사(`dc59b0d`)·날짜 원칙 ADR 0012(`ccd57f3`, 서버 Temporal·화면 Intl)를 받은 뒤 그 방식대로 짠다 — `worshipVideo.server.ts` 가 거기서 바뀌었다.
2. **목록에서 고르면 바로 재생** — 첫 진입만 포스터(확정, 2026-11-12).
3. **유튜브에 있는 영상만** — 옛 홈페이지에만 있는 영상은 넣지 않는다(확정, 2026-11-12).

## 범위 밖

금요·특별·수요 페이지(같은 위젯을 재생목록 범위만 바꿔 재사용할 수 있게만 둔다), 관리자 시트지 업로드(자리만), 홈 최근 설교 섹션 연동.
