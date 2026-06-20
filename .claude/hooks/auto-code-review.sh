#!/usr/bin/env bash
# 코드리뷰 자동 트리거 훅 (Claude Code Stop)
# 작업이 끝나 응답을 마치려는 순간, 워킹트리 변경이 "리뷰가 필요한" 규모면
# 현재 세션이 /code-review 와 /codex 를 실행하도록 block+reason 으로 되돌린다.
# (훅은 셸이라 슬래시 명령을 직접 못 돌린다 → 세션에 지시를 주입하는 방식)
#
#   발동 기준(OR): 로직 파일(camelCase .ts/.tsx · use* 훅) 변경
#                  | 변경 ≥ THRESH_LINES 줄 | 변경 파일 ≥ THRESH_FILES 개
#   제외          : *-preview/ · _variants/ · .md/ · .claude/ · lock 파일
#   사소한 변경   : 조용히 통과 → 병목 방지
#
#   루프/도배 방지:
#     1) stop_hook_active=true (리뷰 지시로 인한 재진입) → 통과 + 현재 상태 기록
#     2) 현재 diff 해시 == 마지막 리뷰한 해시 → 통과 (같은 변경 재촉 안 함)
#
# 판정 불가/환경 문제(jq 없음, git 아님 등)는 fail-open — 작업을 막지 않는다.

set -uo pipefail

# --- 튜닝 노브 (여기만 고치면 민감도 조절) ---------------------------------
THRESH_LINES=80   # 변경 라인 합이 이 이상이면 발동
THRESH_FILES=5    # 변경 파일 수가 이 이상이면 발동
# ---------------------------------------------------------------------------

payload="$(cat)"

# jq 없으면 판정 불가 → fail-open
command -v jq >/dev/null 2>&1 || exit 0

stop_active="$(printf '%s' "$payload" | jq -r '.stop_hook_active // false' 2>/dev/null)"

# 프로젝트 루트 (CLAUDE_PROJECT_DIR 우선, 없으면 스크립트 위치 기준)
project_dir="${CLAUDE_PROJECT_DIR:-}"
if [ -z "$project_dir" ]; then
  project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fi
cd "$project_dir" 2>/dev/null || exit 0

# git 저장소가 아니면 통과
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

state_file="$project_dir/.claude/.last-review-hash"

# 노이즈 제외 패턴 (시안 프리뷰·문서·상태파일·lock)
exclude_re='(^|/)[^/]+-preview/|(^|/)_variants/|^\.md/|^\.claude/|(^|/)pnpm-lock\.yaml$|(^|/)package-lock\.json$|(^|/)yarn\.lock$'

# 변경 파일 목록: 추적-변경(HEAD 대비) + 신규(untracked), 노이즈 제외
tracked_changed="$(git diff --name-only HEAD 2>/dev/null | grep -Ev "$exclude_re" || true)"
untracked="$(git ls-files --others --exclude-standard 2>/dev/null | grep -Ev "$exclude_re" || true)"
all_changed="$(printf '%s\n%s\n' "$tracked_changed" "$untracked" | sed '/^[[:space:]]*$/d')"

# 현재 변경 상태 해시 (추적 diff + 신규 파일 내용) — 같은 변경 재리뷰 방지용
cur_hash="$(
  {
    git diff HEAD 2>/dev/null
    printf '%s\n' "$untracked"
    while IFS= read -r f; do
      [ -n "$f" ] && [ -f "$f" ] && cat "$f" 2>/dev/null
    done <<< "$untracked"
  } | shasum 2>/dev/null | awk '{print $1}'
)"

# --- 루프/도배 가드 ---------------------------------------------------------
# 1) 리뷰 지시로 인한 재진입 → 통과 + 그 시점 상태를 '리뷰 완료'로 기록
if [ "$stop_active" = "true" ]; then
  printf '%s' "$cur_hash" > "$state_file" 2>/dev/null || true
  exit 0
fi

# 2) 같은 변경을 이미 리뷰했으면 통과
if [ -f "$state_file" ] && [ "$(cat "$state_file" 2>/dev/null)" = "$cur_hash" ]; then
  exit 0
fi

# --- 변경 규모/성격 판정 ----------------------------------------------------
# 로직 파일 판정 (tdd-guard.sh 와 동일 기준)
is_logic_file() {
  local f="$1" base ext name
  base="$(basename "$f")"
  ext="${base##*.}"
  name="${base%.*}"
  case "$ext" in ts|tsx) ;; *) return 1 ;; esac
  case "$base" in
    *.test.ts|*.test.tsx|*.spec.ts|*.spec.tsx|*.d.ts) return 1 ;;
    index.ts|index.tsx|data.ts|types.ts|*.types.ts|*.config.ts|*.config.mts|*.config.tsx) return 1 ;;
  esac
  case "$f" in src/app/*) return 1 ;; esac   # 페이지/라우트 = 디자인 영역
  case "$name" in [A-Z]*) return 1 ;; esac   # PascalCase = React 컴포넌트
  return 0                                    # camelCase .ts/.tsx · use* → 로직
}

file_count="$(printf '%s\n' "$all_changed" | sed '/^[[:space:]]*$/d' | wc -l | tr -d ' ')"

# 변경 라인 수: 추적(numstat) + 신규(wc -l)
tracked_lines="$(git diff --numstat HEAD 2>/dev/null | grep -Ev "$exclude_re" \
  | awk '{a += ($1=="-"?0:$1); d += ($2=="-"?0:$2)} END{print a + d + 0}')"
untracked_lines=0
while IFS= read -r f; do
  [ -n "$f" ] && [ -f "$f" ] || continue
  n="$(wc -l < "$f" 2>/dev/null || echo 0)"
  untracked_lines=$((untracked_lines + n))
done <<< "$untracked"
total_lines=$((tracked_lines + untracked_lines))

# 로직 파일 포함 여부
has_logic=0
while IFS= read -r f; do
  [ -n "$f" ] || continue
  if is_logic_file "$f"; then has_logic=1; break; fi
done <<< "$all_changed"

# --- 발동 판정 --------------------------------------------------------------
if [ "$has_logic" -eq 0 ] && [ "$total_lines" -lt "$THRESH_LINES" ] && [ "$file_count" -lt "$THRESH_FILES" ]; then
  exit 0   # 사소한 변경 → 조용히 통과
fi

# --- 리뷰 발동: block + reason ---------------------------------------------
json_str() { printf '%s' "$1" | jq -Rs .; }

if [ "$has_logic" -eq 1 ]; then
  why="로직 파일 변경"
else
  why="변경 규모(${total_lines}줄 / ${file_count}파일)"
fi

reason=$(json_str "이 작업의 변경이 자동 코드리뷰 기준을 넘었습니다 (${why}). 끝내기 전에 다음 두 리뷰로 자가검증하라:

1) /code-review — 변경분의 정확성 버그 + 재사용/단순화/컨벤션 리뷰
2) /codex — 다른 모델(OpenAI Codex)로 교차검증

두 리뷰를 모두 실행한 뒤, 핵심 발견사항을 요약하고 심각한 문제는 고친 다음 마쳐라. 리뷰가 끝나면 이 훅은 같은 변경을 다시 막지 않는다.")

printf '{"decision":"block","reason":%s}' "$reason"
exit 0
