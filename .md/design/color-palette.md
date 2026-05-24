# 컬러 팔레트 — B1 Sky

신뢰감, 모던, 젊고 밝은 느낌을 목표로 설계된 블루 기반 컬러 시스템.

> **변경 이력**: 이 팔레트가 어떻게 결정되었는지는 [ADR 0001](../decisions/0001-sky-palette.md) 참조.

## 디자인 철학

| 키워드 | 구현 방식 |
|--------|-----------|
| **신뢰감** | 채도 70%·명도 49%의 견고한 블루-600(`#2563EB`)을 메인 악센트로 채택. 흰 배경 대비 ~5.2:1로 WCAG AA 통과 |
| **모던** | 쿨 화이트 베이스(`#F6FAFE`) + 슬레이트 텍스트로 깔끔하고 크리스피한 인상 |
| **젊고 밝음** | 순수 흰 서피스, 에어리한 배경, 소프트 블루 틴트로 개방감 확보 |
| **차분함** | 모든 중성 토큰을 블루 언더톤으로 통일 — 채도 충돌 없는 일관된 가족감 |

## 컬러 토큰

CSS 변수 정의 위치: [src/app/globals.css](../../src/app/globals.css) 의 `@theme inline` 블록.

### 베이스 (Base)

| 토큰 | HEX | 용도 |
|------|-----|------|
| `--color-b1-bg` | `#F6FAFE` | 페이지 전역 배경. 미세한 블루 틴트로 메인 컬러와 가족감 형성 |
| `--color-b1-surface` | `#FFFFFF` | 카드·모달·서피스 배경 (순수 화이트로 콘텐츠 부각) |
| `--color-b1-border` | `#DCE5F0` | 디바이더·카드 보더. 슬레이트-200에 블루 언더톤 |

### 텍스트 (Text)

| 토큰 | HEX | 용도 | 대비비 (vs bg) |
|------|-----|------|----------------|
| `--color-b1-text` | `#0F172A` | 본문·헤딩 메인 텍스트 (슬레이트-900) | ~17.1:1 (AAA) |
| `--color-b1-sub` | `#3F526B` | 서브 헤딩·중요한 메타 정보 | ~9.4:1 (AAA) |
| `--color-b1-muted` | `#8FA0B8` | 캡션·플레이스홀더·비활성 텍스트 | ~3.5:1 (AA Large) |

### 악센트 (Accent)

| 토큰 | HEX | 용도 | 대비비 (vs bg/white) |
|------|-----|------|----------------------|
| `--color-b1-accent` | `#2563EB` | **메인 악센트.** CTA 버튼, 링크, 강조 도트, 큰 숫자, 아이콘, 뱃지 | ~5.2:1 (AA) |
| `--color-b1-accent2` | `#5B7FE0` | 보조 악센트. 미디엄 인디고로 메인↔중성 사이 톤 다리(bridge) 역할 | ~3.7:1 (AA Large) |
| `--color-b1-accent-soft` | `#E8F0FE` | 소프트 틴트 배경. 카드 강조·선택 상태·정보 영역 배경 | — |
| `--color-b1-sunday` | `#DC2626` | 주일(주일예배) 강조 포인트. '주일' 워드마크·도트에만 사용 | ~4.5:1 (AA) |

### 플레이스홀더 (Placeholder)

| 토큰 | HEX | 용도 |
|------|-----|------|
| `--color-b1-placeholder` | `#ECF0F7` | 이미지 로딩 자리·비어있는 섹션 배경 |
| `--color-b1-placeholder-tone` | `#C2CDDC` | 플레이스홀더 위 톤 라인·실루엣 |

## 시각적 위계

```
┌─────────────────────────────────────────────────────┐
│ #F6FAFE  Page Background (전역 배경)                │
│  ┌────────────────────────────────────────────────┐ │
│  │ #FFFFFF  Surface (카드/콘텐츠 영역)            │ │
│  │  ┌──────┐  ┌──────────────────────────────┐   │ │
│  │  │BUTTON│  │ #2563EB  Accent (CTA·아이콘) │   │ │
│  │  └──────┘  └──────────────────────────────┘   │ │
│  │  #0F172A  Heading                              │ │
│  │  #3F526B  Subheading / Body important          │ │
│  │  #8FA0B8  Caption / Muted                      │ │
│  │  ─────────  #DCE5F0  Border ─────────          │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Tailwind 클래스 사용 예시

`@theme inline` 정의 덕분에 모든 토큰이 Tailwind 유틸리티로 자동 노출됨.

```tsx
// 메인 CTA 버튼
<button className="bg-b1-accent text-b1-bg rounded-full px-6 py-3 font-semibold">
  예배 시간 보기
</button>

// 섹션 아이브로우 (메타 텍스트)
<div className="b1-mono text-b1-accent text-[11px] tracking-[0.16em]">
  WORSHIP · 예배 안내
</div>

// 보조 정보 카드 배경
<div className="bg-b1-accent-soft rounded-2xl p-6">
  <h3 className="text-b1-text">제목</h3>
  <p className="text-b1-sub">설명 텍스트</p>
  <span className="text-b1-muted text-xs">2026.05</span>
</div>

// 보더가 있는 컨테이너
<div className="border-b1-border rounded-lg border bg-b1-surface p-4">
  ...
</div>

// 보조 악센트 (메인이 너무 강할 때)
<svg className="text-b1-accent2">...</svg>
```

## 접근성 (WCAG)

| 조합 | 대비비 | 등급 | 비고 |
|------|--------|------|------|
| `b1-text` on `b1-bg` | ~17:1 | AAA | 본문 |
| `b1-sub` on `b1-bg` | ~9.4:1 | AAA | 서브 텍스트 |
| `b1-muted` on `b1-bg` | ~3.5:1 | AA Large | 18px+ 또는 14px+ Bold만 안전 |
| `b1-accent` on `b1-bg` | ~5.2:1 | AA | 본문 텍스트도 안전 |
| `b1-bg` on `b1-accent` | ~5.2:1 | AA | 흰 글자 버튼 안전 |
| `b1-accent2` on `b1-bg` | ~3.7:1 | AA Large | 작은 텍스트 사용 시 주의 |

**주의 사항**

- `b1-muted`와 `b1-accent2`는 18px 미만 노멀 굵기 본문에는 권장하지 않음.
- 다크 모드는 별도 토큰(`.dark` 셀렉터)이 정의되어 있으며 본 팔레트와 독립적으로 관리됨.

## 영향받는 컴포넌트

토큰만 변경하면 자동 반영되는 위치:

- [src/shared/components/layout/Header](../../src/shared/components/layout/Header) — 상단 CTA, 로고 마크
- [src/shared/components/layout/Footer](../../src/shared/components/layout/Footer) — 뉴스레터 구독 버튼
- [src/domains/home/components/widgets/HomeHero](../../src/domains/home/components/widgets/HomeHero) — 환영 도트, 메인 CTA
- [src/domains/home/components/widgets/WorshipTimes](../../src/domains/home/components/widgets/WorshipTimes) — 예배 시간 큰 숫자
- [src/domains/home/components/widgets/CommunityGallery](../../src/domains/home/components/widgets/CommunityGallery) — 섹션 아이브로우
- [src/domains/home/components/widgets/VisitorAndNews](../../src/domains/home/components/widgets/VisitorAndNews) — 방문자 카드 배경, NEW 뱃지
- [src/domains/home/components/widgets/LocationMap](../../src/domains/home/components/widgets/LocationMap) — 아이브로우, 핀 아이콘, 길찾기 버튼

## 변경 시 주의

이 팔레트를 변경할 때는:

1. [src/app/globals.css](../../src/app/globals.css) 토큰 + 이 문서를 **함께 업데이트**.
2. 의미 있는 결정(예: 메인 악센트 교체)은 새 ADR로 [decisions/](../decisions/) 에 기록. 이 문서의 변경 이력 섹션에 누적하지 말 것.
3. 컴포넌트에 HEX를 하드코딩하지 말 것. 모든 컬러는 토큰으로 참조.
