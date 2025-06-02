import {
  PlaylistItemsRequestDto,
  PlaylistRequestDto,
} from '@/domains/worship-video/api/dto/request.dto';

// 재생목록 리스트
export const getPlaylistApi = async ({ id, ...args }: PlaylistRequestDto = {}) => {
  return await gapi.client.youtube.playlists.list({
    part: ['snippet', 'contentDetails'],
    ...(id ? { id } : { channelId: process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID }),
    ...args,
  });
};

// 재생목록의 영상 리스트
export const getPlaylistItemsApi = async (args: PlaylistItemsRequestDto) => {
  return await gapi.client.youtube.playlistItems.list({
    part: ['snippet', 'contentDetails'],
    ...args,
  });
};
