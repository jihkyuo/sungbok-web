#!/usr/bin/env bash
# pnpm preview — 시안 프리뷰용 dev 서버를 "빈 포트"에 자동으로 띄운다.
#
# 이 레포는 여러 세션이 동시에 dev 서버를 돌리므로(3000·3001·… 점유) 빈 포트를
# 손으로 찾는 수고를 없앤다. 선호 포트를 인자로 주면 그 포트부터 위로 탐색한다.
#   pnpm preview          # 3010부터 빈 포트 자동 탐색
#   pnpm preview 3030     # 3030부터 탐색
#
# pnpm dev -- -p <n> 는 '--'가 next로 잘못 전달돼 실패하므로, next를 직접 호출한다.
set -uo pipefail

start_port="${1:-3010}"
if ! [[ "$start_port" =~ ^[0-9]+$ ]]; then
  echo "❌ 포트는 숫자여야 합니다: '$start_port'  (예: pnpm preview 3030)" >&2
  exit 1
fi
max_port=$((start_port + 90))

# LISTEN 중인 소켓이 없으면 빈 포트(return 0)
is_free() {
  ! lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
}

port=""
p="$start_port"
while [ "$p" -le "$max_port" ]; do
  if is_free "$p"; then
    port="$p"
    break
  fi
  p=$((p + 1))
done

if [ -z "$port" ]; then
  echo "❌ $start_port~$max_port 사이에 빈 포트가 없습니다. (인자로 다른 시작 포트를 주세요: pnpm preview 3100)" >&2
  exit 1
fi

echo "▶ 빈 포트 $port 에서 dev 서버를 띄웁니다."
echo "   로컬:    http://localhost:$port"
echo "   프리뷰:  http://localhost:$port/<name>-preview?v=<id>"
echo

exec pnpm exec next dev -H 0.0.0.0 --turbopack -p "$port"
