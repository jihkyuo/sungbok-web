'use client';
// 라이브 스테이지 — 21:9 띠 + 레이어드 카드. 유튜브 채널 실데이터(/api/home-video)로 채운다.
// 라이브: 무음 자동재생 + 소리 켜기(홈 단일 소리 규칙). 라이브 없음: 담임목사 최신 설교 썸네일 정지 + 카드 버튼 → 유튜브 새 탭 재생.
import { ArrowUpRight, Volume2, VolumeX } from 'lucide-react';
import { YoutubeIcon } from '@/shared/components/brand/YoutubeIcon';
import { Photo } from '@/shared/components/features/Photo';
import { YoutubeThumb } from '@/shared/components/features/YoutubeThumb';
import { useEffect, useRef } from 'react';

import channelLogo from '@/assets/icons/sungbok-channel-logo.webp';
import {
  formatKoDate,
  liveServiceName,
  parseSermonTitle,
  watchHref,
} from '@/domains/home/api/homeVideoFeed';
import { useHomeVideoFeed } from '@/domains/home/api/useHomeVideoFeed';
import { Section } from '@/domains/home/components/features/Section';
import { LABELS } from '@/domains/home/data/homeVideo';
import { Reveal } from '@/shared/components/features/Reveal';
import { getAudioOwner, useAudioFocus } from '@/shared/lib/audioFocus';
import { createPlayer, type YTPlayer } from '@/shared/lib/youtubePlayer';
import { useNearViewport } from '@/shared/lib/hooks/useNearViewport';
import { usePageLoaded } from '@/shared/lib/hooks/usePageLoaded';

export const LiveStage = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  // 라이브 플레이어(플레이어 코드 약 1MB)는 무대 한 화면 앞에서 멈춘 채로 미리 만들고, 재생(영상 데이터)은 무대가
  // 실제로 화면에 들어왔을 때 시작한다 — 도착하면 바로 움직이고, 화면 밖에서 영상을 받지는 않는다.
  // 미리 만들기는 페이지 첫 로딩이 끝난 뒤에만(새로고침 직후 첫 화면과 회선을 다투지 않게). 화면 안이면 바로 만든다.
  const seen = useNearViewport(stageRef, '0px');
  const near = useNearViewport(stageRef, '100% 0px');
  const pageLoaded = usePageLoaded();
  const warm = seen || (near && pageLoaded);
  const seenRef = useRef(false);
  const feed = useHomeVideoFeed();
  const video = feed.live ?? feed.sermon;
  const isLive = !!feed.live;
  const parsed = video && !isLive ? parseSermonTitle(video.title) : null;

  // 라이브 플레이어 — 띠(21:9)를 16:9 iframe 이 덮도록 폭 100% 로 두고 세로를 잘라낸다.
  const playerRef = useRef<HTMLDivElement>(null);
  const ytRef = useRef<YTPlayer | null>(null);
  // 소리는 홈 전체에서 한 영상만 — 내가 소리 주인일 때만 소리가 난다(음소거 상태 = 주인 아님).
  const audio = useAudioFocus('live');
  const muted = !audio.active;
  useEffect(() => {
    if (!warm || !isLive || !video || !playerRef.current) return;
    // 모션 줄이기 — 자동재생을 끄고 플레이어의 네이티브 컨트롤로 사용자가 직접 재생한다
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const destroy = createPlayer(playerRef.current, video.id, {
      autoplay: false,
      controls: reduced,
      onReady: p => {
        ytRef.current = p;
        p.getIframe().title = video.title;
        // 이미 화면에 들어와 있으면 준비되는 즉시 재생(아직이면 아래 seen 효과가 건다). 무음으로 재생을 건 뒤에
        // 소리를 켠다 — 플레이어는 늘 음소거로 만들어지므로 소리를 켠 상태(준비 전 클릭·영상 교체 후 재생성)면 다시 켠다.
        if (!reduced && seenRef.current) p.playVideo();
        if (getAudioOwner() === 'live') p.unMute();
      },
    });
    return () => {
      ytRef.current = null;
      destroy();
    };
  }, [warm, isLive, video?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  // 무대가 화면에 들어왔다 — 미리 만들어 둔 플레이어가 준비돼 있으면 지금 재생한다
  useEffect(() => {
    seenRef.current = seen;
    if (seen && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ytRef.current?.playVideo();
    }
  }, [seen]);
  // 라이브가 내려가면(끝남·10분 넘게 확인 못 함) 소리 주인도 내려놓는다 — 라이브가 다시 떴을 때
  // 사용자가 누르지 않았는데 onReady 에서 소리가 켜지지 않게. 영상만 바뀌는 라이브→라이브는 그대로 둔다.
  const releaseAudio = audio.release; // 고정 참조(useCallback) — 렌더마다 다시 돌지 않게
  useEffect(() => {
    if (!isLive) releaseAudio();
  }, [isLive, releaseAudio]);
  // 다른 영상이 소리를 가져가면 플레이어를 음소거한다(외부 시스템 동기화).
  useEffect(() => {
    if (!audio.active) ytRef.current?.mute();
  }, [audio.active]);
  const toggleMute = () => {
    if (muted) {
      audio.claim();
      ytRef.current?.unMute();
    } else {
      audio.release();
      ytRef.current?.mute();
    }
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
        <div ref={stageRef} className="relative">
          <div className="bg-b1-text relative aspect-[21/9] w-full overflow-hidden rounded-3xl">
            {video && !isLive && (
              <YoutubeThumb
                src={video.thumbnail}
                alt=""
                fill
                // 폰은 640px 판(sd) — 배율 3 에서 1280px 판을 고르지 않게 폭을 작게 적는다(광고 릴 SCREEN_SIZES 와 같은 이유)
                sizes="(max-width: 767px) 213px, (min-width: 1320px) 1320px, 88vw"
                className="object-cover"
              />
            )}
            {isLive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  ref={playerRef}
                  className="aspect-video w-full [&_iframe]:h-full [&_iframe]:w-full"
                />
              </div>
            )}
            {feed.status === 'loading' && (
              <div
                className="bg-b1-border/40 absolute inset-0 motion-safe:animate-pulse"
                aria-hidden
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/45 via-transparent to-transparent" />
            {video && (
              <div className="text-caption absolute top-6 left-6 flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 font-medium text-white backdrop-blur">
                {isLive && <span className="bg-b1-sunday h-2 w-2 rounded-full" aria-hidden />}
                {isLive ? meta : LABELS.latestSermon}
              </div>
            )}
            {isLive && (
              <button
                type="button"
                onClick={toggleMute}
                className="text-caption absolute top-6 right-6 flex h-11 items-center gap-2 rounded-full border border-white/25 bg-black/35 px-4 font-medium text-white backdrop-blur-md transition-colors hover:bg-black/55 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
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
                  <Photo
                    src={channelLogo}
                    alt={LABELS.channel}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </span>
                <div className="min-w-0">
                  <div className="text-b1-sub text-caption">{isLive ? LABELS.channel : meta}</div>
                  <div className="text-b1-text text-body truncate font-bold tracking-[-0.01em]">
                    {title}
                  </div>
                  {sub && <div className="text-b1-sub text-caption truncate">{sub}</div>}
                </div>
              </div>
              <span className="bg-b1-text text-caption inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 font-semibold text-white">
                <YoutubeIcon size={16} />
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
