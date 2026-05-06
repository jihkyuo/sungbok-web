import { Reveal } from '@/shared/components/features/Reveal';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const SERMON_FEATURED = {
  date: '2026.05.04',
  preacher: '이요셉 담임목사',
  title: '두려워하지 말라',
  scripture: '이사야 41:10',
  series: '말씀과 함께',
  videoUrl: 'https://www.youtube.com/embed/HYruCseVKZo',
};

const SERMON_YOUTH = {
  date: '2026.05.03',
  team: '청년부 예배팀',
  title: '함께 부르는 새 노래',
};

export const RecentSermons = () => {
  return (
    <section className="px-5 pb-14 md:px-10 md:pb-24">
      <Reveal>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-b1-text m-0 text-[24px] font-bold tracking-[-0.02em] md:text-[30px]">
            최근 설교
          </h2>
          <Link
            href="/worship-video"
            className="b1-mono b1-link text-b1-sub text-[12px] no-underline"
          >
            SERMON ARCHIVE
            <ArrowRight size={12} strokeWidth={2} />
          </Link>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
        <Reveal as="article" delay={60} className="md:col-span-8">
          <div className="bg-b1-surface border-b1-border b1-card-hover overflow-hidden rounded-2xl border">
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              <iframe
                src={`${SERMON_FEATURED.videoUrl}?autoplay=1&mute=1&controls=0&loop=1&playlist=HYruCseVKZo&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1`}
                title="최근 설교"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="absolute inset-0 h-full w-full"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="pointer-events-none absolute right-6 bottom-6 left-6 text-white">
                <div className="b1-mono mb-1.5 text-[11px] tracking-[0.05em] opacity-85">
                  {SERMON_FEATURED.date} · {SERMON_FEATURED.preacher}
                </div>
                <div className="text-[22px] font-bold tracking-[-0.01em]">
                  {SERMON_FEATURED.title}
                </div>
                <div className="mt-1 text-[13px] opacity-85">{SERMON_FEATURED.scripture}</div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-5 md:px-[22px]">
              <div>
                <div className="b1-mono text-b1-muted text-[11px] tracking-[0.05em]">
                  {SERMON_FEATURED.series} · {SERMON_FEATURED.scripture}
                </div>
                <div className="mt-1 text-[17px] font-bold tracking-[-0.01em]">
                  {SERMON_FEATURED.title}
                </div>
              </div>
              <Link
                href="/worship-video"
                className="text-b1-text inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold no-underline"
              >
                전체 보기
                <ArrowRight size={12} strokeWidth={2} />
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal as="article" delay={140} className="md:col-span-4">
          <div className="bg-b1-text text-b1-bg b1-card-hover h-full overflow-hidden rounded-2xl">
            <div className="bg-b1-text/40 relative aspect-[4/5] w-full overflow-hidden">
              {/* placeholder: 청년부 영상 자산 추가 시 교체 */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at 30% 30%, rgba(255,180,120,0.35), transparent 60%), radial-gradient(circle at 70% 70%, rgba(120,80,40,0.45), transparent 55%), #2a1a10',
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="pointer-events-none absolute right-5 bottom-5 left-5 text-white">
                <div className="b1-mono text-[10px] tracking-[0.05em] opacity-75">
                  YOUTH · {SERMON_YOUTH.date}
                </div>
                <div className="mt-1 text-[17px] font-bold tracking-[-0.01em]">
                  {SERMON_YOUTH.title}
                </div>
              </div>
            </div>
            <div className="px-[18px] py-[18px]">
              <div className="b1-mono text-[10px] tracking-[0.05em] text-white/60">
                {SERMON_YOUTH.team}
              </div>
              <div className="mt-1 text-[15px] font-bold">{SERMON_YOUTH.title}</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
