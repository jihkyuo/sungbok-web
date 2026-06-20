#!/usr/bin/env bash
# design:lint — 디자인 토큰 규율 정적 체크
#
# 프로덕션 컴포넌트에서 b1 토큰을 우회하는 색 하드코딩을 잡는다.
#   pnpm design:lint                  # 풀스캔(경고 리포트, 항상 exit 0)
#   pnpm design:lint --diff           # 스테이징+워킹 추가 라인만, 신규 위반 시 exit 1 (커밋 게이트용)
#   pnpm design:lint --update-baseline # 현재 위반을 .design-lint-baseline 에 스냅샷(레거시 grandfather)
#
# 카테고리:
#   error(차단): 색-fill arbitrary 유틸 `(bg|text|border|from|to|via|fill|stroke|ring|outline|decoration|caret|accent|divide)-[#hex]`
#   warn(경고만): 인라인 rgba()/hsl() (토큰 없는 1회성 그림자/그라데이션 alpha는 정당)
#
# 이스케이프 해치:
#   · 같은 라인에 `design-lint-ignore` 가 있으면 면제
#   · .design-lint-baseline 에 등재된 (파일, #hex) 쌍은 grandfather(차단 안 함)
#
# 비-git/대상 없음/판정 불가 → fail-open(작업을 막지 않음).

set -uo pipefail

# --- 프로젝트 루트 -----------------------------------------------------------
project_dir="${CLAUDE_PROJECT_DIR:-}"
if [ -z "$project_dir" ]; then
  project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fi
cd "$project_dir" 2>/dev/null || exit 0

baseline_file="$project_dir/.design-lint-baseline"

# 색-fill arbitrary 유틸 (hex만) — error 카테고리
util_re='(bg|text|border|from|to|via|fill|stroke|ring|outline|decoration|caret|accent|divide)-\[#[0-9A-Fa-f]{3,8}\]'
# 인라인 색함수 — warn 카테고리
warn_re='(rgba?|hsla?)\('

# --- 프로덕션 스코프 판정 ----------------------------------------------------
# src/ 의 .ts/.tsx 중 프리뷰·시안·테스트·타입선언 제외
is_production() {
  case "$1" in src/*) ;; *) return 1 ;; esac
  case "$1" in *.tsx|*.ts) ;; *) return 1 ;; esac
  case "$1" in
    */_variants/*|*-preview/*) return 1 ;;
    *.test.ts|*.test.tsx|*.spec.ts|*.spec.tsx|*.d.ts) return 1 ;;
  esac
  return 0
}

# --- baseline 로드 (file<TAB>#hex, hex 소문자) -------------------------------
baseline_keys=""
# tr -d '\r': CRLF 베이스라인이 grep -qxF 매칭을 조용히 깨뜨려 grandfather가 무력화되는 것 방지
[ -f "$baseline_file" ] && baseline_keys="$(tr -d '\r' < "$baseline_file" 2>/dev/null | grep -v '^[[:space:]]*#' | grep -v '^[[:space:]]*$' || true)"

in_baseline() {  # $1=file  $2=#hex(원본) → 등재돼 있으면 0
  [ -n "$baseline_keys" ] || return 1
  local hex_lc; hex_lc="$(printf '%s' "$2" | tr 'A-F' 'a-f')"
  printf '%s\n' "$baseline_keys" | grep -qxF "$1	$hex_lc"
}

# 한 라인에서 색-fill 유틸 hex 토큰들을 추출(공백 구분) — 없으면 빈줄
extract_hexes() {
  printf '%s' "$1" | grep -oE "$util_re" 2>/dev/null | grep -oE '#[0-9A-Fa-f]{3,8}' 2>/dev/null | tr '\n' ' '
}

# --- 모드 분기 ---------------------------------------------------------------
mode="full"
case "${1:-}" in
  --diff) mode="diff" ;;
  --update-baseline) mode="baseline" ;;
  "" ) mode="full" ;;
  *) echo "알 수 없는 옵션: $1 (사용: --diff | --update-baseline | 없음)" >&2; exit 2 ;;
esac

# ============================================================================
# --update-baseline : 현재 프로덕션 위반을 스냅샷
# ============================================================================
if [ "$mode" = "baseline" ]; then
  command -v git >/dev/null 2>&1 || { echo "git 없음 — baseline 생략" >&2; exit 0; }
  tmp="$(mktemp)"
  # 추적되는 프로덕션 .ts/.tsx 만 대상
  git ls-files 'src/**/*.ts' 'src/**/*.tsx' 2>/dev/null | while IFS= read -r f; do
    is_production "$f" || continue
    while IFS= read -r line; do
      case "$line" in *design-lint-ignore*) continue ;; esac
      hexes="$(extract_hexes "$line")"
      for h in $hexes; do
        printf '%s\t%s\n' "$f" "$(printf '%s' "$h" | tr 'A-F' 'a-f')"
      done
    done < <(grep -hE "$util_re" "$f" 2>/dev/null || true)
  done | sort -u > "$tmp"
  {
    echo "# design-lint baseline — grandfather된 레거시 (파일<TAB>#hex 소문자)"
    echo "# 재생성: pnpm design:lint --update-baseline. 신규 위반은 여기 추가하지 말 것."
    cat "$tmp"
  } > "$baseline_file"
  rm -f "$tmp"
  echo "✅ .design-lint-baseline 갱신: $(grep -vc '^#' "$baseline_file" 2>/dev/null | tr -d ' ') 항목"
  exit 0
fi

# ============================================================================
# 공통: (file, lineno, linecontent) 스트림을 받아 error/warn 분류·집계
# ============================================================================
errors=""   # 줄당: file:lineno — token
warns=""    # 줄당: file:lineno — rgba/hsl
grandfathered=0

classify_line() {  # $1=file $2=lineno $3=content
  local f="$1" ln="$2" content="$3"
  case "$content" in *design-lint-ignore*) return ;; esac
  # error: 색-fill hex
  local hexes; hexes="$(extract_hexes "$content")"
  if [ -n "${hexes// /}" ]; then
    for h in $hexes; do
      if in_baseline "$f" "$h"; then
        grandfathered=$((grandfathered + 1))
      else
        errors="${errors}${f}:${ln} — ${h} (b1 토큰으로 교체)"$'\n'
      fi
    done
  fi
  # warn: rgba/hsl
  if printf '%s' "$content" | grep -qE "$warn_re" 2>/dev/null; then
    warns="${warns}${f}:${ln} — rgba/hsl 인라인 (토큰 가능하면 토큰; 1회성 alpha면 /* design-lint-ignore */)"$'\n'
  fi
}

if [ "$mode" = "diff" ]; then
  command -v git >/dev/null 2>&1 || exit 0
  git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
  # 스테이징(--cached) ∪ 워킹(-a/-am 대비) 추가 라인. file<TAB>content 로 평탄화.
  # core.quotePath=false: 비ASCII(한글 등) 경로가 "b/\355\234..." 로 인용돼 파일명이 깨지는 것 방지
  diff_stream="$(
    { git -c core.quotePath=false diff --cached -U0 --no-color 2>/dev/null
      git -c core.quotePath=false diff -U0 --no-color 2>/dev/null
    } | awk '
      /^\+\+\+ /{ f=$0; sub(/^\+\+\+ b\//,"",f); sub(/\r$/,"",f); next }
      /^\+/ && !/^\+\+\+/ { print f "\t" substr($0,2) }
    '
  )"
  # 추가 라인엔 행번호가 없으므로 "(diff)" 로 표기
  while IFS=$'\t' read -r f content; do
    [ -n "$f" ] || continue
    is_production "$f" || continue
    classify_line "$f" "(추가됨)" "$content"
  done < <(printf '%s\n' "$diff_stream")
else
  # full 스캔: 추적되는 프로덕션 파일 전체
  command -v git >/dev/null 2>&1 || exit 0
  while IFS= read -r f; do
    is_production "$f" || continue
    while IFS= read -r row; do
      ln="${row%%:*}"
      content="${row#*:}"
      classify_line "$f" "$ln" "$content"
    done < <(grep -nE "$util_re|$warn_re" "$f" 2>/dev/null || true)
  done < <(git ls-files 'src/**/*.ts' 'src/**/*.tsx' 2>/dev/null)
fi

# --- 출력 -------------------------------------------------------------------
err_n="$(printf '%s' "$errors" | grep -c . || true)"
warn_n="$(printf '%s' "$warns" | grep -c . || true)"

if [ "$err_n" -gt 0 ]; then
  echo "🔴 토큰 규율 위반(색 하드코딩) — $err_n 건:"
  printf '%s' "$errors" | sed 's/^/   /'
fi
if [ "$warn_n" -gt 0 ]; then
  echo "🟡 인라인 색함수(경고, 차단 아님) — $warn_n 건:"
  printf '%s' "$warns" | sed 's/^/   /'
fi
[ "$grandfathered" -gt 0 ] && echo "ℹ️  baseline grandfather $grandfathered 건 통과 (레거시)"

if [ "$err_n" -eq 0 ] && [ "$warn_n" -eq 0 ]; then
  echo "✅ design:lint — 색 하드코딩 위반 없음"
fi

# diff 모드만 error 로 차단. 풀스캔은 항상 통과(리포트 전용).
if [ "$mode" = "diff" ] && [ "$err_n" -gt 0 ]; then
  echo "" >&2
  echo "→ 신규 색 하드코딩이 있습니다. b1 토큰(bg-b1-accent 등)으로 바꾸거나," >&2
  echo "  토큰이 없는 1회성이면 같은 라인에 /* design-lint-ignore: 사유 */ 를 다세요." >&2
  exit 1
fi
exit 0
