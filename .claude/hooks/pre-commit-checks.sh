#!/usr/bin/env bash
# 프리커밋 검사 훅 (Claude Code PreToolUse / Bash)
# Claude Code가 `git commit`을 실행하려 할 때 lint·타입체크·(test)를 돌리고,
# 하나라도 실패하면 커밋을 차단한다. 결과는 stdout JSON의 systemMessage로 사용자에게
# 보여주고, 실패 시 permissionDecision:"deny" + 오류 전문을 Claude에 전달한다.
# git commit이 아닌 명령이거나 검사를 돌릴 수 없는 환경이면 무동작 통과.

set -uo pipefail

# 1) PreToolUse 페이로드(stdin JSON)에서 실행하려는 명령 추출
payload="$(cat)"
command="$(printf '%s' "$payload" | jq -r '.tool_input.command // ""' 2>/dev/null)"

# 2) git commit이 아니면 무동작 통과
case "$command" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

# 3) 프로젝트 루트로 이동 (CLAUDE_PROJECT_DIR 우선, 없으면 스크립트 위치 기준)
project_dir="${CLAUDE_PROJECT_DIR:-}"
if [ -z "$project_dir" ]; then
  project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fi
cd "$project_dir" 2>/dev/null || {
  printf '%s' '{"systemMessage":"⚠️ 프로젝트 루트 이동 실패 — 프리커밋 검사를 건너뜁니다."}'
  exit 0
}

# 4) pnpm 없으면 fail-open(환경 문제로 커밋을 막지 않음)
if ! command -v pnpm >/dev/null 2>&1; then
  printf '%s' '{"systemMessage":"⚠️ pnpm을 찾을 수 없어 프리커밋 검사를 건너뜁니다 (커밋 진행)."}'
  exit 0
fi

# 문자열을 JSON 문자열 리터럴로 안전 변환
json_str() { printf '%s' "$1" | jq -Rs .; }

# 실패 시: systemMessage(사용자) + deny + 오류 전문(Claude)
emit_block() {
  local label="$1" detail="$2" sys reason
  sys=$(json_str "❌ 프리커밋 검사 실패: ${label} — 커밋을 차단했습니다. 오류를 고친 뒤 다시 커밋하세요.")
  reason=$(json_str "프리커밋 ${label} 단계 실패. 아래 출력을 보고 고친 뒤 다시 커밋하라:

${detail}")
  printf '{"systemMessage":%s,"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":%s}}' "$sys" "$reason"
  exit 0
}

# 한 단계 실행: 출력은 stderr(트랜스크립트)로 흘리고, 실패하면 차단
run() {
  local label="$1"; shift
  echo "→ $label" >&2
  local out
  if ! out="$("$@" 2>&1)"; then
    printf '%s\n' "$out" >&2
    emit_block "$label" "$out"
  fi
  printf '%s\n' "$out" >&2
}

# 0) 임시 시안 프리뷰 누출 차단 — *-preview/ 라우트·_variants/ 폴더는 커밋 금지
#    (워크플로 규칙: 승자 이식분만 커밋). 스테이징에 섞여 있으면 차단한다.
staged="$(git diff --cached --name-only 2>/dev/null || true)"
leaked="$(printf '%s\n' "$staged" | grep -E '(^|/)src/app/[^/]+-preview/|(^|/)_variants/' || true)"
if [ -n "$leaked" ]; then
  emit_block "임시 프리뷰 누출" "다음 시안 임시 파일이 스테이징됐습니다 — 승자 이식분만 커밋하세요.
unstage 예시:  git restore --staged <파일>

${leaked}"
fi

echo "🔍 프리커밋 검사 시작..." >&2
run "lint" pnpm lint
run "typecheck" pnpm typecheck

# test — package.json에 test 스크립트가 있을 때만 (현재는 없음 → 건너뜀)
if jq -e '.scripts.test' package.json >/dev/null 2>&1; then
  run "test" pnpm test
  pass_msg="✅ 프리커밋 검사 통과 — lint·typecheck·test OK"
else
  echo "→ test 스크립트 없음 — 건너뜀" >&2
  pass_msg="✅ 프리커밋 검사 통과 — lint·typecheck OK (test 없음)"
fi

printf '{"systemMessage":%s}' "$(json_str "$pass_msg")"
exit 0
