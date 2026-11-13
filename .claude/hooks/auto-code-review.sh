#!/usr/bin/env bash
# 코드리뷰 자동 트리거 훅 (Claude Code Stop)
# 작업이 끝나 응답을 마치려는 순간, 워킹트리 변경이 "리뷰가 필요한" 규모면
# 현재 세션이 (규모에 맞는) 코드리뷰를 실행하도록 block+reason 으로 되돌린다.
# (훅은 셸이라 슬래시 명령을 직접 못 돌린다 → 세션에 지시를 주입하는 방식)
#
#   발동 기준(OR): 로직 파일(camelCase .ts/.tsx · use* 훅) 변경
#                  | 변경 ≥ THRESH_LINES 줄 | 변경 파일 ≥ THRESH_FILES 개
#   리뷰 무게     : 크기 비례 — 작은 변경은 /code-review 단일, 큰 변경은 +/codex.
#   제외          : *-preview/ · _variants/ · .md/ · .claude/ · lock 파일
#   사소한 변경   : 조용히 통과 → 병목 방지
#
#   루프/도배 방지:
#     1) stop_hook_active=true (리뷰 지시로 인한 재진입) → 통과 + 현재 상태 기록
#     2) 현재 diff 해시 == 마지막 리뷰한 해시 → 통과 (같은 변경 재촉 안 함)
#     3) 마지막 편집 이후 '필요 리뷰 세트'를 이미 다 돌렸음(작은변경:code-review /
#        큰변경:code-review+codex) → 통과 (중복 리뷰 방지 + 큰변경 codex 누락 방지)
#     4) 리뷰 횟수 상한(선택, review-cap.sh): 마지막 커밋 뒤로 리뷰를 상한만큼 돌렸으면 통과.
#        상한이 있으면 큰 변경에도 /code-review 하나만 요구한다(codex 생략)
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

# 리뷰 횟수 상한(선택) — review-cap.sh. 못 읽으면 상한 없음으로 진행(fail-open)
review_max=""
if . "$(dirname "${BASH_SOURCE[0]}")/review-cap.sh" 2>/dev/null; then
  review_max="$(review_cap "$project_dir")"
fi

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

# 3) 이번 세션이 실제로 편집한 파일로 한정 (다른 세션의 미커밋 변경 오발동 방지)
#    Stop payload 의 transcript_path 에서 Edit/Write/MultiEdit/NotebookEdit 의
#    대상 파일을 뽑아 "현재 변경 목록 ∩ 이 세션이 편집한 파일" 만 리뷰 대상으로 본다.
#    transcript 를 못 읽으면(드묾) 기존 전체-워킹트리 기준으로 폴백한다.
#    회귀 잠금: tests/hooks/auto-code-review.test.ts "세션-한정(transcript) 스코프".
#    [롤백]    이 블록(3) 전체를 삭제하면 전체-워킹트리 기준으로 즉시 되돌아간다.
#    [비활성화] 훅 자체는 .claude/settings.json 의 Stop 항목에서 이 스크립트를 빼면 꺼진다.
transcript="$(printf '%s' "$payload" | jq -r '.transcript_path // empty' 2>/dev/null)"
if [ -n "$transcript" ] && [ -f "$transcript" ]; then
  proj_root="${project_dir%/}"   # 끝 슬래시 정규화 → 절대경로 strip 안정화
  session_files="$(jq -r '.message.content[]?
      | select(.type? == "tool_use"
               and (.name? == "Edit" or .name? == "Write"
                    or .name? == "MultiEdit" or .name? == "NotebookEdit"))
      | (.input.file_path // .input.notebook_path // empty)' \
      "$transcript" 2>/dev/null \
    | sed "s#^${proj_root}/##" | sed '/^[[:space:]]*$/d' | sort -u)"

  # 편집 0건(순수 질의응답 등) → 리뷰할 게 없음 → 통과
  [ -z "$session_files" ] && exit 0

  keep_session() { grep -Fxf <(printf '%s\n' "$session_files") 2>/dev/null || true; }
  tracked_changed="$(printf '%s\n' "$tracked_changed" | keep_session)"
  untracked="$(printf '%s\n' "$untracked" | keep_session)"
  all_changed="$(printf '%s\n%s\n' "$tracked_changed" "$untracked" | sed '/^[[:space:]]*$/d')"

  # 이 세션이 만진 변경이 (커밋됨/되돌림/제외패턴 등으로) 하나도 안 남으면 → 통과
  [ -z "$all_changed" ] && exit 0
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
  case "$name" in [[:upper:]]*) return 1 ;; esac   # PascalCase = React 컴포넌트 ([A-Z] 는 UTF-8 로케일에서 소문자도 매칭)
  return 0                                    # camelCase .ts/.tsx · use* → 로직
}

file_count="$(printf '%s\n' "$all_changed" | sed '/^[[:space:]]*$/d' | wc -l | tr -d ' ')"

# 변경 라인 수: 추적(numstat, 변경목록 한정) + 신규(wc -l)
#   파일명을 인자로 펼치지 않고(공백·glob 안전) numstat 를 스트림으로 받아,
#   변경목록($tracked_changed)에 든 경로만 awk 로 합산한다.
tracked_lines=0
if [ -n "$tracked_changed" ]; then
  tracked_lines="$(git diff --numstat HEAD 2>/dev/null \
    | awk -F'\t' '
        NR==FNR { keep[$0]=1; next }
        ($3 in keep) { a += ($1=="-"?0:$1); d += ($2=="-"?0:$2) }
        END { print a + d + 0 }' <(printf '%s\n' "$tracked_changed") -)"
fi
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

# 큰 변경 판정 — 리뷰 '무게'를 크기에 비례시키는 축(작으면 단일, 크면 +codex).
is_big=0
if [ "$total_lines" -ge "$THRESH_LINES" ] || [ "$file_count" -ge "$THRESH_FILES" ]; then
  is_big=1
fi

# --- 발동 판정 --------------------------------------------------------------
# 로직 변경은 크기 무관 항상 발동. 그 외엔 큰 변경만 발동.
if [ "$has_logic" -eq 0 ] && [ "$is_big" -eq 0 ]; then
  exit 0   # 사소한 변경 → 조용히 통과
fi

# --- 필요 리뷰 세트 이미-충족 가드 (중복/누락 동시 방지) --------------------
#   '필요한 리뷰 세트'를 '마지막 코드 편집 이후' 이 세션이 이미 다 돌렸으면 통과.
#     · 작은 변경(is_big=0): code-review(cr) 1종이면 충분.
#     · 큰 변경(is_big=1)  : code-review(cr) AND codex 둘 다 있어야 함.
#   cr 인정 : 스킬 code-review/diff-review · code-reviewer 서브에이전트.
#   codex 인정: 스킬 codex.
#   → 작은 변경의 중복 리뷰를 막고(병목 해소), 큰 변경의 codex 누락도 막는다(보증 유지).
#     동시에 reason 의 effort 지시를 '자기강제'한다 — 모델이 무시하면 필요 세트가
#     안 차서 다음 Stop 이 다시 막는다(가드 ①이 무한루프는 차단).
#   판정 불가(트랜스크립트 없음/구 jq)는 빈 결과 → 발동 진행(fail-safe: 덜 거름).
#   회귀 잠금: tests/hooks/auto-code-review.test.ts "required-set 이미-충족 가드".
#   [롤백]    이 블록만 삭제하면 '편집 후엔 항상 발동' 동작으로 되돌아간다.
if [ -n "${transcript:-}" ] && [ -f "${transcript:-}" ]; then
  reviewed_types="$(jq -rn '
      [ inputs
        | select(type == "object")
        | .message.content[]?
        | select(.type? == "tool_use")
        | if   (.name? == "Edit" or .name? == "Write"
                or .name? == "MultiEdit" or .name? == "NotebookEdit") then "edit"
          elif (.name? == "Skill" and ((.input.skill?) == "codex")) then "codex"
          elif (.name? == "Skill"
                and ((.input.skill?) == "code-review"
                     or (.input.skill?) == "diff-review")) then "cr"
          elif (.name? == "Agent"
                and (.input.subagent_type?) == "code-reviewer") then "cr"
          else empty end ]
      | (rindex("edit")) as $li
      | (if $li == null then . else .[($li + 1):] end)
      | map(select(. != "edit")) | unique | .[]' "$transcript" 2>/dev/null)"
  have_cr=0; have_codex=0
  while IFS= read -r _m; do
    case "$_m" in
      cr) have_cr=1 ;;
      codex) have_codex=1 ;;
    esac
  done <<< "$reviewed_types"
  # 상한이 있으면 큰 변경도 code-review 하나면 충족이다(codex 는 요구하지 않는다)
  if [ "$is_big" -eq 1 ] && [ -z "$review_max" ]; then
    [ "$have_cr" -eq 1 ] && [ "$have_codex" -eq 1 ] && exit 0
  else
    [ "$have_cr" -eq 1 ] && exit 0
  fi
fi

# --- 리뷰 횟수 상한 가드 ----------------------------------------------------
#   마지막 커밋 뒤로 리뷰(코드 리뷰·codex·디자인 QA 합산)를 상한만큼 돌렸으면 더 요구하지 않는다.
#   회귀 잠금: tests/hooks/auto-code-review.test.ts "리뷰 횟수 상한".
reviews_done=0
if [ -n "$review_max" ]; then
  reviews_done="$(reviews_since_commit "${transcript:-}")"
  review_cap_reached "$review_max" "$reviews_done" && exit 0
fi

# --- 리뷰 발동: block + reason ---------------------------------------------
json_str() { printf '%s' "$1" | jq -Rs .; }

if [ "$has_logic" -eq 1 ]; then
  why="로직 파일 변경"
else
  why="변경 규모(${total_lines}줄 / ${file_count}파일)"
fi

# 리뷰 무게를 크기에 비례 — 작으면 단일 /code-review, 크면 +codex 교차검증.
# 리뷰 횟수 상한이 있으면 큰 변경도 /code-review 하나만(codex 생략 — 디자인 QA 몫을 남긴다).
if [ "$is_big" -eq 1 ] && [ -n "$review_max" ]; then
  reason_text="이 작업의 변경이 자동 코드리뷰 기준을 넘었습니다 (${why} · 규모 큼: ${total_lines}줄 / ${file_count}파일). 끝내기 전에 다음 리뷰 하나로 자가검증하라:

/code-review high — 변경분의 정확성 버그 + 재사용/단순화/컨벤션 리뷰

이 컴퓨터는 리뷰 횟수 상한이 ${review_max}번이다(마지막 커밋 뒤 ${reviews_done}번 돌림) — 교차검증(codex)은 생략하고, 고친 뒤 같은 리뷰를 다시 돌리지 않는다. 발견사항을 요약하고 심각한 문제는 고친 다음 마쳐라. 리뷰가 끝나면 이 훅은 같은 변경을 다시 막지 않는다."
elif [ "$is_big" -eq 1 ]; then
  reason_text="이 작업의 변경이 자동 코드리뷰 기준을 넘었습니다 (${why} · 규모 큼: ${total_lines}줄 / ${file_count}파일). 끝내기 전에 다음 두 리뷰로 자가검증하라:

1) /code-review high — 변경분의 정확성 버그 + 재사용/단순화/컨벤션 리뷰
2) /codex — 다른 모델(OpenAI Codex)로 교차검증

두 리뷰를 모두 실행한 뒤, 핵심 발견사항을 요약하고 심각한 문제는 고친 다음 마쳐라. 리뷰가 끝나면 이 훅은 같은 변경을 다시 막지 않는다."
else
  reason_text="이 작업의 변경이 자동 코드리뷰 기준을 넘었습니다 (${why}). 규모가 작으니 가벼운 단일 리뷰로 자가검증하라:

/code-review medium — 변경분의 정확성 버그 + 재사용/단순화/컨벤션 리뷰

발견사항을 요약하고 심각한 문제는 고친 뒤 마쳐라. (작은 변경이라 교차검증·고강도 멀티에이전트 리뷰는 생략) 리뷰가 끝나면 이 훅은 같은 변경을 다시 막지 않는다."
fi

reason=$(json_str "$reason_text")
printf '{"decision":"block","reason":%s}' "$reason"
exit 0
