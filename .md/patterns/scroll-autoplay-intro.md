# 스크롤 트리거 자동재생 인트로 (Scroll-Triggered Auto-Play Intro)

다른 섹션·페이지에서도 재사용할 수 있는 **인터랙션 패턴**. "최상단(또는 어떤 시작점)에서 사용자가 살짝 스크롤하면, 입력을 잠시 막고 **일정 속도로 천천히** 연출(예: 문 열림)을 자동 재생하면서 다음 휴지 지점까지 자동 스크롤해 멈추는" 동작.

현재 적용처: 홈 히어로(전경 문 열림 → CTA). 구현 레퍼런스: [src/domains/home/components/widgets/HomeHero/index.tsx](../../src/domains/home/components/widgets/HomeHero/index.tsx) 의 `playIntro` / `introOverride`.

---

## 언제 쓰나
- 진입 시 한 번 보여줄 연출(히어로 리빌, 온보딩 인트로 등).
- "스크롤하면 자동으로 다음 콘텐츠까지 부드럽게 이어주고 싶다"는 가이드 스크롤.

## 핵심 원리 (가장 중요한 교훈)

**연출 진행도를 `scrollY`에 직접 묶지 말 것.** 연출을 scrollY에 묶고 자동 스크롤을 ease-in-out으로 하면, 이징의 *빠른 중간 구간*에 연출이 몰려서 "거의 안 보이게" 휙 지나간다(실제로 이 실수를 했다).

→ **연출은 "시간 기반 진행도"로 분리 구동한다.**
- `introOverride`(0→1, 시간 기반 **선형**)를 만들고, 연출(문 열림/페이드 등)은 이 값으로 그린다.
- 스크롤 위치(`window.scrollTo`)는 별도로 휴지 지점까지 옮긴다. 고정(`fixed`/`sticky`) 연출이면 스크롤 이동은 화면상 안 보이고, 보이는 건 시간 기반 연출뿐 → **일정 속도로 서서히** 열린다.
- 렌더는 `eff = introOverride ?? introMax` 식으로, 재생 중엔 시간 기반값, 재생 후엔 래치값을 쓴다.

## 구성 요소

1. **트리거** — 시작점(예: `scrollY < restY`)에서 아래로 향하는 입력:
   - `wheel`(`deltaY > 0`) / `touchmove`(아래로) 리스너를 **non-passive**로 달고 `e.preventDefault()`로 네이티브 스크롤을 막은 뒤 자동재생 시작.
   - 비휠 입력(스크롤바·키보드) 대비: `scroll` 디바운스(스크롤-엔드) 폴백도 둔다.
2. **입력 잠금** — 재생 중(`playing`)에는 `wheel`/`touchmove`를 계속 `preventDefault` → 자동 스크롤이 중간에 안 끊기고 휴지 지점까지 도달 보장.
3. **시간 기반 연출** — rAF로 `q = (now-start)/D` (0→1). `introOverride = q`(선형). 연출 매핑은 렌더에서 `smooth(seg(q, …))`로 양 끝만 완만하게.
4. **자동재생 1회 게이트** — `introPlayed`로 자동재생은 페이지당 1회만. (마운트 시 `scrollY > ε`면 이미 끝난 것으로.)
   - **(선택) 일방향 래치** — 재생 후에도 연출 진행도를 단조 증가값으로 고정해 스크롤을 되돌려도 닫히지 않게 할 수 있다. **단, 가역(스크롤 올리면 닫힘)을 원하면 래치를 쓰지 말고 연출을 실시간 `scrollY`에 연동**한다(성복 히어로는 가역 채택 — 래치 미사용).
5. **휴지 지점(restY)** — 자동 스크롤이 멈출 위치(콘텐츠가 잘 보이는 지점). 보통 `viewport * k` 또는 대상 섹션의 offsetTop.
6. **접근성** — `prefers-reduced-motion`이면 자동재생/자동스크롤 비활성, 최종 상태만 즉시 노출.
7. **정리** — `cancelAnimationFrame`, 모든 리스너 `removeEventListener`, 타이머 clear.

## 핵심 파라미터
- `D` — 전체 인트로 길이(현재 1800ms). 연출은 보통 `D`의 0~70% 구간(현재 문 열림 ≈ 1.2초). **속도 조절은 이 한 값으로.**
- `restY` — 자동 스크롤 정지 지점.
- 트리거 임계값 `ε`(아주 작은 스크롤도 트리거할지).

## 흔한 함정 (피하기)
- ❌ 연출을 scrollY + ease-in-out 스크롤에 묶기 → 빠른 중간에 몰려 안 보임. ✅ 시간 기반 분리.
- ❌ CSS `scroll-snap: proximity` 또는 "스크롤-엔드 디바운스 후 스냅 + 휠 오면 취소" → 실제 마우스휠 연속 입력에서 자동 진행이 안 걸리거나 즉시 취소됨. ✅ 직접 트리거 + 입력 잠금.
- ❌ 자동 스크롤을 2-인자 `window.scrollTo(0, y)`로 호출 → 전역 CSS `scroll-behavior:smooth`가 걸려 있으면 scrollY가 목표를 **지연 추종**한다. 재생이 끝나 렌더가 시간기반(`introOverride`)→실시간 `scrollY` 로 전환되는 순간, 지연된 scrollY 때문에 연출이 **뒤로 튀었다(닫힘) 다시 진행(열림)**한다. (래치가 있으면 가려지지만, 가역이면 그대로 노출.) ✅ `window.scrollTo({ top: y, behavior: 'instant' })`로 CSS smooth를 우회해 scrollY를 진행도와 정확 동기화.
- ❌ `restY`(정지점)가 연출 완료 지점(진행도 1.0이 되는 scrollY)과 어긋남 → 정지 시 진행도<1 이라 마지막 단계(예: CTA 페이드인)가 **끝까지 안 감**. ✅ `restY`를 진행도 1.0 지점과 일치.
- scrollY 연동이면 스크롤 업에 역재생(닫힘)된다 — 이는 **의도에 따라 선택**: 가역을 원하면 그대로(권장 기본), 한 방향 고정이 필요하면 래치(선택). 무조건 래치하지 말 것.

## 재사용 체크리스트
- [ ] 연출은 시간 기반(`introOverride`)으로 그리는가?
- [ ] 트리거 wheel/touch는 non-passive + preventDefault인가?
- [ ] 재생 중 입력 잠금이 있는가?
- [ ] 자동재생은 1회만(`introPlayed`)인가? (이후 가역으로 둘지 / 래치로 고정할지 의도대로)
- [ ] reduced-motion 분기가 있는가?
- [ ] 리스너/rAF/타이머 정리(cleanup)가 있는가?
