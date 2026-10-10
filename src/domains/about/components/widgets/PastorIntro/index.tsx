// 교회소개 › 담임목사 본문. 사진 + 이름·직분·사실 라벨. 인사말 원고는 담임목사 검수 후 반영(그 전까지 준비 중 한 줄).
import pastor from '@/assets/images/main/pastor.jpg';
import { Reveal } from '@/shared/components/features/Reveal';
import { PagePlaceholder } from '@/shared/components/layout/PagePlaceholder';
import Image from 'next/image';

const PASTOR = {
  name: '이요셉 목사',
  role: '담임목사',
};

export const PastorIntro = () => (
  <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
    <Reveal className="md:col-span-5">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
        <Image
          src={pastor}
          alt={`${PASTOR.role} ${PASTOR.name}`}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 768px) 40vw, 100vw"
        />
      </div>
    </Reveal>
    <Reveal delay={80} className="md:col-span-7">
      <div className="text-b1-accent text-[15px] font-semibold">{PASTOR.role}</div>
      <h2 className="text-b1-text mt-2 text-[26px] font-bold tracking-[-0.02em] md:text-[32px]">
        {PASTOR.name}
      </h2>
      <div className="mt-10">
        <PagePlaceholder />
      </div>
    </Reveal>
  </div>
);
