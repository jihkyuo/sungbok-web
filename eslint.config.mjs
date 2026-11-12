import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// Next 16 부터 `next lint` 가 없어지고 eslint-config-next 가 flat config 를 직접 내보낸다(FlatCompat 불필요).
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts']),
  // 시안 프리뷰 라우트(*-preview)는 비교용 임시물이라 린트 대상에서 뺀다 — 커밋 금지 대상이라 고칠 수도 없다
  // (pre-commit 의 «임시 프리뷰 누출» 검사). 승자는 정식 위젯으로 옮긴 뒤 그쪽에서 린트한다.
  globalIgnores(['src/app/**/*-preview/**']),
  // 시안 변형(_variants)도 같은 이유로 뺀다 — pre-commit 이 커밋을 막는 임시물이라 린트 에러를 고칠 길이 없고,
  // 다른 작업의 미커밋 시안이 전체 트리 lint(eslint .)를 실패시켜 무관한 커밋까지 막는다.
  globalIgnores(['**/_variants/**']),
  // 날짜(ADR 0012): Temporal 은 Node 26 엔 있지만 Safari 정식판·iOS 엔 아직 없다 — 화면 코드에서 쓰면 아이폰에서만 깨진다.
  // 서버 전용 파일·Route Handler·관리자 영역만 예외로 연다(아래 블록).
  // 주의: 아래 예외 블록이 두 규칙을 통째로 끈다 — 이 두 규칙에는 Temporal 항목만 둔다(다른 금지는 다른 규칙·블록으로).
  {
    files: ['src/**/*.{js,jsx,mjs,ts,tsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'Temporal',
          message:
            "Temporal 은 Safari·iOS 에 없다(ADR 0012). 화면 표시는 Intl.DateTimeFormat + timeZone: 'Asia/Seoul', 서버 계산은 *.server.ts 로 옮긴다.",
        },
      ],
      // 어떤 객체를 거치든(globalThis·window·self·캐스트·['Temporal']·구조 분해) Temporal 접근은 모두 막는다
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[property.name='Temporal']",
          message: 'Temporal 은 Safari·iOS 에 없다(ADR 0012).',
        },
        {
          selector: "MemberExpression[computed=true][property.value='Temporal']", // globalThis['Temporal']
          message: 'Temporal 은 Safari·iOS 에 없다(ADR 0012).',
        },
        {
          selector: "ObjectPattern > Property[key.name='Temporal']", // const { Temporal } = globalThis
          message: 'Temporal 은 Safari·iOS 에 없다(ADR 0012).',
        },
      ],
    },
  },
  {
    files: [
      'src/**/*.server.{js,mjs,ts,tsx}',
      'src/**/*.server.test.{ts,tsx}',
      'src/app/api/**',
      'src/app/admin/**',
      'src/domains/admin/**',
    ],
    rules: {
      'no-restricted-globals': 'off',
      'no-restricted-syntax': 'off',
    },
  },
]);

export default eslintConfig;
