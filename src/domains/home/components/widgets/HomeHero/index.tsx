import bgImgMain01 from '@/assets/images/main/main01.jpg';
import { Reveal } from '@/shared/components/features/Reveal';
import { ArrowDown, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const HomeHero = () => {
  return (
    <section className="px-5 pt-8 pb-6 md:px-10 md:pt-[72px] md:pb-12">
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-6">
        <div className="md:col-span-6">
          <Reveal>
            <div className="b1-mono text-b1-muted mb-6 text-[11px] tracking-[0.05em]">
              <span className="text-b1-accent">●</span>&nbsp;&nbsp;환영합니다 · 2026.05
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="text-b1-text m-0 text-[44px] leading-[1.08] font-bold tracking-[-0.03em] text-balance md:text-[76px]">
              처음 오셨나요?
              <br />
              <span className="text-b1-muted font-medium">편한 마음으로 오세요.</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="text-b1-sub mt-7 max-w-[480px] text-[16px] leading-[1.75]">
              성복교회는 한 사람 한 사람을 환대하는 공동체입니다. 어느 예배에든, 어느 자리에서든
              함께 시작할 수 있습니다.
            </p>
          </Reveal>

          <Reveal delay={220}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/about"
                className="bg-b1-accent text-b1-bg inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-[14px] font-semibold transition-all duration-300 ease-out hover:opacity-90 active:scale-[0.97]"
              >
                처음 오신 분 안내
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
              <a
                href="#location"
                className="bg-b1-surface text-b1-text border-b1-border hover:bg-b1-bg inline-flex items-center gap-2 rounded-full border px-6 py-3.5 text-[14px] font-semibold transition-all duration-300 ease-out active:scale-[0.97]"
              >
                오시는 길
                <ArrowDown size={14} strokeWidth={2} />
              </a>
            </div>
          </Reveal>
        </div>

        <div className="md:col-span-6">
          <Reveal delay={120}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl md:aspect-[5/6]">
              <Image
                src={bgImgMain01}
                alt="성복교회 본당"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="pointer-events-none absolute right-0 bottom-0 left-0 bg-gradient-to-b from-transparent to-black/45 px-[22px] py-5 text-white">
                <div className="b1-mono text-[10px] tracking-[0.16em] opacity-85">
                  SUNGBOK · 본당
                </div>
                <div className="mt-1 text-[17px] font-semibold tracking-[-0.01em]">
                  아침 햇빛이 든 예배당
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
