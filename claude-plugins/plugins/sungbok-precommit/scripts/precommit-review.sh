#!/usr/bin/env bash
# 프리커밋 리뷰 게이트 (Claude Code PreToolUse / Bash)
#
# Claude Code가 `git commit`을 실행하려 할 때, 커밋 대상 diff를 헤드리스
# `claude -p` 로 리뷰하고 **must-fix 가 발견되면 커밋을 차단**한다.
#   - 리뷰가 VERDICT: BLOCK → permissionDecision:"deny" + 리뷰 전문을 Claude에 전달.
#   - VERDICT: PASS / 판정 불가 → 통과(리뷰 요약은 systemMessage로 사용자에게 표시).
#
# 설계 원칙
#   - git commit 이 아닌 명령이면 즉시 무동작 통과(저렴).
#   - 재귀 가드: 리뷰용 nested claude 안에서 다시 이 훅이 돌지 않도록 환경변수로 차단.
#   - fail-open: claude/jq 부재·diff 없음·리뷰 오류 등 "환경/도구" 문제로는 커밋을
#     막지 않는다. 오직 명시적 BLOCK 판정일 때만 차단한다.

set -uo pipefail

# 0) 재귀 가드 — 리뷰용 nested claude 세션에서는 즉시 통과
if [ "${SUNGBOK_PRECOMMIT_REVIEW:-}" = "1" ]; then
  exit 0
fi

# 1) PreToolUse 페이로드(stdin JSON)에서 실행하려는 명령 추출
payload="$(cat)"

# jq 없으면 파싱 불가 → fail-open
if ! command -v jq >/dev/null 2>&1; then
  printf '%s' '{"systemMessage":"⚠️ jq를 찾을 수 없어 프리커밋 리뷰를 건너뜁니다 (커밋 진행)."}'
  exit 0
fi

command="$(printf '%s' "$payload" | jq -r '.tool_input.command // ""' 2>/dev/null)"

# 2) git commit 이 아니면 무동작 통과
case "$command" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

# 문자열을 JSON 문자열 리터럴로 안전 변환
json_str() { printf '%s' "$1" | jq -Rs .; }

# fail-open 통과(차단 아님): 사용자 안내만 남기고 커밋 진행
emit_pass() {
  printf '{"systemMessage":%s}' "$(json_str "$1")"
  exit 0
}

# 차단: systemMessage(사용자) + deny + 리뷰 전문(Claude)
emit_block() {
  local sys reason
  sys=$(json_str "❌ 프리커밋 리뷰가 must-fix 를 발견해 커밋을 차단했습니다. 아래 지적을 고친 뒤 다시 커밋하세요.")
  reason=$(json_str "프리커밋 리뷰 결과 must-fix(정확성·버그·빌드/타입 깨짐·디버그 잔재·시크릿 등)가 발견되어 커밋을 막았다. 아래 리뷰를 보고 고친 뒤 다시 커밋하라:

$1")
  printf '{"systemMessage":%s,"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":%s}}' "$sys" "$reason"
  exit 0
}

# 3) claude CLI 없으면 fail-open
if ! command -v claude >/dev/null 2>&1; then
  emit_pass "⚠️ claude CLI를 찾을 수 없어 프리커밋 리뷰를 건너뜁니다 (커밋 진행)."
fi

# 4) 프로젝트 루트로 이동 (CLAUDE_PROJECT_DIR 우선)
project_dir="${CLAUDE_PROJECT_DIR:-$PWD}"
cd "$project_dir" 2>/dev/null || emit_pass "⚠️ 프로젝트 루트 이동 실패 — 프리커밋 리뷰를 건너뜁니다 (커밋 진행)."

# 5) 리뷰 대상 diff 수집 — staged 우선, 없으면 (-a 커밋 대비) HEAD 대비 변경분
diff="$(git diff --staged 2>/dev/null)"
if [ -z "$diff" ]; then
  diff="$(git diff HEAD 2>/dev/null)"
fi
if [ -z "$diff" ]; then
  emit_pass "ℹ️ 리뷰할 변경분이 없어 프리커밋 리뷰를 건너뜁니다 (커밋 진행)."
fi

# diff 가 과도하게 크면 프롬프트 인자 한계를 피하려 앞부분만 사용(끝부분 절단 표시)
max=60000
if [ "${#diff}" -gt "$max" ]; then
  diff="$(printf '%s' "$diff" | head -c "$max")
... (diff 가 길어 이후 생략됨) ..."
fi

# 6) 리뷰 프롬프트 — 제공된 diff 만으로 must-fix 게이트 판정
prompt="너는 성복교회 웹(Next.js 15 App Router + TS + Tailwind 4) 변경분의 커밋 직전 게이트 리뷰어다. 아래 git diff 만으로 판단하라(추가 파일 읽기는 하지 마라). **커밋을 막아야 할 정도의 심각한 문제(must-fix)** 만 가려내라.

막아야 하는 것 (must-fix):
- 정확성 버그: 로직 오류, off-by-one, 잘못된 조건/부정, null/undefined/빈 배열 경계 미처리, async/await 누락·Promise 미대기·경쟁상태.
- React 특화: 의존성 배열 오류, 조건부 훅, 서버/클라 경계 위반, 하이드레이션 불일치.
- 빌드/타입 깨짐, 디버그 잔재(console.log·debugger), 충돌 마커(<<<<<<<), .only 테스트, 시크릿/키 하드코딩.

막지 않는 것 (보고만): 재사용·단순화·컨벤션·네이밍·포맷 등 스타일/개선 제안은 간단히 언급하되 통과시킨다.

거짓양성을 최소화하라 — 확신이 없거나 깨지는 시나리오를 떠올릴 수 없으면 must-fix 가 아니다.

출력: 발견 사항을 '파일:라인 — 문제 / 제안' 형식으로 간결히 적어라. 그리고 **마지막 줄에 정확히** 다음 중 하나만 출력하라: must-fix 가 하나라도 있으면 'VERDICT: BLOCK', 없으면 'VERDICT: PASS'.

--- git diff ---
$diff"

# 7) nested claude 로 리뷰 (재귀 가드 환경변수 설정). 실패/빈 출력은 fail-open.
review="$(SUNGBOK_PRECOMMIT_REVIEW=1 claude -p "$prompt" 2>/dev/null)"
if [ $? -ne 0 ] || [ -z "$review" ]; then
  emit_pass "⚠️ 프리커밋 리뷰 실행에 실패해 건너뜁니다 (커밋 진행)."
fi

# 8) 판정 — 마지막 VERDICT 토큰을 채택
verdict="$(printf '%s' "$review" | grep -oE 'VERDICT: (BLOCK|PASS)' | tail -1)"

case "$verdict" in
  *BLOCK*)
    emit_block "$review"
    ;;
  *PASS*)
    emit_pass "✅ 프리커밋 리뷰 통과 — must-fix 없음. (참고 의견은 트랜스크립트의 리뷰 본문 참고)"
    ;;
  *)
    # 판정 토큰을 못 찾음 → 강제로 막지 않되, 리뷰 본문을 사용자에게 보여준다.
    emit_pass "ℹ️ 프리커밋 리뷰 판정을 확정하지 못해 통과시킵니다 (커밋 진행). 리뷰 요지: ${review:0:300}"
    ;;
esac
