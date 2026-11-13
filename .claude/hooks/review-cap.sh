#!/usr/bin/env bash
# 자동 리뷰 횟수 상한(선택) — auto-code-review.sh · auto-design-review.sh 가 source 한다.
#
#   상한 N 을 두면, 이 세션에서 «마지막 커밋 뒤로» 리뷰를 N번 시작한 다음부터는 두 훅이 더 요구하지 않는다
#   (코드 리뷰·코덱스·디자인 QA 를 합쳐서 센다 — 고친 뒤 다시 리뷰하는 일이 끝없이 이어지지 않게).
#   상한이 있으면 코드 리뷰 훅은 큰 변경에도 /code-review 하나만 요구한다(코덱스 교차검증은 생략).
#
#   상한 두는 곳(앞이 우선):
#     1) 환경변수 AUTO_REVIEW_MAX
#     2) .claude/review-max.local — 숫자 한 줄. git 에 올리지 않는다(컴퓨터마다 다르게 둔다)
#   둘 다 없거나 숫자가 아니면 상한 없음(예전 동작 그대로).
#
#   리뷰로 세는 것: 스킬 code-review·diff-review·codex·design-qa, 서브에이전트 code-reviewer·design-reviewer,
#                  셸에서 돌린 `codex exec`·`codex review`(명령의 맨 앞이나 `;`·`&&`·`|`·줄바꿈 바로 뒤에 올 때만 —
#                  글자만 들어 있는 다른 명령은 세지 않는다). 실패한 실행도 한 번으로 센다(구분할 수 없다).

# 상한 값(숫자) 또는 빈 문자열
review_cap() {
  local project_dir="$1" v="${AUTO_REVIEW_MAX:-}"
  if [ -z "$v" ] && [ -f "$project_dir/.claude/review-max.local" ]; then
    v="$(head -n 1 "$project_dir/.claude/review-max.local" 2>/dev/null)"
  fi
  v="$(printf '%s' "$v" | tr -d '[:space:]')"
  case "$v" in ''|*[!0-9]*) printf '' ;; *) printf '%s' "$v" ;; esac
}

# 이 세션이 마지막 커밋 뒤로 시작한 리뷰 횟수. 트랜스크립트를 못 읽으면 0(상한에 걸리지 않는다 — 덜 거른다).
#   «마지막 커밋 뒤» 는 시각으로 가린다: 트랜스크립트 줄의 timestamp 가 HEAD 커밋 시각보다 뒤인 리뷰만 센다.
#   (명령 글자에서 `git commit` 을 찾는 방식은 그 글자가 든 다른 명령에 속는다.) 시각이 없는 줄은 센다.
reviews_since_commit() {
  local transcript="$1" head_epoch n
  [ -n "$transcript" ] && [ -f "$transcript" ] || { printf '0'; return; }
  head_epoch="$(git log -1 --format=%ct 2>/dev/null)"
  case "$head_epoch" in ''|*[!0-9]*) head_epoch=0 ;; esac
  n="$(jq -rn --argjson head "$head_epoch" '
      [ inputs
        | select(type == "object")
        # 모델이 낸 줄만 — 같은 내용을 한 번 더 적어 두는 줄(api-request-blob, 시각 없음)까지 세면 두 배가 된다
        | select(.type? == "assistant")
        | (.timestamp? // null) as $ts
        | ($ts | if type == "string"
                 then (try (sub("\\.[0-9]+Z$"; "Z") | fromdateiso8601) catch null)
                 else null end) as $at
        | select($at == null or $at > $head)
        | .message.content[]?
        | select(.type? == "tool_use")
        | (.input.command? // "") as $cmd
        | if   (.name? == "Skill"
                and ((.input.skill? // "") | IN("code-review", "diff-review", "codex", "design-qa"))) then 1
          elif (.name? == "Agent"
                and ((.input.subagent_type? // "") | IN("code-reviewer", "design-reviewer"))) then 1
          elif (.name? == "Bash" and ($cmd | test("(^|[;&|\n])\\s*codex\\s+(exec|review)(\\s|$)"))) then 1
          else empty end ]
      | length' "$transcript" 2>/dev/null)"
  case "$n" in ''|*[!0-9]*) printf '0' ;; *) printf '%s' "$n" ;; esac
}

# 상한이 있고 이미 그만큼 돌렸으면 0(참)
review_cap_reached() {
  local cap="$1" done_count="$2"
  [ -n "$cap" ] && [ "$done_count" -ge "$cap" ]
}
