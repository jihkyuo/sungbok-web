/**
 * HomeLead — 전경 히어로 다음, 위로 차오르는 두 섹션.
 *
 * 예배(표어)·담임목사를 좌우 엇갈림으로 배치하고, 따뜻함→차가움 세로 그라데이션
 * (.b1-lead-gradient) 위를 일반 스크롤로 통과한다. 고정된 HomeHero 위로 차고 올라와
 * 덮는다(page.tsx 의 불투명 래퍼가 스택 보장).
 *
 * 카피(표어·담임목사 멘트)는 placeholder — 사무국 검수 필요.
 */
import Image from 'next/image';

import pastorImg from '@/assets/images/main/pastor.jpg';
import worshipImg from '@/assets/images/main/worship.jpg';

export const HomeLead = () => {
  return (
    <div className="b1-lead-gradient">
      {/* 예배 · 표어 — 사진 좌 / 문구 우 */}
      <section className="flex min-h-screen items-center px-[6vw] py-[9vh]">
        <div className="mx-auto flex w-full max-w-[1320px] flex-row-reverse items-center gap-[6%] max-[860px]:flex-col max-[860px]:gap-7">
          <div className="min-w-0 flex-1">
            <span className="text-b1-accent b1-mono mb-5 inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.16em] uppercase">
              <span className="bg-b1-accent block h-1.5 w-1.5 rounded-full" />
              예배 · 2026 표어
            </span>
            <h2 className="text-b1-text text-[clamp(28px,3.4vw,48px)] leading-[1.2] font-extrabold tracking-[-0.025em] text-balance">
              새 사람을 입고
              <br />
              <span className="text-b1-accent">묵은 땅</span>을 기경하라
            </h2>
            <div className="text-b1-muted b1-mono mt-[18px] text-[13px] tracking-[0.04em]">
              엡 4:22–24 · 호 10:12
            </div>
          </div>
          <div className="min-w-0 flex-[1.35]">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[18px] shadow-[0_36px_70px_-28px_rgba(20,24,40,0.45)]">
              <Image
                src={worshipImg}
                alt="성복교회 예배"
                fill
                sizes="(min-width:860px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 담임목사 — 문구 좌 / 사진 우 */}
      <section className="flex min-h-screen items-center px-[6vw] py-[9vh]">
        <div className="mx-auto flex w-full max-w-[1320px] items-center gap-[6%] max-[860px]:flex-col max-[860px]:gap-7">
          <div className="min-w-0 flex-1">
            <span className="text-b1-accent b1-mono mb-5 inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.16em] uppercase">
              <span className="bg-b1-accent block h-1.5 w-1.5 rounded-full" />
              담임목사
            </span>
            <h2 className="text-b1-text text-[clamp(28px,3.4vw,48px)] leading-[1.2] font-extrabold tracking-[-0.025em] text-balance">
              <span className="text-b1-accent">기다리는</span> 자리
            </h2>
            <p className="text-b1-sub mt-[18px] max-w-[420px] text-[16px] leading-[1.7]">
              ○○○ 담임목사 · 1985년부터 함께.
            </p>
          </div>
          <div className="min-w-0 flex-[0.9]">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[18px] shadow-[0_36px_70px_-28px_rgba(20,24,40,0.45)]">
              <Image
                src={pastorImg}
                alt="담임목사"
                fill
                sizes="(min-width:860px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
