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
]);

export default eslintConfig;
