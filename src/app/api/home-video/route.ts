import { NextResponse } from 'next/server';

import { fetchHomeVideoFeed } from '@/domains/home/api/homeVideoFeed.server';
import { upstreamErrorResponse } from '@/shared/api/upstreamStatus.server';

export async function GET() {
  try {
    return NextResponse.json(await fetchHomeVideoFeed());
  } catch (e) {
    // 쿼터 소진 429 / 유튜브 일시 장애 503 / 그 밖 502 — 화면은 503 만 다시 시도한다
    return upstreamErrorResponse(e);
  }
}
