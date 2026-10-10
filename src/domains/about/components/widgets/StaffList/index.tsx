// 교회소개 › 섬기는 이들 본문. 교역자 수 한 줄 → 담임목사(크게) → 교역자 3:4 그리드.
// 장로·권사 명단은 실명 자료 수신 후 추가(추측 금지).
// TODO(콘텐츠): 교역자 실사진 수신 후 photo 필드 추가. 담당 부서는 자료 없어 표기하지 않음.
import pastor from '@/assets/images/main/pastor.jpg';
import { Reveal } from '@/shared/components/features/Reveal';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const SENIOR = { name: '이요셉', role: '담임목사', photo: pastor };
// 기존 사이트 설교 캡처(2026-09/10)에 등장한 교역자 실명.
const STAFF = [
  { name: '조정환', role: '목사' },
  { name: '김정현', role: '목사' },
  { name: '임경일', role: '목사' },
  { name: '이원효', role: '목사' },
  { name: '박병욱', role: '목사' },
  { name: '김민기', role: '목사' },
  { name: '최원재', role: '목사' },
  { name: '최주진', role: '전도사' },
];

export const StaffList = () => (
  <>
    <Reveal>
      <p className="text-b1-sub text-[16px] md:text-[17px]">
        담임목사와 교역자 {STAFF.length}명이 섬기고 있습니다.
      </p>
    </Reveal>

    <Reveal delay={60}>
      <section
        aria-labelledby="senior"
        className="mt-10 grid grid-cols-1 gap-8 md:mt-14 md:grid-cols-12 md:items-center"
      >
        <div className="relative aspect-[3/4] w-full max-w-[280px] overflow-hidden rounded-2xl md:col-span-3">
          <Image
            src={SENIOR.photo}
            alt={`${SENIOR.role} ${SENIOR.name}`}
            fill
            priority
            className="object-cover"
            sizes="280px"
          />
        </div>
        <div className="md:col-span-9">
          <div className="text-b1-accent text-[15px] font-semibold">{SENIOR.role}</div>
          <h2
            id="senior"
            className="text-b1-text mt-2 text-[32px] font-bold tracking-[-0.02em] md:text-[36px]"
          >
            {SENIOR.name} 목사
          </h2>
          <Link
            href="/about/pastor"
            className="text-b1-text hover:text-b1-accent mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold transition-colors"
          >
            담임목사 인사말 보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </Reveal>

    <section aria-labelledby="staff" className="mt-16 md:mt-24">
      <Reveal>
        <h2 id="staff" className="text-b1-text text-[22px] font-bold tracking-[-0.02em]">
          교역자
        </h2>
      </Reveal>
      <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4 md:gap-x-6">
        {STAFF.map((p, i) => (
          <li key={p.name}>
            <Reveal delay={(i % 4) * 60}>
              {/* 실사진 수신 전 — 사람 사진을 이름에 붙이지 않는다(활동컷을 인물로 오인). 자리만 비워 둔다. */}
              <div aria-hidden className="bg-b1-placeholder aspect-[3/4] rounded-2xl" />
              <div className="text-b1-text mt-3 text-[17px] font-bold">{p.name}</div>
              <div className="text-b1-sub text-[14px]">{p.role}</div>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  </>
);
