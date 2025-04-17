import { Card } from '@/components/features/Card';
import { EdgeHoleArea } from '@/components/features/EdgeHoleArea';

interface Props {
  videoUrl: string;
}

export const VideoBgCard = ({ videoUrl }: Props) => {
  return (
    <Card className={'relative'}>
      <EdgeHoleArea>유튭 아이콘</EdgeHoleArea>

      <div className="relative h-[calc(100vh-500px)] w-full">
        <iframe
          width="100%"
          height="100%"
          src={`${videoUrl}?autoplay=1&mute=1&controls=0&loop=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* 비디오 조작 방지 마스크 */}
      <div className="absolute inset-0" />
    </Card>
  );
};
