'use client';
// 라이브 스테이지 — 21:9 띠 + 레이어드 카드. 유튜브 채널 실데이터(/api/home-video)로 채운다.
// 라이브: 무음 자동재생 + 소리 켜기(홈 단일 소리 규칙). 라이브 없음: 담임목사 최신 설교 썸네일 정지 + 카드 버튼 → 유튜브 새 탭 재생.
import { ArrowUpRight, Volume2, VolumeX, Youtube } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import channelLogo from '@/assets/icons/sungbok-channel-logo.jpg';
import { formatKoDate, liveServiceName, parseSermonTitle, watchHref } from '@/domains/home/api/homeVideoFeed';
import { useHomeVideoFeed } from '@/domains/home/api/useHomeVideoFeed';
import { Section } from '@/domains/home/components/features/Section';
import { LABELS } from '@/domains/home/data/homeVideo';
import { Reveal } from '@/shared/components/features/Reveal';
import { useAudioFocus } from '@/shared/lib/audioFocus';
import { createPlayer, type YTPlayer } from '@/shared/lib/youtubePlayer';

export const LiveStage = () => {
  const feed = useHomeVideoFeed();
  const video = feed.live ?? feed.sermon;
  const isLive = !!feed.live;
  const parsed = video && !isLive ? parseSermonTitle(video.title) : null;

  // 라이브 플레이어 — 띠(21:9)를 16:9 iframe 이 덮도록 폭 100% 로 두고 세로를 잘라낸다.
  const playerRef = useRef<HTMLDivElement>(null);
  const ytRef = useRef<YTPlayer | null>(null);
  const [muted, setMuted] = useState(true);
  const audio = useAudioFocus('live');
  useEffect(() => {
    if (!isLive || !video || !playerRef.current) return;
    // 모션 줄이기 — 자동재생을 끄고 플레이어의 네이티브 컨트롤로 사용자가 직접 재생한다
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const destroy = createPlayer(playerRef.current, video.id, {
      autoplay: !reduced,
      controls: reduced,
      onReady: (p) => {
        ytRef.current = p;
        p.getIframe().title = video.title;
      },
    });
    return () => {
      ytRef.current = null;
      destroy();
    };
  }, [isLive, video?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!audio.active && !muted) {
      ytRef.current?.mute();
      setMuted(true);
    }
  }, [audio.active, muted]);
  const toggleMute = () => {
    if (muted) {
      audio.claim();
      ytRef.current?.unMute();
    } else {
      audio.release();
      ytRef.current?.mute();
    }
    setMuted((m) => !m);
  };

  if (feed.status !== 'loading' && !video) return null;

  const meta = !video
    ? ''
    : isLive
      ? `${LABELS.onAir} · ${liveServiceName(video.title)}`
      : `${formatKoDate(video.liveStart ?? video.publishedAt)} · ${LABELS.preacher}`;
  const title = parsed?.title ?? video?.title ?? '';
  const sub = parsed ? [parsed.series, parsed.scripture].filter(Boolean).join(' · ') : '';

  return (
    <Section>
      <h2 className="sr-only">{LABELS.liveSection}</h2>
      <Reveal>
        <div className="relative">
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl bg-b1-text">
            {video && !isLive && (
              <Image src={video.thumbnail} alt="" fill sizes="(min-width: 1320px) 1320px, 88vw" className="object-cover" priority />
            )}
            {isLive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div ref={playerRef} className="aspect-video w-full [&_iframe]:h-full [&_iframe]:w-full" />
              </div>
            )}
            {feed.status === 'loading' && <div className="bg-b1-border/40 absolute inset-0 motion-safe:animate-pulse" aria-hidden />}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/45 via-transparent to-transparent" />
            {video && (
              <div className="absolute top-6 left-6 flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-[13px] font-medium text-white backdrop-blur">
                {isLive && <span className="bg-b1-sunday h-2 w-2 rounded-full" aria-hidden />}
                {isLive ? meta : LABELS.latestSermon}
              </div>
            )}
            {isLive && (
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? LABELS.unmute : LABELS.mute}
                aria-pressed={!muted}
                className="absolute top-6 right-6 flex h-11 items-center gap-2 rounded-full border border-white/25 bg-black/35 px-4 text-[13px] font-medium text-white backdrop-blur-md transition-colors hover:bg-black/55 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                {muted ? LABELS.unmute : LABELS.mute}
              </button>
            )}
          </div>

          {/* 레이어드 카드 — 채널 로고 · 메타 · 영상 제목 · 유튜브로 */}
          {video && (
            <a
              href={watchHref(video.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="b1-card-hover border-b1-border bg-b1-surface relative z-10 mx-auto -mt-10 flex max-w-[640px] items-center justify-between gap-5 rounded-2xl border p-5 no-underline shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)] md:mr-10 md:ml-auto" /* design-lint-ignore: 카드 부유 그림자 */
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                  <Image src={channelLogo} alt={LABELS.channel} fill sizes="48px" className="object-cover" />
                </span>
                <div className="min-w-0">
                  <div className="text-b1-sub text-[13px]">{isLive ? LABELS.channel : meta}</div>
                  <div className="text-b1-text truncate text-[16px] font-bold tracking-[-0.01em]">{title}</div>
                  {sub && <div className="text-b1-sub truncate text-[13px]">{sub}</div>}
                </div>
              </div>
              <span className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-b1-text px-4 text-[13px] font-semibold text-white">
                <Youtube size={16} />
                {LABELS.watchOnYoutube}
                <ArrowUpRight size={15} />
              </span>
            </a>
          )}
        </div>
      </Reveal>
    </Section>
  );
};
