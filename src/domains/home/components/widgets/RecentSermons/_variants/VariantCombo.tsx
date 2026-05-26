'use client';

import { ArrowRight, ArrowUpRight, Play, Youtube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Section } from '@/domains/home/components/features/Section';
import { SectionTitle } from '@/domains/home/components/features/SectionTitle';
import { Reveal } from '@/shared/components/features/Reveal';

import { AmbientVideo } from './AmbientVideo';
import {
  ARCHIVE_HREF,
  LATEST_SERMON,
  POSTER_ALT,
  SERMON_STILLS,
  YOUTH,
  YOUTH_CHANNEL_HREF,
} from './data';

/**
 * 조합 시안 — 위: 설교(C 벤토 구조) / 아래: 청년 영상(J 레이어드 구조).
 * 청년 영상 위 레이어드 버튼 = 청년부 유튜브 채널 링크 액션.
 */
export const VariantCombo = () => (
  <>
    {/* ───── 위: 설교 (벤토) ───── */}
    <Section>
      <Reveal>
        <SectionTitle
          title="최근 설교"
          eyebrow="● SERMON · 담임목사"
          action={
            <Link
              href={ARCHIVE_HREF}
              className="b1-mono b1-link text-b1-sub text-[12px] no-underline"
            >
              SERMON ARCHIVE
              <ArrowRight size={12} strokeWidth={2} />
            </Link>
          }
        />
      </Reveal>

      <div className="grid grid-cols-1 gap-4 md:auto-rows-[200px] md:grid-cols-12">
        {/* 설교 메인 무비 — 큰 타일 */}
        <Reveal delay={40} className="md:col-span-7 md:row-span-2">
          <Link
            href={ARCHIVE_HREF}
            className="b1-card-hover group relative block h-full overflow-hidden rounded-2xl no-underline"
          >
            <Image src={POSTER_ALT} alt="" fill sizes="60vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <span className="absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 transition-transform group-hover:scale-110">
              <Play size={24} fill="currentColor" />
            </span>
            <div className="absolute bottom-6 left-6 text-white">
              <div className="b1-mono text-[11px] tracking-[0.06em] opacity-85">
                최근 설교 · {LATEST_SERMON.date}
              </div>
              <div className="mt-1 text-[24px] font-bold tracking-[-0.01em]">
                {LATEST_SERMON.title}
              </div>
              <div className="text-[13px] opacity-85">
                {LATEST_SERMON.scripture} · {LATEST_SERMON.preacher}
              </div>
            </div>
          </Link>
        </Reveal>

        {/* 지난 설교 포스터 */}
        <Reveal delay={100} className="md:col-span-5">
          <Link
            href={ARCHIVE_HREF}
            className="b1-card-hover relative block h-full overflow-hidden rounded-2xl no-underline"
          >
            <Image src={SERMON_STILLS[1].img} alt="" fill sizes="40vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
            <div className="absolute inset-0 flex flex-col justify-between p-5 text-white">
              <span className="b1-mono text-[10px] tracking-[0.06em] opacity-80">
                지난 설교 · {SERMON_STILLS[1].date}
              </span>
              <div>
                <div className="text-[16px] font-bold">{SERMON_STILLS[1].title}</div>
                <div className="text-[12px] opacity-80">{SERMON_STILLS[1].scripture}</div>
              </div>
            </div>
          </Link>
        </Reveal>

        {/* 설교 유튜브 채널 */}
        <Reveal delay={150} className="md:col-span-2">
          <Link
            href={ARCHIVE_HREF}
            className="b1-card-hover bg-b1-text text-b1-bg flex h-full flex-col justify-between rounded-2xl p-5 no-underline"
          >
            <Youtube size={18} className="opacity-80" />
            <span className="text-[14px] leading-tight font-bold">
              설교
              <br />
              유튜브
            </span>
          </Link>
        </Reveal>

        {/* 최신 설교 메타 */}
        <Reveal delay={200} className="md:col-span-3">
          <div className="bg-b1-accent-soft flex h-full flex-col justify-between rounded-2xl p-5">
            <span className="b1-mono text-b1-accent text-[10px] tracking-[0.08em]">
              설교 · {SERMON_STILLS[2].date}
            </span>
            <div>
              <div className="text-b1-text text-[16px] font-bold tracking-[-0.01em]">
                {SERMON_STILLS[2].title}
              </div>
              <div className="text-b1-sub text-[12px]">{SERMON_STILLS[2].scripture}</div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>

    {/* ───── 아래: 청년 영상 (레이어드 + 유튜브 채널 링크) ───── */}
    <Section>
      <Reveal>
        <div className="relative">
          <AmbientVideo className="aspect-[21/9] w-full rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-black/55 via-transparent to-transparent" />
            <div className="absolute top-7 left-7">
              <span className="b1-mono rounded-full bg-white/15 px-3 py-1 text-[10px] tracking-[0.12em] text-white backdrop-blur">
                ● 청년 예배 · YOUTH WORSHIP
              </span>
            </div>
            <div className="absolute bottom-7 left-7 text-white">
              <div className="text-[26px] font-bold tracking-[-0.01em] md:text-[34px]">청년 예배</div>
              <div className="text-[13px] opacity-80">
                {YOUTH.schedule} · {YOUTH.place}
              </div>
            </div>
          </AmbientVideo>

          {/* 레이어드 버튼 — 청년부 유튜브 채널 링크 액션 */}
          <Link
            href={YOUTH_CHANNEL_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="b1-card-hover border-b1-border bg-b1-surface relative z-10 mx-auto -mt-10 flex max-w-[520px] items-center justify-between gap-4 rounded-2xl border p-5 no-underline shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)] md:mr-10 md:ml-auto"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF0000] text-white">
                <Youtube size={20} />
              </span>
              <div>
                <div className="b1-mono text-b1-muted text-[10px] tracking-[0.1em]">YOUTUBE</div>
                <div className="text-b1-text text-[16px] font-bold tracking-[-0.01em]">
                  청년부 유튜브 채널
                </div>
              </div>
            </div>
            <span className="bg-b1-text inline-flex shrink-0 items-center gap-1 rounded-full px-4 py-2 text-[13px] font-semibold text-white">
              채널 가기 <ArrowUpRight size={15} />
            </span>
          </Link>
        </div>
      </Reveal>
    </Section>
  </>
);
