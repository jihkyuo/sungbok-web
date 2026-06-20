#!/usr/bin/env bash
# 회고 저널 — 가드 훅이 차단/넛지/fail-open 할 때 한 줄씩 기록한다.
# 이후 회고(/session-retro, v2)가 읽을 "가드가 발동했다 / 가드가 꺼졌다"의 객관 기록.
#
# 설계 원칙:
#   · jq 비의존. jq 가 없어 fail-open 하는 그 순간도 기록해야 하므로 printf 만 쓴다.
#   · best-effort. 어떤 실패도 훅 동작에 전파하지 않는다(호출부는 `|| true`).
#   · 경로는 RETRO_JOURNAL_FILE 로 오버라이드(기본 .claude/.retro-journal.log) → 테스트 격리.
#
# [비활성화/롤백] 이 파일을 삭제하면 각 훅의 source 블록이 journal_event 를 no-op 으로
#   폴백시켜 계측만 꺼지고 가드 동작은 그대로다(호출부는 전부 `|| true`).
#
# 라인 형식(파이프 구분, 1줄 = 1이벤트):
#   ISO8601 | TYPE | HOOK | DECISION | REASON | FILE
#   TYPE     : block | nudge | fail-open
#   DECISION : deny | block | nudge | pass

journal_event() {
  local type="${1:-}" hook="${2:-}" decision="${3:-}" reason="${4:-}" file="${5:-}"

  local proj="${CLAUDE_PROJECT_DIR:-}"
  if [ -z "$proj" ]; then
    proj="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." 2>/dev/null && pwd)" || proj="."
  fi
  local log="${RETRO_JOURNAL_FILE:-$proj/.claude/.retro-journal.log}"

  local ts
  ts="$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || echo '')"

  # 개행·파이프·탭 제거 → 한 줄 보장
  reason="$(printf '%s' "$reason" | tr '\n|\t' '   ')"
  file="$(printf '%s' "$file" | tr '\n|\t' '   ')"

  printf '%s|%s|%s|%s|%s|%s\n' "$ts" "$type" "$hook" "$decision" "$reason" "$file" \
    >> "$log" 2>/dev/null || true
}
