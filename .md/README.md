# 문서 인덱스

성복교회 웹사이트 프로젝트 문서. 이 README는 전체 문서의 진입점이며, Claude가 작업 전 가장 먼저 확인해야 할 파일입니다.

## 디렉토리 구조

```
.md/
├── README.md                       # 이 파일 — 문서 인덱스 + 컨벤션
├── design/                         # 디자인 시스템 (살아있는 문서)
│   └── color-palette.md
├── domains/                        # 도메인별 상세 (살아있는 문서)
│   └── home.md
├── workflow/                       # 작업 방식·도구 (살아있는 문서)
│   └── prototype-preview.md
├── patterns/                       # 재사용 인터랙션 패턴 (살아있는 문서)
│   └── scroll-autoplay-intro.md
└── decisions/                      # 의사결정 기록 (ADR — 불변)
    ├── 0001-sky-palette.md
    ├── 0002-home-ia-and-tone.md
    └── 0003-hero-v2-bleed-blur-kenburns.md
```

향후 추가될 카테고리(빈 폴더는 미리 만들지 않음):

- `architecture/` — 데이터 흐름·라우팅·상태 관리·렌더링 전략

## 문서 카테고리

| 폴더 | 성격 | 추가 규칙 |
|------|------|-----------|
| `design/` | **살아있는 문서** — 현재 상태만 기술 | 변경 시 기존 파일 직접 업데이트. 변경 이력은 ADR로 분리 |
| `domains/` | **살아있는 문서** — 도메인별 상세 | 도메인 1개당 파일 1개. 변경 시 기존 파일 업데이트 |
| `workflow/` | **살아있는 문서** — 작업 방식·도구 | 방식 변경 시 기존 파일 업데이트 |
| `patterns/` | **살아있는 문서** — 재사용 인터랙션 패턴 | 패턴 1개당 파일 1개. 개선 시 기존 파일 업데이트 |
| `decisions/` | **불변 문서** — 결정 시점의 기록 | 새 결정마다 새 파일 생성. 기존 ADR은 수정하지 않음(폐기 시 상태 필드만 변경) |
| `architecture/` *(향후)* | 살아있는 문서 | 변경 시 기존 파일 업데이트 |

## 현재 문서 목록

### Design

- [color-palette.md](design/color-palette.md) — B1 Sky 팔레트. 컬러 토큰 정의·시각적 위계·Tailwind 사용 예시·접근성

### Domains

- [home.md](domains/home.md) — 홈(`/`) 페이지의 7섹션 IA·섹션별 사양·CTA·모바일 적응·미결 사항

### Workflow

- [prototype-preview.md](workflow/prototype-preview.md) — 시안(디자인 변형) 탐색·라이브 프리뷰 방식. 좋은 시안의 조건(콘텐츠 분리·쏠림 금지·등장/사라짐 설계) + `<name>-preview` 라우트 + `_variants/` + 전용 dev 포트 + 비인터랙티브 영상/스크롤 헬퍼 + browse 자기점검. (구 standalone HTML 방식 폐기)

### Patterns

- [scroll-autoplay-intro.md](patterns/scroll-autoplay-intro.md) — 스크롤 트리거 일방향 자동재생 인트로(연출을 시간 기반으로 분리 + 입력 잠금 + 래치). 히어로 문열림에 적용, 재사용 가능

### Decisions

- [0001-sky-palette.md](decisions/0001-sky-palette.md) — 2026-05-07 — Warm Paper 팔레트에서 Sky Blue 팔레트로 전환한 의사결정 기록
- [0002-home-ia-and-tone.md](decisions/0002-home-ia-and-tone.md) — 2026-05-07 — 홈 1순위 타깃·카피 톤 원칙·7섹션 IA 결정
- [0003-hero-v2-bleed-blur-kenburns.md](decisions/0003-hero-v2-bleed-blur-kenburns.md) — 2026-05-24 — 히어로를 사진 4단 Bleed + Blur 페이드 + Ken Burns(sketch 12)로 확정, ADR 0002 미결 종결

## 컨벤션

### 신규 문서 추가

1. **카테고리 결정**: "현재 상태"인가 "과거 결정"인가? 살아있는 문서면 `design/` `architecture/` `domains/` 중 적합한 폴더, 의사결정이면 `decisions/`.
2. **빈 폴더 금지**: 첫 문서 생성 시점에 폴더도 함께 생성. 미리 만들지 않음.
3. **파일명**: `kebab-case.md`. ADR은 `NNNN-short-slug.md` (4자리 번호 + 짧은 설명).
4. **인덱스 갱신**: 이 README의 "현재 문서 목록" 섹션을 함께 업데이트.

### 살아있는 문서 수정

- 기존 파일을 직접 업데이트 (새 파일 생성 ❌).
- 변경 이력 섹션을 본문에 누적하지 말 것 — 의미 있는 결정은 새 ADR로 분리.
- 코드와 문서가 짝(아래 "코드 ↔ 문서 동기화" 표)인 경우, 코드 변경 PR에 문서 변경도 포함.

### ADR (Architecture Decision Record) 양식

- **위치**: `decisions/`
- **파일명**: `NNNN-short-slug.md` (예: `0001-sky-palette.md`)
- **번호**: 마지막 ADR 번호 + 1. **재사용 금지** (폐기된 ADR도 번호는 유지).
- **양식**:

```markdown
# ADR NNNN: 제목

**상태**: 채택 | 대체됨 (→ ADR XXXX) | 폐기
**날짜**: YYYY-MM-DD

## 배경
어떤 문제·맥락이 있어서 결정이 필요했는지.

## 결정
무엇을 채택했는지 한 문장 + 핵심 디테일.

## 대안 비교
검토한 옵션들과 채택/탈락 이유.

## 결과 / 영향
이 결정으로 무엇이 바뀌는가. 후속 작업·제약·리스크.
```

- **결정 폐기**: 기존 ADR을 수정하지 말고, 새 ADR로 대체. 기존 ADR의 상태를 "대체됨 (→ ADR XXXX)"으로만 변경.

## 코드 ↔ 문서 동기화

다음 변경은 반드시 짝이 되는 문서를 함께 업데이트:

| 코드 변경 | 함께 업데이트할 문서 |
|-----------|----------------------|
| [src/app/globals.css](../src/app/globals.css) 의 팔레트 토큰 | [design/color-palette.md](design/color-palette.md) |
| [src/app/page.tsx](../src/app/page.tsx) 또는 [src/domains/home/](../src/domains/home/) 변경 | [domains/home.md](domains/home.md) |
| 도메인 추가/구조 변경 | `domains/<domain>.md` |
| 라우팅·상태 관리·렌더링 전략 변경 | `architecture/*.md` *(향후)* |

이 표는 새 카테고리/문서가 추가될 때마다 함께 갱신.
