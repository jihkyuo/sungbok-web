/**
 * PastorStatic — 담임목사 인사. 변형 무대의 핀이 풀린 뒤 이어지는 일반 스크롤 섹션(진입 페이드만).
 * 인사 좌 / 사진 우(7:8 원본 비율, 크롭 없음). 카피는 placeholder — 사무국 검수 필요.
 *
 * 문구 뒤 글로우(시안 A 승격, 2026-10-25): 섹션 왼쪽 바깥(-240px)에 중심을 둔 글로우 고리 + 속 빛이 문구 뒤를 지나간다.
 * 서브페이지 머리 HeaderGlow 와 같은 모티프(--color-b1-glow)로 홈과 서브를 묶고, 상자가 없어 위 변형 무대의 카드와 겹치지 않는다.
 * 글로우 상자(1600×1000)가 섹션 안에 통째로 들어와야 overflow 에 잘린 직선이 안 생긴다 — 위아래 여백 22vh + 데스크톱 min-h 1000px 이 그 조건.
 * 섹션 진입 시 1회 안착(scale·opacity 1.8초), 이후 정적. reduced-motion 은 최종 상태 정적.
 * 서명 PNG 는 흰 바탕을 뺀 투명판(먹색 고정·알파 = 어두운 정도) — Reveal 의 transform 스태킹 컨텍스트 안에서는 multiply 가 배경에 닿지 않아 자산에서 해결.
 * 서명은 화면에 들어오면 왼→오로 써진다(바깥 창·안쪽 역이동, transform 만).
 */
'use client';

import Image from 'next/image';

import pastorSign from '@/assets/images/pastor-sign.png';
import pastorImg from '@/assets/images/main/pastor.jpg';
import { Reveal } from '@/shared/components/features/Reveal';
import { useScrollFadeIn } from '@/shared/lib/hooks/useScrollFadeIn';

const PEAK = 'var(--color-b1-glow)';
const T = (a: number) => `color-mix(in srgb, ${PEAK} ${a}%, transparent)`;
const RING = `radial-gradient(760px 460px at 50% 50%,
  transparent 46%, ${T(10)} 52%, ${T(30)} 60%, ${T(60)} 68%, ${T(100)} 76%, ${T(100)} 84%, ${T(55)} 90%, ${T(20)} 96%, transparent 100%)`;
const CORE = `radial-gradient(560px 380px at 50% 50%, ${T(75)} 0%, ${T(35)} 45%, transparent 72%)`;
const GLOW_BOX = { left: 'calc(-240px - 800px)', top: 'calc(50% - 500px)' };

const CSS = `
  @keyframes ps-glow-settle{from{opacity:0;transform:scale(.72)}to{opacity:1;transform:scale(1)}}
  .ps-ring,.ps-core{opacity:0}
  .ps-glow-on .ps-ring{animation:ps-glow-settle 1800ms cubic-bezier(.16,1,.3,1) both}
  .ps-glow-on .ps-core{animation:ps-glow-settle 1800ms cubic-bezier(.16,1,.3,1) 150ms both}
  @media (prefers-reduced-motion:reduce){.ps-ring,.ps-core{animation:none!important;opacity:1!important;transform:none!important}}
`;

const WIPE =
  'transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none';

const Signature = () => {
  const { ref, isVisible: on } = useScrollFadeIn({ threshold: 0 });
  return (
    <div ref={ref} className="mt-10 flex items-center gap-4">
      <span className="text-b1-text text-[15px] font-semibold">성복교회 담임목사</span>
      <span className="block overflow-hidden">
        <span className={`block overflow-hidden ${WIPE} ${on ? 'translate-x-0' : '-translate-x-full'}`}>
          <Image
            src={pastorSign}
            alt="이요셉"
            className={`h-14 w-auto ${WIPE} ${on ? 'translate-x-0' : 'translate-x-full'}`}
          />
        </span>
      </span>
    </div>
  );
};

export const PastorStatic = () => {
  const { ref, isVisible: on } = useScrollFadeIn({ threshold: 0.25 });
  return (
    <section className="bg-b1-bg relative z-0 overflow-hidden px-[6vw] py-[22vh] min-[860px]:min-h-[1000px]">
      <style>{CSS}</style>
      <div
        ref={ref}
        aria-hidden
        className={`pointer-events-none absolute inset-0 ${on ? 'ps-glow-on' : ''}`}
      >
        <div
          className="ps-ring absolute h-[1000px] w-[1600px] will-change-[transform,opacity]"
          style={{ ...GLOW_BOX, background: RING }}
        />
        <div
          className="ps-core absolute h-[1000px] w-[1600px] will-change-[transform,opacity]"
          style={{ ...GLOW_BOX, background: CORE }}
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1320px] items-center gap-[6%] max-[860px]:flex-col max-[860px]:gap-8">
        <Reveal className="min-w-0 flex-1">
          <p className="b1-brush text-b1-accent text-[clamp(40px,4.2vw,60px)] leading-none">할렐루야!</p>
          <h2 className="text-b1-text mt-4 text-[clamp(26px,3.2vw,46px)] leading-[1.22] font-extrabold tracking-[-0.025em] text-balance">
            예수님의 이름으로 환영합니다.
          </h2>
          <p className="text-b1-sub mt-6 max-w-[520px] text-[clamp(15px,1.3vw,17px)] leading-[1.9] text-pretty">
            언제나 하나님의 축복과 예수님의 은혜와 성령님의 평강이 여러분들의 인생 가운데 온전히
            임하시길 진심으로 기원합니다.
          </p>
          <Signature />
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
              alt="이요셉 담임목사"
              fill
              sizes="(min-width:860px) 36vw, 70vw"
              className="object-cover object-center"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
};
