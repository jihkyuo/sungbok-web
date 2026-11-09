// 교회소개 › 섬기는 이들 본문. 담임목사(가로 7/12 크게) → 17명 3열. 시안 라운드 B «그림자 판» 승격(2026-10-31).
// 박스: 세로 4:5 · r28 · 아래로 길게 떨어지는 그림자 + 1px 하이라이트 링. hover 없음. quality 90(레거시 JPEG 재압축 자글거림 완화).
// 이름 블록: 이름 + 직함(accent, 한 줄) → hairline → accent 5px 점 목록(담당 한 줄씩). 직함은 그룹 title 을 카드마다 단다.
// 명단·담당·사진은 staff.ts(기존 사이트 게시판 원문). 담임 경력·학력은 자료 없음 — 추측으로 채우지 말 것.
import { LEAD_PASTOR } from '@/domains/about/components/widgets/PastorIntro/pastors';
import { Reveal } from '@/shared/components/features/Reveal';
import { cn } from '@/shared/lib/utils';
import Image, { type StaticImageData } from 'next/image';
import { STAFF_GROUPS } from './staff';

const PEOPLE = STAFF_GROUPS.flatMap(g => g.members.map(m => ({ ...m, role: g.title })));

const Box = ({
  photo,
  alt,
  sizes,
  priority,
  className,
}: {
  photo: StaticImageData;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) => (
  <div
    className={cn(
      'bg-b1-placeholder relative overflow-hidden rounded-[28px] shadow-[0_36px_60px_-32px_rgba(15,23,42,0.5)] ring-1 ring-white/70' /* design-lint-ignore: 인물 박스 낙하 그림자 1회성 */,
      className
    )}
  >
    <Image
      src={photo}
      alt={alt}
      fill
      preload={priority}
      sizes={sizes}
      quality={90}
      className="object-cover object-top"
    />
  </div>
);

const Dot = () => (
  <span aria-hidden className="bg-b1-accent mt-[10px] mr-3 h-[5px] w-[5px] shrink-0 rounded-full" />
);

export const StaffList = () => (
  <>
    <Reveal>
      <section
        aria-labelledby="senior"
        className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-center md:gap-x-[7.5%]"
      >
        <Box
          photo={LEAD_PASTOR.photo}
          alt={`${LEAD_PASTOR.role} ${LEAD_PASTOR.name}`}
          priority
          sizes="(min-width: 1320px) 700px, (min-width: 768px) 52vw, 88vw"
          className="aspect-[675/520] w-full md:col-span-7"
        />
        <div className="md:col-span-5">
          <h2
            id="senior"
            className="text-b1-text border-b1-border border-b pb-5 text-[32px] font-semibold tracking-[-0.02em] md:text-[40px]"
          >
            {LEAD_PASTOR.name}
            <span className="text-b1-accent ml-2.5 text-[20px] font-bold md:text-[26px]">
              {LEAD_PASTOR.role}
            </span>
          </h2>
          <ul className="text-b1-text mt-5 space-y-2.5 text-title font-normal md:text-[20px]">
            <li className="flex">
              <Dot />
              {LEAD_PASTOR.church} 담임목사
            </li>
          </ul>
        </div>
      </section>
    </Reveal>

    <ul className="mt-24 grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 md:mt-32 md:grid-cols-3 md:gap-y-20">
      {PEOPLE.map((p, i) => (
        <li key={p.name}>
          <Reveal delay={(i % 3) * 70}>
            <Box
              photo={p.photo}
              alt={`${p.role} ${p.name}`}
              sizes="(min-width: 1320px) 413px, (min-width: 768px) 31vw, 88vw"
              className="aspect-[4/5]"
            />
            <h3 className="text-b1-text border-b1-border mt-8 border-b pb-4 text-[26px] font-semibold tracking-[-0.02em] md:text-[30px]">
              {p.name}
              <span className="text-b1-accent ml-2.5 text-title font-bold md:text-[20px]">
                {p.role}
              </span>
            </h3>
            <ul className="text-b1-text mt-4 space-y-2 text-body font-medium md:text-title">
              {p.duties.map(d => (
                <li key={d} className="flex">
                  <Dot />
                  {d}
                </li>
              ))}
            </ul>
          </Reveal>
        </li>
      ))}
    </ul>
  </>
);
