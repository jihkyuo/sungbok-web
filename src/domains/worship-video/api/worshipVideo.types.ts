// 서버(worshipVideo.server)와 클라이언트(usePlaylistVideos)가 함께 쓰는 응답 모양. 화면에 필요한 필드만 둔다.
export type PlaylistSummary = { id: string; title: string };
export type PlaylistVideo = { id: string; title: string; thumbnail: string };
