# ADR 0005: 글로벌 헤더 — 글래스 캡슐 독 폐기, 토스식 전폭 바 + 안개 패널

**상태**: 채택
**날짜**: 2026-10-18
**관련**: [ADR 0004](0004-subpage-routing.md)(독=accent 알약 위계), `src/shared/components/layout/Header/DockNav.tsx`

## 배경

2026-05-25 도입한 글래스 캡슐 독(DockNav)은 항목 14px·좁은 hover 타깃·항목마다 따로 뜨는 220px 드롭다운 카드 구조였다. 사용자가 "UX상 불편할 것 같다"고 판단해 toss.im GNB 방식으로 바꾸기로 했다. toss.im 을 Aside 로 실측(바 64px 투명 → 스크롤 시 흰 .75 + blur 20px, 항목 16px·비활성 opacity .5, 패널 300ms 페이드·행 40ms stagger, 아래쪽 "블러"는 backdrop-filter 가 아니라 흰 radial-gradient 2겹 + blur(90px) 안개)한 뒤 시안 A/B/C 를 비교했고 A 가 선택됐다.

## 결정

- **캡슐 폐기 → 전폭 바(64px)**. 최상단에선 투명, 스크롤하면 `bg-white/75 + backdrop-blur(20px)`. **스크롤해도 숨지 않는다**(토스의 hide-on-scroll 은 채택하지 않음).
- **펼침 = hover한 메뉴의 하위 메뉴만 한 열**로, 그 메뉴 항목 바로 아래 x 위치에(항목 좌표 실측). 토스의 5열 사이트맵은 채택하지 않음.
- **아래쪽은 흰 안개**(radial `b1-surface` 38% → transparent, blur 90px, 2겹). 큰 영역 backdrop-filter 는 쓰지 않는다.
- 항목 16px, hover 항목 600/나머지 opacity .5. 볼드 전환 폭 고정은 보이지 않는 볼드 고스트로.
- 접근: `aria-expanded`, 키보드 포커스로 열림, 터치(hover 없음)는 첫 탭으로 열림, reduced-motion 은 항목 등장 애니메이션 제거. 모바일은 SideMenu 유지.
- **위계 변경**: ADR 0004 의 "독 = accent 알약 1개" 는 더 이상 성립하지 않는다. 독은 먹색 텍스트만 쓰고, accent 는 로고 점과 서브페이지 머리(S1) 알약에 남는다.

## 대안 비교

| 안 | 내용 | 결과 |
|---|---|---|
| A | 전폭 바 + hover 섹션 하위 한 열(항목 아래) | **채택** |
| B | 전폭 바 + 섹션 단위 패널(좌 큰 섹션명 + 우 2열 18px, 크로스페이드) | 탈락 |
| C | 항상 표시 바 + 전 섹션 열이 각 항목 아래 매달림 | 탈락 |
| 토스 원형 | 5열 사이트맵 동시 펼침 + hide-on-scroll | 사용자 지시로 두 요소 모두 배제 |

## 결과

- 영향: `DockNav.tsx` 교체, `DockNav.test.tsx` 갱신(hover 후 하위 링크 검증). `SectionShell` 머리 여백(112/128px)은 바 높이 64px 로도 충분해 유지.
- 남은 것: 항목 등장에 `filter: blur` 애니메이션을 쓴다(DESIGN.md 모션 바의 예외, 작은 텍스트 요소 한정). 모바일 메뉴 형태는 여전히 미확정.
