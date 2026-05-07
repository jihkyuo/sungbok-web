# 성복교회 웹사이트

Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 기반 교회 웹사이트.

## 문서 위치

모든 프로젝트 문서는 `.md/` 디렉토리에 정리되어 있습니다.

- **인덱스**: [.md/README.md](.md/README.md) — 전체 문서 목록 + 추가/수정 규칙

새 문서를 만들기 전에 인덱스를 먼저 확인하세요. 카테고리·네이밍·동기화 규칙이 모두 거기 있습니다.

## 작업 시 주의

### 디자인 시스템 변경
컬러·타이포·간격 등 디자인 토큰을 [src/app/globals.css](src/app/globals.css) 에서 변경하면 반드시 `.md/design/` 의 짝이 되는 문서도 함께 업데이트하세요.

| 코드 | 짝이 되는 문서 |
|------|----------------|
| `src/app/globals.css` 팔레트 토큰 | [.md/design/color-palette.md](.md/design/color-palette.md) |

### 중요 의사결정 기록
스택 전환, 팔레트 교체, 라우팅 구조 변경 등 되돌리기 어려운 결정은 `.md/decisions/` 에 ADR(Architecture Decision Record) 형식으로 기록하세요. 양식과 번호 컨벤션은 [.md/README.md](.md/README.md) 참조.

## 코딩 컨벤션

- **패키지 매니저**: pnpm
- **도메인 분리**: `src/domains/<domain>/components/{features,widgets}` 구조
- **공유 컴포넌트**: `src/shared/components/`
- **전역 토큰만 사용**: 컬러·폰트·반경 등은 `src/app/globals.css` 의 `@theme inline` 블록 토큰을 Tailwind 유틸(`bg-b1-accent`, `text-b1-sub` 등)로 참조. 컴포넌트 내 HEX 하드코딩 지양.
- **단어 줄바꿈**: 한글 가독성을 위해 `globals.css` 에 `word-break: keep-all` 적용됨. 헤딩은 `text-wrap: balance`.
