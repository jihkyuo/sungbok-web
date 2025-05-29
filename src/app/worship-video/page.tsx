import { getYoutubePlaylists } from '@/domains/worship-video/api/repository';

export default async function WorshipVideoPage() {
  const playlists = await getYoutubePlaylists();
  console.log(playlists);
  return <div>WorshipVideoPage</div>;
}