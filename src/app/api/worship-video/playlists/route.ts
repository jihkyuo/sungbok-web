import { NextResponse } from 'next/server';

import { fetchPlaylists } from '@/domains/worship-video/api/worshipVideo.server';
import { upstreamErrorResponse } from '@/shared/api/upstreamStatus.server';

// 주일예배 탭으로 보일 재생목록 — 서버가 미리 받지 못했을 때(빌드 중 실패 등) 화면이 직접 받는다.
// 유튜브 응답은 fetch Data Cache(1시간)에 있어 방문자 수만큼 유튜브를 부르지 않는다.
export async function GET() {
  try {
    return NextResponse.json(await fetchPlaylists());
  } catch (e) {
    return upstreamErrorResponse(e);
  }
}
