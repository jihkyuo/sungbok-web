import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Section } from '@/domains/home/components/features/Section';
import { SectionTitle } from '@/domains/home/components/features/SectionTitle';
import { CHURCH_NEWS_POSTS, NEWS_TOTAL, tagColor } from '@/domains/home/data/churchNews';
import { Reveal } from '@/shared/components/features/Reveal';

/**
 * 홈 '교회 소식' 섹션.
 * 좌측 헤드라인(정지 이미지, 영상 재생 없음) + 우측 카드 뉴스(최대 4) + 우측 정렬 더보기 링크.
 * 헤드라인은 우측 카드 컬럼 높이에 맞춰 채운다(md:items-stretch + h-full).
 */
export const ChurchNews = () => {
  const headline = CHURCH_NEWS_POSTS[0];
  const cards = CHURCH_NEWS_POSTS.slice(1, 5);

  return (
    <Section>
      <Reveal>
        <SectionTitle tier="editorial" eyebrow="● CHURCH NEWS" title="교회 소식" />
      </Reveal>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-stretch md:gap-8">
        {/* 좌측 헤드라인 */}
        <Reveal className="md:col-span-5">
          <Link href={headline.href} className="group block h-full no-underline">
            <div className="relative h-full min-h-[320px] overflow-hidden rounded-2xl">
              {headline.image && (
                <Image
                  src={headline.image}
                  alt={headline.title}
                  fill
                  sizes="(max-width:768px) 100vw, 42vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute top-5 left-5 flex items-center gap-2">
                <span className="b1-mono rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] text-white backdrop-blur-sm">
                  헤드라인
                </span>
                <span className={`rounded-full px-2 py-[3px] text-[10px] font-bold ${tagColor[headline.tag]}`}>
                  {headline.tag}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="b1-mono mb-2 text-[12px] text-white/75">{headline.date}</div>
                <h3 className="m-0 text-[22px] leading-[1.28] font-bold tracking-[-0.02em] text-white md:text-[27px]">
                  {headline.title}
                </h3>
                {headline.excerpt && (
                  <p className="mt-2.5 line-clamp-2 max-w-[420px] text-[13.5px] leading-[1.6] text-white/85">
                    {headline.excerpt}
                  </p>
                )}
              </div>
            </div>
          </Link>
        </Reveal>

        {/* 우측 카드 뉴스 */}
        <div className="flex flex-col md:col-span-7">
          <div className="flex flex-col gap-3">
            {cards.map((p, i) => (
              <Reveal key={p.title} delay={i * 60}>
                <Link
                  href={p.href}
                  className="b1-card-hover border-b1-border bg-b1-surface group flex items-stretch gap-4 overflow-hidden rounded-2xl border no-underline"
                >
                  {p.image ? (
                    <div className="relative w-[100px] shrink-0 self-stretch overflow-hidden sm:w-[120px]">
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        sizes="120px"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="bg-b1-accent w-1.5 shrink-0 self-stretch" aria-hidden />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col justify-center py-3.5 pr-1 pl-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-[2px] text-[10px] font-bold ${tagColor[p.tag]}`}>
                        {p.tag}
                      </span>
                      <span className="b1-mono text-b1-muted text-[11px]">{p.date}</span>
                    </div>
                    <div className="text-b1-text group-hover:text-b1-accent text-[15.5px] font-bold tracking-[-0.01em] transition-colors">
                      {p.title}
                    </div>
                    {p.excerpt && (
                      <p className="text-b1-sub mt-1 line-clamp-1 text-[13px] leading-[1.5]">{p.excerpt}</p>
                    )}
                  </div>
                  <ArrowRight
                    size={15}
                    strokeWidth={2}
                    className="text-b1-muted mr-4 shrink-0 self-center transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </Link>
              </Reveal>
            ))}
          </div>

          {/* 더 보기 — 우측 정렬 텍스트 링크 */}
          <Reveal delay={260}>
            <div className="mt-3 flex justify-end">
              <Link
                href="/news"
                className="b1-link text-b1-sub hover:text-b1-accent flex items-center gap-1.5 text-[13px] font-semibold no-underline"
              >
                교회 소식 더 보기
                <span className="b1-mono text-b1-muted text-[11px]">+{NEWS_TOTAL - 4}</span>
                <ArrowRight size={14} strokeWidth={2.2} />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
};
