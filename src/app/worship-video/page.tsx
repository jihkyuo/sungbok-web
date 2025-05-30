import { getYoutubePlaylists } from '@/domains/worship-video/api/repository';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

export default async function WorshipVideoPage() {
  const recentPlaylists = await getYoutubePlaylists({
    maxResults: 5,
  });
  console.log(recentPlaylists);
  return (
    <div>
      <Tabs>
        <TabsList>
          <TabsTrigger value="recent">최근 재생목록</TabsTrigger>
          <TabsTrigger value="all">전체 재생목록</TabsTrigger>
        </TabsList>
        <TabsContent value="recent">
          <div>
            <h1>최근 재생목록</h1>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
