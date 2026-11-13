#!/usr/bin/env bash
# 디자인 QA 자동 트리거 훅 (Claude Code Stop)
# 작업이 끝나 응답을 마치려는 순간, 워킹트리에 "리뷰가 필요한" 규모의 UI 변경이
# 있으면 현재 세션이 /design-qa 를 실행하도록 block+reason 으로 되돌린다.
# auto-code-review.sh 와 형제 훅이며, **별도 상태파일**로 dedup이 독립이다
# (한쪽 리뷰 완료가 다른쪽을 '리뷰완료'로 찍지 않음).
#
#   발동 기준: UI 파일 변경(PascalCase/index .tsx · components/ · src/app 라우트 · .css)
#             AND (변경 ≥ THRESH_LINES 줄 OR 변경 파일 ≥ THRESH_FILES 개)
#   제외      : *-preview/ · _variants/ · .md/ · .claude/ · lock 파일
#   .ts 훅(useScrollProgress 등)은 로직으로 분류돼 여기 안 잡힘 → code-review 경로.
#     reduced-motion 등 런타임 디자인 결함은 마일스톤 /design-review 에서 확정.
#
#   루프/도배 방지:
#     1) stop_hook_active=true (리뷰 지시로 인한 재진입) → 통과 + 현재 상태 기록
#     2) 현재 diff 해시 == 마지막 리뷰한 해시 → 통과
#     3) 리뷰 횟수 상한(선택, review-cap.sh): 마지막 커밋 뒤로 리뷰를 상한만큼 돌렸으면 통과
#
# 판정 불가/환경 문제(jq 없음, git 아님 등)는 fail-open — 작업을 막지 않는다.

set -uo pipefail

# --- 튜닝 노브 -------------------------------------------------------------
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

state_file="$project_dir/.claude/.last-design-review-hash"

# 노이즈 제외 패턴 (시안 프리뷰·문서·상태파일·lock) — auto-code-review 와 동일
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

# --- UI(디자인) 파일 판정 ---------------------------------------------------
# is_logic_file 의 역: 컴포넌트(.tsx)·라우트·스타일(.css)을 디자인 표면으로 본다.
# .ts 로직/훅은 제외(code-review 경로). 노이즈는 위 exclude_re 에서 이미 빠짐.
is_design_file() {
  local f="$1" base name
  case "$f" in *.css) return 0 ;; esac
  case "$f" in *.tsx) ;; *) return 1 ;; esac
  case "$f" in *.test.tsx|*.spec.tsx) return 1 ;; esac
  base="$(basename "$f")"; name="${base%.*}"
  case "$f" in
    */components/*) return 0 ;;   # features/widgets/layout/ui 컴포넌트
    src/app/*) return 0 ;;        # 페이지/라우트
  esac
  case "$base" in index.tsx) return 0 ;; esac   # 컴포넌트 배럴 = 컴포넌트
  case "$name" in [[:upper:]]*) return 0 ;; esac      # PascalCase = 컴포넌트 ([A-Z] 는 UTF-8 로케일에서 소문자도 매칭)
  return 1
}

# --- 디자인(UI) 파일만 추려 규모 산정 ---------------------------------------
# 임계는 'UI 파일'만 센다 — 작은 UI 변경 + 큰 비-UI churn 에 오발동하지 않도록.
# (비-UI 로직/문서 churn 은 code-review 훅이 자기 기준으로 따로 판단.)
design_files="$(while IFS= read -r f; do
  [ -n "$f" ] && is_design_file "$f" && printf '%s\n' "$f"
done <<< "$all_changed")"

# UI 변경이 없으면 침묵(로직-only는 code-review 훅 담당).
[ -n "$design_files" ] || exit 0

design_file_count="$(printf '%s\n' "$design_files" | sed '/^[[:space:]]*$/d' | wc -l | tr -d ' ')"

# UI 파일의 변경 라인 합: 신규(untracked)는 전체 줄수, 추적은 numstat
design_lines=0
while IFS= read -r f; do
  [ -n "$f" ] || continue
  if printf '%s\n' "$untracked" | grep -qxF "$f"; then
    [ -f "$f" ] && design_lines=$((design_lines + $(wc -l < "$f" 2>/dev/null || echo 0)))
  else
    n="$(git diff --numstat HEAD -- "$f" 2>/dev/null \
      | awk '{a += ($1=="-"?0:$1); d += ($2=="-"?0:$2)} END{print a + d + 0}')"
    design_lines=$((design_lines + ${n:-0}))
  fi
done <<< "$design_files"

# --- 발동 판정: UI 변경이 사소하면 침묵 -------------------------------------
if [ "$design_lines" -lt "$THRESH_LINES" ] && [ "$design_file_count" -lt "$THRESH_FILES" ]; then
  exit 0
fi

# --- 리뷰 횟수 상한 가드 ----------------------------------------------------
#   마지막 커밋 뒤로 리뷰(코드 리뷰·codex·디자인 QA 합산)를 상한만큼 돌렸으면 더 요구하지 않는다.
#   review-cap.sh 를 못 읽으면 상한 없음으로 진행(fail-open).
#   회귀 잠금: tests/hooks/auto-design-review.test.ts "리뷰 횟수 상한".
if . "$(dirname "${BASH_SOURCE[0]}")/review-cap.sh" 2>/dev/null; then
  review_max="$(review_cap "$project_dir")"
  if [ -n "$review_max" ]; then
    transcript="$(printf '%s' "$payload" | jq -r '.transcript_path // empty' 2>/dev/null)"
    review_cap_reached "$review_max" "$(reviews_since_commit "$transcript")" && exit 0
  fi
fi

# --- 리뷰 발동: block + reason ---------------------------------------------
json_str() { printf '%s' "$1" | jq -Rs .; }

reason=$(json_str "이 작업의 UI 변경이 디자인 QA 기준을 넘었습니다 (UI 변경 규모 ${design_lines}줄 / ${design_file_count}파일). 끝내기 전에 다음으로 자가검증하라:

/design-qa — 변경된 UI를 루트 DESIGN.md 바(토큰 규율·카피 톤·모션 바·한글 타이포·a11y·subtraction)에 비춰 검토

심각도별 발견을 요약하고 🔴(바 위반)은 고친 다음 마쳐라. 모션/대비처럼 소스로 확정 못 하는 항목은 '확인 필요(라이브 /design-review)'로 남겨라. 리뷰가 끝나면 이 훅은 같은 변경을 다시 막지 않는다.")

printf '{"decision":"block","reason":%s}' "$reason"
exit 0
