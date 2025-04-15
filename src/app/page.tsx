import bgImgMain01 from '@/assets/images/main/main01.jpg';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <Image
        src={bgImgMain01}
        alt="main01"
        className="h-[calc(100vh-400px)] w-full bg-cover object-cover object-center"
      />
      <Button>Click me</Button>
    </>
  );
}
