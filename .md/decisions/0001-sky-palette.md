# ADR 0001: Warm Paper → Sky Blue 팔레트 전환

**상태**: 채택
**날짜**: 2026-05-07
**관련 문서**: [design/color-palette.md](../design/color-palette.md)

## 배경

홈 리뉴얼(`patch/renewal` 브랜치) 작업 중 사이트 정체성을 강화할 필요가 생김. 기존 **Warm Paper 팔레트**는 따뜻한 종이 톤(`#fafaf7`) 위에 거의 검정에 가까운 악센트(`#15151a`)를 모든 CTA·아이콘·강조 요소에 사용하는 구성이었고, 신뢰감은 있으나 차분하고 평면적인 인상이었음.

목표는 **신뢰감을 유지하면서 모던하고 젊고 밝은** 교회 정체성을 시각적으로 표현하는 것. 푸른 계열의 악센트 도입 + 그에 맞춘 베이스 팔레트 전체 리프레시가 필요했음.

## 결정

베이스 팔레트를 **B1 Sky 팔레트**로 전면 교체. 메인 악센트는 **`#2563EB`(Tailwind blue-600, "Trust Cobalt")**, 모든 중성 토큰에는 미세한 블루 언더톤을 주입해 메인 악센트가 팔레트의 자연스러운 정점이 되도록 응집력 있게 구성. 보조 악센트(`accent2`)는 메인과 중성 사이를 잇는 **미디엄 인디고 `#5B7FE0`** 으로 다리 역할.

자세한 토큰 정의·사용 예시·접근성은 [design/color-palette.md](../design/color-palette.md) 참조.

## 대안 비교

다음 6개 후보를 검토:

| 후보 | HEX | 선택 결과 |
|------|-----|-----------|
| Cobalt (사용자 원안) | `#155DFC` | ✗ 채도 과다, 종이 톤과 충돌 |
| Toned Cobalt | `#2056E5` | ✗ 보류 (아래 채택안과 유사하나 살짝 더 채도 높음) |
| Royal/Sapphire | `#1E40AF` | ✗ 1차 적용했으나 너무 진중·다크하다는 피드백 |
| Marian Blue | `#1B4584` | ✗ 클래식 교회 톤이지만 "젊고 밝음" 키워드와 거리 |
| Sky Blue | `#3B82F6` | ✗ 2차 적용했으나 작은 텍스트(11px eyebrow) 가독성 부족 — 흰 배경 대비 ~3.7:1, WCAG AA 미달 |
| **Trust Cobalt** | **`#2563EB`** | ✓ **채택** — 흰 배경 대비 ~5.2:1로 AA 통과, 모던·신뢰·밝음 균형 |

## 튜닝 과정

메인 결정 후, `#2563EB`가 순수 슬레이트(채도 0) 중성톤 위에서 "외부인"처럼 튀는 현상이 발생. 두 가지 레버로 응집력 강화:

**레버 1 — 중성에 블루 언더톤 주입**

| 토큰 | 슬레이트(전) | 블루-언더톤(후) |
|------|-------------|------------------|
| bg | `#FAFBFD` | `#F6FAFE` |
| sub | `#475569` | `#3F526B` |
| muted | `#94A3B8` | `#8FA0B8` |
| border | `#E2E8F0` | `#DCE5F0` |
| placeholder | `#F1F5F9` | `#ECF0F7` |
| placeholder-tone | `#CBD5E1` | `#C2CDDC` |

**레버 2 — accent2를 다리(bridge)로 재배치**

- `accent2`: `#93C5FD`(파스텔 라이트 스카이) → `#5B7FE0`(미디엄 인디고)
- `accent-soft`: `#EFF6FF` → `#E8F0FE` (영역 인지 강화)

## 결과 / 영향

### 자동 반영
[src/app/globals.css](../../src/app/globals.css) 의 토큰 교체만으로 9개 파일이 자동 전환됨 (Tailwind `bg-b1-accent` `text-b1-accent` 등을 참조하므로 컴포넌트 수정 불필요):

- [src/shared/components/layout/Header](../../src/shared/components/layout/Header)
- [src/shared/components/layout/Footer](../../src/shared/components/layout/Footer)
- [src/domains/home/components/widgets/HomeHero](../../src/domains/home/components/widgets/HomeHero)
- [src/domains/home/components/widgets/WorshipTimes](../../src/domains/home/components/widgets/WorshipTimes)
- [src/domains/home/components/widgets/CommunityGallery](../../src/domains/home/components/widgets/CommunityGallery)
- [src/domains/home/components/widgets/VisitorAndNews](../../src/domains/home/components/widgets/VisitorAndNews)
- [src/domains/home/components/widgets/LocationMap](../../src/domains/home/components/widgets/LocationMap)

### 추가 변경
- 카드 호버 그림자 `rgba(21, 21, 26, 0.18)` → `rgba(15, 23, 42, 0.18)` (새 텍스트 컬러 기준).
- 신규 토큰 `--color-b1-accent-soft` 추가 — 향후 섹션 배경 강조용.

### 다크 모드
다크 모드 토큰은 `.dark` 셀렉터에 별도 정의되어 있어 본 결정의 영향 없음. 다크 모드 통일은 별도 ADR로 다룰 가능성.

### 후속 작업
- 다크 모드 토큰을 Sky 팔레트와 정합되게 재설계할지 검토.
- `accent2` (#5B7FE0)의 실제 적용 위치 발굴 (현재는 정의만 있고 미사용).
- `accent-soft` (#E8F0FE) 활용한 섹션 배경 강조 패턴 확립.
