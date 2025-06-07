import { getPlaylistApi, getPlaylistItemsApi } from '@/domains/worship-video/api/client.api';
import {
  PlaylistItemsRequestDto,
  type PlaylistRequestDto,
} from '@/domains/worship-video/api/dto/request.dto';

import { createQueryKeyStore } from '@lukemorales/query-key-factory';

export const worshipVideoQueryKeys = createQueryKeyStore({
  playlist: {
    all: (args: PlaylistRequestDto) => ({
      queryKey: [args.id?.[0]],
      queryFn: () => getPlaylistApi(args),
    }),
    byId: (args: PlaylistItemsRequestDto) => ({
      queryKey: [args.playlistId, args.maxResults, args.pageToken],
      queryFn: () => getPlaylistItemsApi(args),
    }),
  },
});
