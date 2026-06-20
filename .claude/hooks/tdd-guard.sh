#!/usr/bin/env bash
# TDD 가드 훅 (Claude Code PreToolUse / Edit·Write·MultiEdit)
# 테스트가 필요한 "로직" 파일을 작성할 때만 RED-first(실패 테스트 먼저)를 유도한다.
# 이 사이트는 디자인 작업이 대부분이라, 범위를 로직으로 좁혀 디자인 흐름을 막지 않는다.
#
#   통과(무동작): 디자인/시안/페이지/.tsx 컴포넌트(PascalCase)/정적 데이터/배럴/설정/타입선언
#   가드 대상   : camelCase .ts·.tsx 로직 모듈 + use* 훅
#       · 신규 로직 파일(함수 포함) + 형제 테스트 없음 → 차단(deny): 실패 테스트 먼저 쓰게
#       · 기존 로직 파일 수정     + 형제 테스트 없음 → 넛지(차단 안 함, 알림만)
#       · 형제 테스트 이미 있음 → 통과
#
# 판정 불가/환경 문제(jq 없음, 경로 추출 실패 등)는 fail-open — 작업을 막지 않는다.

set -uo pipefail

payload="$(cat)"

# jq 없으면 판정 불가 → fail-open
command -v jq >/dev/null 2>&1 || exit 0

file_path="$(printf '%s' "$payload" | jq -r '.tool_input.file_path // ""' 2>/dev/null)"
[ -n "$file_path" ] || exit 0

# 프로젝트 루트 (CLAUDE_PROJECT_DIR 우선, 없으면 스크립트 위치 기준)
project_dir="${CLAUDE_PROJECT_DIR:-}"
if [ -z "$project_dir" ]; then
  project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fi

# 상대경로면 프로젝트 루트 기준으로 절대화
case "$file_path" in
  /*) abs="$file_path" ;;
  *)  abs="$project_dir/$file_path" ;;
esac
rel="${abs#"$project_dir"/}"
base="$(basename "$abs")"
ext="${base##*.}"
name="${base%.*}"

# --- 무동작 통과(디자인/비로직) 필터 ---------------------------------------

# 1) 코드 확장자(.ts/.tsx)가 아니면 통과 — css·md·json·assets 등
case "$ext" in
  ts|tsx) ;;
  *) exit 0 ;;
esac

# 2) 테스트/타입선언 파일 자체는 통과
case "$base" in
  *.test.ts|*.test.tsx|*.spec.ts|*.spec.tsx|*.d.ts) exit 0 ;;
esac

# 3) 배럴/정적데이터/설정 파일 통과 (vitest coverage exclude 와 동일 기준)
case "$base" in
  index.ts|index.tsx|data.ts|*.config.ts|*.config.mts|*.config.tsx) exit 0 ;;
esac

# 4) 페이지/라우트·시안·프리뷰는 디자인 영역 → 통과
case "$rel" in
  src/app/*|*/_variants/*|*-preview/*) exit 0 ;;
esac

# 5) PascalCase basename = React 컴포넌트(디자인) → 통과
#    (이 레포 컨벤션: 컴포넌트는 PascalCase, 로직/훅은 camelCase·use*)
case "$name" in
  [A-Z]*) exit 0 ;;
esac

# 여기까지 왔으면: camelCase .ts/.tsx 로직 모듈 또는 use* 훅 → 가드 대상

# --- 형제 테스트 존재 여부 --------------------------------------------------
dir="$(dirname "$abs")"
for cand in \
  "$dir/$name.test.ts" "$dir/$name.test.tsx" \
  "$dir/$name.spec.ts" "$dir/$name.spec.tsx" \
  "$dir/__tests__/$name.test.ts" "$dir/__tests__/$name.test.tsx"; do
  [ -e "$cand" ] && exit 0   # 테스트 이미 있음 → 통과
done

json_str() { printf '%s' "$1" | jq -Rs .; }

# --- 신규 vs 기존 분기 ------------------------------------------------------
if [ -e "$abs" ]; then
  # 기존 파일: 디스크 내용에 함수가 있는 "로직" 파일일 때만 넛지(순수 데이터 파일은 침묵)
  if ! grep -Eq '(^|[^A-Za-z])function[ (]|=>|(^|[^A-Za-z])class ' "$abs" 2>/dev/null; then
    exit 0
  fi
  # 기존 로직 파일 수정 → 넛지(차단하지 않음)
  sys=$(json_str "🧪 TDD 넛지: ${rel} 는 테스트가 없는 로직 파일입니다. 동작/분기를 바꾼다면 실패 테스트(${name}.test.ts)부터 추가하는 걸 권장합니다. (차단 아님)")
  printf '{"systemMessage":%s}' "$sys"
  exit 0
fi

# 신규 파일 — content 에 함수가 있을 때만 차단(순수 데이터/상수 파일은 통과)
content="$(printf '%s' "$payload" | jq -r '.tool_input.content // ""' 2>/dev/null)"
if ! printf '%s' "$content" | grep -Eq '(^|[^A-Za-z])function[ (]|=>|(^|[^A-Za-z])class '; then
  exit 0   # 함수가 없는 신규 파일(정적 데이터 등) → 통과
fi

# 신규 로직 파일 + 테스트 없음 → 차단(deny)
sys=$(json_str "❌ TDD 가드: ${rel} 는 새 로직 파일인데 테스트가 없습니다 — RED-first로 진행하세요. (차단됨)")
reason=$(json_str "TDD 가드가 신규 로직 파일 생성을 차단했다. 다음 순서로 진행하라:
1) 먼저 ${dir}/${name}.test.ts 에 이 모듈의 동작을 검증하는 실패 테스트를 작성한다.
2) pnpm test 로 RED(실패) 확인.
3) 그 다음 ${rel} 를 구현해 GREEN으로 만든다.

(이 파일이 로직이 아니라 순수 데이터/상수라면 함수를 빼거나 data.ts·index.ts 로 명명하면 가드가 비켜갑니다.)")
printf '{"systemMessage":%s,"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":%s}}' "$sys" "$reason"
exit 0
