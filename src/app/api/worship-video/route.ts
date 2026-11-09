import { NextResponse, type NextRequest } from 'next/server';

import {
  fetchPlaylistVideos,
  isChannelPlaylist,
} from '@/domains/worship-video/api/worshipVideo.server';
import { upstreamErrorResponse } from '@/shared/api/upstreamStatus.server';

// 주일예배 탭의 영상 목록. 유튜브 응답은 fetch Data Cache(1시간)에 있어 여기서는 거르기만 한다.
// 우리 채널 재생목록만 허용한다(남의 재생목록으로 쿼터를 쓰지 못하게).
export async function GET(req: NextRequest) {
  const playlistId = req.nextUrl.searchParams.get('playlistId');
  if (!playlistId) return NextResponse.json({ error: 'playlistId required' }, { status: 400 });

  try {
    if (!(await isChannelPlaylist(playlistId))) {
      return NextResponse.json({ error: 'unknown playlist' }, { status: 404 });
    }
    return NextResponse.json(await fetchPlaylistVideos(playlistId));
  } catch (e) {
    // 쿼터 소진 429 / 유튜브 일시 장애 503 / 그 밖 502 — 화면은 503 만 다시 시도한다
    return upstreamErrorResponse(e);
  }
}
