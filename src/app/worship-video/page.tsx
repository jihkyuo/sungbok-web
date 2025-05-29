import { getYoutubePlaylists } from '@/domains/worship-video/api/repository';

export default async function WorshipVideoPage() {
  const recentPlaylists = await getYoutubePlaylists({
    maxResults: 5,
  });
  console.log(recentPlaylists);
  return <div>WorshipVideoPage</div>;
}
