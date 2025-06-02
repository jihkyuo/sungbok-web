import { getYoutubePlaylists } from '@/domains/worship-video/api/server.api';
import { PlaylistTabs } from '@/domains/worship-video/components/feature/PlaylistTabs';

export default async function PlaylistPagination() {
  const playlist = await getYoutubePlaylists({
    maxResults: 5,
  });

  return <PlaylistTabs playlist={playlist} />;
}
