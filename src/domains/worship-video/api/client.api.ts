import {
  PlaylistItemsRequestDto,
  PlaylistRequestDto,
} from '@/domains/worship-video/api/dto/request.dto';

// 재생목록 리스트
export const getPlaylistApi = async ({ id, ...args }: PlaylistRequestDto = {}) => {
  // 요청 파라미터는 googleapis(youtube_v3) 타입으로 통일하되, 브라우저용 gapi.client
  // 시그니처와는 $.xgafv 등 일부 타입만 다르고 런타임 형태는 동일하므로 경계에서 캐스팅.
  return (await gapi.client.youtube.playlists.list({
    part: ['snippet', 'contentDetails'],
    ...(id ? { id } : { channelId: process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID }),
    ...args,
  } as Parameters<typeof gapi.client.youtube.playlists.list>[0])).result;
};

// 재생목록의 영상 리스트
export const getPlaylistItemsApi = async (args: PlaylistItemsRequestDto) => {
  return (
    await gapi.client.youtube.playlistItems.list({
      part: ['snippet', 'contentDetails'],
      ...args,
    } as Parameters<typeof gapi.client.youtube.playlistItems.list>[0])
  ).result;
};
