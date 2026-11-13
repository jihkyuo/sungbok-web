// 다음세대 부서 페이지 본문. 독자: 자녀를 보낼 부모 → 누구 대상 · 언제·어디 · 누가 맡나 · 분위기 순.
// 대상 한 줄 + 담당자 → 시간·장소·대상 스트립 → 와이드 사진 → 소개 + 활동 사진.
// 현재는 영어예배부 1개(샘플). 다른 부서는 자료 수신 후 데이터만 추가.
// TODO(콘텐츠): 영어예배부 정보는 전부 스탠드인 — 부서 자료 수신 후 교체.
import dep03 from '@/assets/images/main/department/dep03.webp';
import dep06 from '@/assets/images/main/department/dep06.webp';
import dep08 from '@/assets/images/main/department/dep08.webp';
import depManager08 from '@/assets/images/main/department/dep_manager08.webp';
import { Reveal } from '@/shared/components/features/Reveal';
import { SampleNotice } from '@/shared/components/layout/SampleNotice';
import { Photo } from '@/shared/components/features/Photo';
import type { StaticImageData } from 'next/image';

export interface Department {
  target: string;
  time: string;
  place: string;
  ages: string;
  staff: { name: string; role: string; photo: StaticImageData };
  intro: string;
  photo: StaticImageData;
  gallery: StaticImageData[];
}

export const ENGLISH_MINISTRY: Department = {
  target: '영어가 편한 어린이와 청소년이 함께 예배하는 부서',
  time: '주일 오전 11:00',
  place: '교육관 3층',
  ages: '초등 1학년 ~ 고등 3학년',
  staff: { name: '최주진 전도사', role: '담당 교역자', photo: depManager08 },
  intro:
    '영어예배부는 영어로 예배하고 성경을 배우는 다음세대 부서입니다. 매 주일 찬양과 말씀, 소그룹 나눔으로 모이며, 한국어 예배가 낯선 가정의 자녀도 함께합니다.',
  photo: dep08,
  gallery: [dep03, dep06],
};

export const DepartmentDetail = ({ dept }: { dept: Department }) => (
  <>
    <SampleNotice what="시간·장소·대상·담당자" />
    <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12">
      <Reveal className="md:col-span-8">
        <p className="text-b1-text max-w-[560px] text-[18px] leading-[1.6] font-medium md:text-[20px]">
          {dept.target}
        </p>
      </Reveal>
      <Reveal delay={80} className="md:col-span-4 md:justify-self-end">
        <div className="border-b1-border flex items-center gap-4 rounded-2xl border bg-white px-5 py-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
            <Photo src={dept.staff.photo} alt="" fill className="object-cover" sizes="56px" />
          </div>
          <div>
            <div className="text-b1-sub text-body-sm">{dept.staff.role}</div>
            <div className="text-b1-text text-[18px] font-bold">{dept.staff.name}</div>
          </div>
        </div>
      </Reveal>
    </div>

    <Reveal delay={120}>
      <dl className="border-b1-border divide-b1-border mt-10 grid grid-cols-1 divide-y rounded-2xl border bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {[
          ['모이는 시간', dept.time],
          ['장소', dept.place],
          ['대상', dept.ages],
        ].map(([k, v]) => (
          <div key={k} className="px-6 py-5">
            <dt className="text-b1-sub text-body-sm">{k}</dt>
            <dd className="text-b1-text mt-1.5 text-[20px] font-bold tracking-[-0.01em]">{v}</dd>
          </div>
        ))}
      </dl>
    </Reveal>

    <Reveal delay={160}>
      <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-3xl md:aspect-[21/9]">
        <Photo src={dept.photo} alt="" fill className="object-cover" sizes="100vw" />
      </div>
    </Reveal>

    <div className="mt-14 grid grid-cols-1 gap-10 md:mt-20 md:grid-cols-12 md:gap-12">
      <Reveal className="md:col-span-7">
        <h2 className="text-b1-text text-[24px] font-bold tracking-[-0.02em]">소개</h2>
        <p className="text-b1-sub mt-4 text-body leading-[1.85] md:text-title font-normal">{dept.intro}</p>
      </Reveal>
      <Reveal delay={80} className="md:col-span-5">
        <div className="grid grid-cols-2 gap-3">
          {dept.gallery.map((img, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-2xl">
              <Photo
                src={img}
                alt=""
                fill
                className="object-cover"
                sizes="(min-width: 768px) 20vw, 45vw"
              />
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  </>
);
