import { MINISTRIES } from '@/domains/home/data/ministries';
import { Section } from '@/domains/home/components/features/Section';
import { SectionTitle } from '@/domains/home/components/features/SectionTitle';
import { Reveal } from '@/shared/components/features/Reveal';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const CommunityGallery = () => {
  return (
    <Section className="bg-b1-surface border-t-b1-border border-t">
      <Reveal>
        <SectionTitle
          tier="editorial"
          eyebrow="● COMMUNITY"
          title={
            <>
              한 사람을
              <br />
              환대하는 공동체
            </>
          }
          action={
            <p className="text-b1-sub m-0 max-w-[360px] text-[15px] leading-[1.8]">
              세대와 자리를 가리지 않고 서로의 이야기를 듣는 작은 공동체들. 각 부서는 일년 내내
              열려 있습니다.
            </p>
          }
        />
      </Reveal>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
        {MINISTRIES.map((m, i) => (
          <Reveal key={m.name} delay={i * 70}>
            <Link
              href={m.href}
              className="b1-card-hover border-b1-border bg-b1-bg block overflow-hidden rounded-2xl border text-inherit no-underline"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={m.image}
                  alt={m.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="flex items-start justify-between gap-3 px-5 pt-[18px] pb-[22px]">
                <div>
                  <div className="b1-mono text-b1-muted mb-1.5 text-[10px] tracking-[0.08em]">
                    {String(i + 1).padStart(2, '0')} · {m.age}
                  </div>
                  <div className="text-[19px] font-bold tracking-[-0.01em]">{m.name}</div>
                  <div className="text-b1-sub mt-1 text-[13px]">{m.tone}</div>
                </div>
                <div className="bg-b1-text text-b1-bg flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                  <ArrowRight size={14} strokeWidth={2} />
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
};
