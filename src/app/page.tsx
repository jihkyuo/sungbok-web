import bgImgMain01 from '@/assets/images/main/main01.jpg';
import { EdgeActionCard } from '@/components/features/EdgeActionCard';

export default function Home() {
  return (
    <>
      <div
        style={{ backgroundImage: `url(${bgImgMain01.src})` }}
        className={'relative h-[calc(100vh-400px)] w-full bg-black bg-cover bg-center'}
      >
        <div className="absolute inset-0 bg-black opacity-40" />

        <div className="flex h-full flex-col justify-center px-40 text-white">
          <h1 className="text-5xl leading-tight font-bold tracking-tight drop-shadow-[1px_1px_2px_rgba(0,0,0,0.9)]">
            삶에 기쁨과 <br />
            소망을 주는 교회
          </h1>
          <p className="mt-4 text-2xl font-semibold drop-shadow-[1px_1px_2px_rgba(0,0,0,0.9)]">
            성복교회는 대한예수교장로회 합동교단(총신대학교)에 소속되어 있습니다.
          </p>
        </div>
      </div>

      <div className={'p-10'}>
        <EdgeActionCard />
      </div>
      <p className="h-[10000px]">long scroll</p>
    </>
  );
}
