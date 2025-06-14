import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

// 유튜브 채널 ID 조회 (최초 채널 ID 확인시에만 사용하면 됨)
export const getYoutubeChannelId = async (username: string) => {
  return (
    await youtube.search.list({
      q: username,
    })
  ).data;
};

interface YoutubePlaylistProps {
  playlistIds?: string[]; // 전체조회(undefined) 특정조회(string[])
  maxResults?: number; // 최대 결과 수
}

// 재생목록 리스트
export const getYoutubePlaylists = async ({ playlistIds, ...args }: YoutubePlaylistProps = {}) => {
  const response = await youtube.playlists.list({
    part: ['snippet', 'contentDetails'],
    ...(playlistIds ? { id: playlistIds } : { channelId: process.env.YOUTUBE_CHANNEL_ID }),
    ...args,
  });
  return response.data;
};

// 재생목록의 영상 리스트
export const getPlaylistItems = async (playlistId: string, pageToken?: string) => {
  return await youtube.playlistItems.list({
    part: ['snippet', 'contentDetails'],
    playlistId: playlistId,
    maxResults: 50,
    pageToken,
  });
};

// 영상 상세 정보 조회
export const getVideoDetails = async (videoId: string) => {
  return await youtube.videos.list({
    part: ['snippet', 'contentDetails', 'statistics'],
    id: [videoId],
  });
};
