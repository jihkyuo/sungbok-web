// 교회소개 › 담임목사·원로목사 본문. 흰 편지지 한 장 — 왼쪽에 사진, 오른쪽에 붓글씨 인사로 여는 인사말, 아래 괘선 밑에 친필 서명.
// 인물 데이터는 pastors.ts.
import { Reveal } from '@/shared/components/features/Reveal';
import Image from 'next/image';
import { PastorSignature } from './PastorSignature';
import type { PastorProfile } from './pastors';

export const PastorIntro = ({ pastor }: { pastor: PastorProfile }) => (
  <Reveal
    as="article"
    className="bg-b1-surface border-b1-border rounded-[28px] border p-6 shadow-[0_40px_70px_-50px_rgba(15,23,42,0.28)] md:p-9 lg:px-12 lg:py-10" /* design-lint-ignore: 편지지 낙하 그림자 1회성 */
  >
    <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-x-10 lg:gap-x-16">
      <div className="relative aspect-[4/5] w-[62%] overflow-hidden rounded-[16px] md:w-full">
        <Image
          src={pastor.photo}
          alt={`${pastor.role} ${pastor.name}`}
          fill
          preload
          className="object-cover object-top"
          sizes="(min-width: 1320px) 480px, (min-width: 768px) 36vw, 55vw"
        />
      </div>
      <div className="lg:py-4 lg:pr-6">
        <p className="b1-brush text-b1-text text-[46px] leading-none md:text-[60px]">
          {pastor.greeting.salutation}
        </p>
        <h2 className="text-b1-text mt-5 text-[clamp(25px,2.4vw,34px)] leading-[1.3] font-bold tracking-[-0.025em]">
          {pastor.greeting.headline}
        </h2>
        <div className="text-b1-text mt-9 space-y-7 text-title font-normal leading-[2] md:mt-12 md:text-[19px]">
          {pastor.greeting.paragraphs.map(lines => (
            <p key={lines[0]}>
              {lines.map(line => (
                <span key={line} className="xl:block xl:[text-wrap:balance]">
                  {line}{' '}
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>
    </div>

    <footer className="border-b1-border mt-10 flex justify-end border-t pt-6 lg:mt-12">
      <PastorSignature
        label={`${pastor.church} ${pastor.role}`}
        name={pastor.name}
        sign={pastor.sign}
      />
    </footer>
  </Reveal>
);
