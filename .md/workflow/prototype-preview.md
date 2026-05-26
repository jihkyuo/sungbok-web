# 시안(디자인 변형) 탐색 · 라이브 프리뷰 방식

레이아웃·효과·인터랙션을 확정하기 전에 **여러 시안을 한꺼번에 비교**할 때 쓰는 방식. 핵심은 두 가지다.

1. **작업 방식** — 어떻게 좋은 시안을 만드는가
2. **보여주는 방식** — 어떻게 사용자가 라이브로 만지며 고르게 하는가

> ⚠️ **이전의 "standalone HTML + 로컬 HTTP 서버" 방식은 폐기됐다.** 정적이라 사용자가 명시적으로 거부했음. 시안은 반드시 **실제 코드베이스 안의 프리뷰 라우트**로, 본 페이지 맥락에서 hover·scroll·반응형을 직접 만지게 한다.

---

## A. 작업 방식 (좋은 시안의 조건)

1. **진단 먼저.** 현재 구현의 문제를 먼저 짚고(기획 의도와의 충돌, 인터랙션 버그 등), 개선 방향을 한 문장으로 못박은 뒤 시안에 들어간다.
2. **콘텐츠 모델을 먼저 확정.** 한 섹션에 성격이 다른 콘텐츠가 있으면(예: 청년 예배 영상 ↔ 담임목사 설교) **각자 자기 라벨로 분리**한다. 한쪽 텍스트가 다른 쪽 미디어를 설명하는 것처럼 읽히면 안 됨.
3. **한쪽 쏠림 금지.** 각 시안 = *한쪽을 제대로 구성* + *나머지 콘텐츠를 "격리된 별도 섹션"으로 함께*. 둘 다 실재하되 시각적으로 구분되게.
4. **시안은 진짜 다르게.** 레이아웃·모션·인터랙션이 각자 달라야 한다. 미묘한 변주(색만 바꾼 수준)는 시안이 아니다. 레퍼런스는 교회에 국한하지 말고 범용으로(awwwards·Codrops·bento·마퀴·스크롤 스크럽 등) 탐색.
5. **역할에 맞는 과감함.** 정보 전달 영역(예: 설교 아카이브)은 단정하게, 분위기 전달 영역(예: 자동재생 청년 영상)은 과감하게 — 실험적 표현 OK.
6. **등장·사라짐까지 설계.** 정지 상태뿐 아니라 스크롤 진입(등장)·체류·이탈(사라짐) 인터랙션을 시안마다 정의한다.
7. **디자인 시스템과 일관.** 컬러·타이포·반경은 `globals.css` 의 b1 토큰을, 섹션 골격은 `Section`/`SectionTitle`/`Reveal`(아래)을 재사용. 카피는 [feedback 톤 원칙](../decisions/0002-home-ia-and-tone.md)(사실 진술, 영업 톤 ❌) 준수.
8. **임시물 규율.** 시안은 던져버릴 코드다. `globals.css` 같은 전역 파일은 건드리지 말고, 시안 전용 keyframe/효과는 프리뷰 `page.tsx` 의 `<style>` 에 `sp-` 프리픽스로 국소 정의.

---

## B. 보여주는 방식 (프리뷰 라우트 컨벤션)

### 디렉토리 구조

```
src/app/<name>-preview/page.tsx            # 'use client' — 실제 페이지 재현 + 슬롯 교체 + 고정 탭바
src/domains/<domain>/components/widgets/<Widget>/_variants/
├── index.ts        # 레지스트리: [{ id, label, title, desc, C }] — 0번 = 현재 구현 컴포넌트
├── data.ts         # 공유 목업/자산 상수 (영상 src·메타·이미지)
├── Variant*.tsx    # 자기완결 변형 컴포넌트 (한 파일 = 한 시안)
└── (공유 헬퍼)      # AmbientVideo.tsx · useScrollProgress.ts 등
```

- 변형 컴포넌트는 **대상 위젯 옆 `_variants/`** 에 둔다. 프리뷰 라우트는 `src/app/<name>-preview/`.

### `page.tsx` 핵심

- **실제 페이지를 그대로 재현**하고, 고도화 대상 위젯 자리만 선택 시안으로 교체한다. 위/아래 섹션은 실제 그대로 둬야 스크롤 진입·전환·여백을 정확히 판단할 수 있다(섹션 단독 평가 ❌).
- 교체 슬롯엔 안정적 훅과 리마운트를 위해 `<div id="sp-slot" key={selected}><Active /></div>`.
- **한 화면 = 한 시안.** 여러 시안을 한 화면에 나열하지 않는다. 고정 탭바(`fixed` + `z-[9999]`, 전역 히어로 위로)로 전환하고, `?v=` 쿼리에 동기화.
- **0번 = 현재 구현**을 기본 선택·비교 기준으로 둔다.
- 전역 헤더/푸터는 실제 맥락이 필요하면 유지, 단독 평가가 필요하면 프리뷰 `<style>` 로 `header/footer { display:none }` 숨김.

### 전용 dev 포트

이 레포는 여러 세션이 동시에 돈다. 3000·3001·3002·3007 등이 점유돼 있으니 **빈 포트**로 띄운다.

```bash
PORT=<n> pnpm exec next dev -H 0.0.0.0 --turbopack -p <n>
```

`pnpm dev -- -p <n>` 는 `--` 가 next 로 잘못 전달돼 실패하니 쓰지 말 것.

---

## C. 재사용 헬퍼 패턴

### 비인터랙티브 자동재생 영상 (`AmbientVideo`)

"보기만 되고 클릭·컨트롤은 안 되는" 영상은 **`<video>` + `pointer-events-none`** 로 구현한다.

```tsx
<div aria-hidden className="pointer-events-none relative overflow-hidden">
  <video className="absolute inset-0 h-full w-full object-cover"
    src={STANDIN_VIDEO} poster={POSTER.src}
    autoPlay muted loop playsInline tabIndex={-1} />
  {children /* 스크림·블렌드 오버레이 */}
</div>
```

- `muted loop autoPlay playsInline` + 컨테이너 `pointer-events-none` + `tabIndex=-1` → 클릭/포커스/조작 전부 차단, 자동재생·무한루프만.
- **유튜브 iframe 지양**: cover·색보정·블렌드·마스크·스크럽이 안 되고 진짜 비인터랙티브 보장이 어렵다(iframe을 덮는 오버레이는 `pointer-events`가 살아 있어야 클릭을 흡수). `<video>` 가 효과 자유도·차단 모두 우월.
- 실제 자산이 없으면 **stand-in 영상**(CC0 등)을 `data.ts` 상수로 두고, 확정 시 한 줄만 교체.

### 스크롤 연동 효과

- **진입 fade / 등장·사라짐 토글**: 기존 `useScrollFadeIn`({ triggerOnce:false })로 보일 때 in / 벗어나면 역재생.
- **연속 스크럽(0~1 진행도)**: `_variants/useScrollProgress.ts` — 요소가 뷰포트를 통과하는 진행도. `window` scroll + `rAF` 스로틀(Lenis가 실제 document 스크롤을 움직이므로 동작). 패럴럭스·듀오톤 차오름·핀 스크럽 등에 사용.
- 자주 쓰는 효과: `clip-path` 리빌, Ken Burns/패럴럭스(`transform`), `mix-blend-mode` 듀오톤, SVG/`clip-path` 텍스트 마스크, GPU 마퀴(`sp-marquee`), 스티키 핀 + 캡션 크로스페이드.

---

## D. 자기 점검 (사용자에게 보여주기 전)

gstack `browse` 로 슬롯을 캡처해 깨진 곳·콘솔 에러를 먼저 확인한다.

```bash
B=~/.claude/skills/gstack/browse/dist/browse
"$B" goto "http://localhost:<n>/<name>-preview?v=<id>"
"$B" wait --networkidle
"$B" eval /tmp/scroll-to-slot.js   # document.getElementById('sp-slot').scrollIntoView(...)
"$B" console --errors
"$B" screenshot /tmp/shot.png --viewport
```

⚠️ **browse daemon은 다른 세션과 공유될 수 있다.** `goto` 직후 `$B url` 로 활성 탭을 확인하고, **스크린샷 직전·직후 URL을 가드**해 어긋나면 재시도하라(다른 세션이 탭을 가로채면 엉뚱한 페이지가 캡처된다).

---

## E. 확정 후

- 승자 1안을 본 위젯(`<Widget>/index.tsx`)에 이식.
- `src/app/<name>-preview/` 라우트와 `_variants/` 폴더를 **통째로 삭제**. 임시 자산·stand-in도 함께 제거.
- 임시물은 레포에 커밋하지 않는다(승자 이식분만 커밋).

---

## 자산 참고

[src/assets/images/main/](../../src/assets/images/main/) — `main01.jpg`(외관)·`worship.jpg`(예배)·`pastor.jpg`(담임목사)·`department/dep01~09`(부서/활동컷). 시안의 포스터·썸네일·stand-in poster 로 재사용.

## 적용 사례

- `/sermon-preview` (RecentSermons): "청년 예배 영상 ↔ 담임목사 설교" 두 콘텐츠 분리 + 청년 과감 / 설교 격리 원칙으로 다수 시안 비교. 진행 메모는 세션 메모리(`project_homepage_renewal`) 참조.
- `/worship-preview` (WorshipTimes, 종료): 동일 방식으로 ~50개 시안 비교 후 T3 확정 → 폴더 삭제.
