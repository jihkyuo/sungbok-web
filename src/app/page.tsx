import bgImgMain01 from '@/assets/images/main/main01.jpg';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <Button>Click me</Button>
      <Image src={bgImgMain01} alt="main01" fill />
    </>
  );
}
