import AllLiveLogo from '@/assets/icons/allLive-team-logo.png';
import { Card } from '@/components/features/Card';
import { EdgeHoleArea } from '@/components/features/EdgeHoleArea';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Props {
  videoUrl: string;
  onClick?: () => void;
  className?: string;
}

export const VideoBgCard = ({ videoUrl, onClick, className }: Props) => {
  // YouTube URL에서 비디오 ID 추출
  const getVideoId = (url: string) => {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  };

  const videoId = getVideoId(videoUrl);

  return (
    <Card className={cn('relative cursor-pointer', className)} onClick={onClick}>
      <EdgeHoleArea>
        <Image src={AllLiveLogo} alt="AllLiveLogo" width={70} height={70} />
      </EdgeHoleArea>

      <div className="relative h-[200px] w-full sm:h-[300px] md:h-[400px] lg:h-[550px]">
        <iframe
          width="100%"
          height="100%"
          src={`${videoUrl}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* 비디오 조작 방지 마스크 */}
      <div className="absolute inset-0" />
    </Card>
  );
};
