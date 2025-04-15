import bgImgMain01 from '@/assets/images/main/main01.jpg';
import { EdgeHoleArea } from '@/components/features/EdgeActionCard/EdgeHoleArea';
import { Button } from '@/components/ui/button';

interface Props {}

export const EdgeActionCard = ({}: Props) => {
  return (
    <div className={'relative w-full overflow-hidden rounded-[45px_0_45px_45px]'}>
      <EdgeHoleArea>
        <Button className={'absolute top-0 right-0 h-17 w-17 rounded-full bg-blue-500'}>ss</Button>
      </EdgeHoleArea>

      <div
        style={{ backgroundImage: `url(${bgImgMain01.src})` }}
        className={'bg-cover bg-center p-40 text-white'}
      >
        내용
      </div>
    </div>
  );
};
