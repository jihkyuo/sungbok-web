'use client';

import { usePlaylistVideos } from '@/domains/worship-video/api/usePlaylistVideos';
import { PlaylistGrid } from '@/domains/worship-video/components/features/PlaylistGrid';
import { QueryStatus } from '@/domains/worship-video/components/features/StatusText';

interface Props {
  playlistId: string;
}

/**
 * 재생목록 하나의 영상 — 받은 목록이 있으면 그대로 보이고(백그라운드 재요청이 실패해도 유지),
 * 없거나 비었으면 알림 영역 안에서 불러오는 중·실패(다시 시도)·빈 목록 문구를 보인다.
 * 실패한 쿼리는 탭을 다시 열면 react-query 가 알아서 다시 받는다.
 */
export const Playlist = ({ playlistId }: Props) => {
  const q = usePlaylistVideos(playlistId);
  if (q.data?.length) return <PlaylistGrid videos={q.data} />;
  return <QueryStatus query={q} empty="이 재생목록에 볼 수 있는 영상이 없습니다." />;
};
