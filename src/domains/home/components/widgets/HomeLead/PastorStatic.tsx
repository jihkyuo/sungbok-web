/**
 * PastorStatic — 담임목사 인사. 변형 무대의 핀이 풀린 뒤 이어지는 일반 스크롤 섹션(진입 페이드만).
 * 인사 좌 / 사진 우(7:8 원본 비율, 크롭 없음). 카피는 placeholder — 사무국 검수 필요.
 */
import Image from 'next/image';

import pastorSign from '@/assets/images/pastor-sign.png';
import pastorImg from '@/assets/images/main/pastor.jpg';
import { Reveal } from '@/shared/components/features/Reveal';

export const PastorStatic = () => (
  <section className="bg-b1-bg relative z-0 px-[6vw] pt-[18vh] pb-[12vh]">
    <div className="mx-auto flex w-full max-w-[1320px] items-center gap-[6%] max-[860px]:flex-col max-[860px]:gap-8">
      <Reveal className="min-w-0 flex-1">
        <p className="b1-brush text-b1-accent text-[clamp(24px,2.6vw,36px)] leading-[1.15]">
          할렐루야!
        </p>
        <h2 className="text-b1-text mt-3 text-[clamp(26px,3.2vw,46px)] leading-[1.22] font-extrabold tracking-[-0.025em] text-balance">
          예수님의 이름으로 환영합니다.
        </h2>
        <p className="text-b1-sub mt-6 max-w-[520px] text-[clamp(15px,1.3vw,17px)] leading-[1.9] text-pretty">
          언제나 하나님의 축복과 예수님의 은혜와 성령님의 평강이 여러분들의 인생 가운데 온전히
          임하시길 진심으로 기원합니다.
        </p>
        <div className="mt-8 flex items-center gap-3.5">
          <span className="text-b1-text text-[15px] font-semibold">성복교회 담임목사</span>
          <Image src={pastorSign} alt="이요셉" className="h-11 w-auto" />
        </div>
      </Reveal>
      <Reveal
        delay={120}
        className="w-full min-w-0 max-[860px]:max-w-[70%] min-[860px]:flex-[0.72]"
      >
        <div
          className={
            'relative aspect-[7/8] w-full overflow-hidden rounded-[28px] shadow-[0_48px_90px_-30px_rgba(30,40,70,0.4)]' /* design-lint-ignore: 인물 카드 낙하 그림자 1회성 */
          }
        >
          <Image
            src={pastorImg}
            alt="담임목사"
            fill
            sizes="(min-width:860px) 36vw, 70vw"
            className="object-cover object-center"
          />
        </div>
      </Reveal>
    </div>
  </section>
);
