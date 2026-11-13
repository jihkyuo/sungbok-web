'use client';
// 광고 릴 «빌보드» — 재생목록 로테이션. 큐가 메인 위에 겹친다.
// 메인은 두 번 나온다: 섹션 전폭의 벽(재생 중인 영상이 밝은 스크림 아래로 번진 것)과, 그 벽에 걸린 16:9 액자(실제 플레이어).
// 후보 띠는 액자 밑단(유리 턱)에 걸쳐 벽 위로 내려온다 — 영상 픽셀은 하나도 가리지 않는다.
// 전환(handoff): 고른 썸네일이 제자리에서 벽 전체로 번지고(scale + crossfade), 액자는 새 포스터로 덮인 뒤 플레이어를 바꾼다.
import { Volume2, VolumeX } from 'lucide-react';
import { YoutubeThumb } from '@/shared/components/features/YoutubeThumb';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

import type { HomeVideo } from '@/domains/home/api/homeVideoFeed';
import { useHomeVideoFeed } from '@/domains/home/api/useHomeVideoFeed';
import { LABELS } from '@/domains/home/data/homeVideo';
import { useAudioFocus } from '@/shared/lib/audioFocus';
import { useNearViewport } from '@/shared/lib/hooks/useNearViewport';
import { cn } from '@/shared/lib/utils';
import { createPlayer, type YTPlayer } from '@/shared/lib/youtubePlayer';

const SECTION_LABEL = '광고 영상';
/** 포스터가 재생 중인 영상을 다 덮은 뒤에 플레이어를 바꾼다(검은 틈 없이) */
const SWAP_MS = 340;
const THUMB_SIZES = '(min-width: 768px) 220px, 40vw';
const SCREEN_SIZES = '(min-width: 1500px) 1320px, 88vw';
const SKELETON_THUMBS = 5;

const CSS = `
.sp-b-stage {
  container-type: inline-size;
  /* 제목 줄 + 액자 + 띠가 독 아래 한 화면에 들어오도록 폭을 높이에서 역산한다. 낮은 화면에서도 메인은 56vw(최대 45rem) 아래로 줄지 않는다 */
  width: min(100%, max(min(56vw, 45rem), calc((100svh - 21.5rem) * 16 / 9)));
  margin-inline: auto;
}
/* 썸네일 크기는 개수와 무관하다 — 액자 폭에서만 정해지고, 넘치면 띠가 흐른다 */
.sp-b-in {
  --sp-b-inset: 14px;
  --sp-b-gap: 8px;
  --sp-b-tw: calc((100cqw - 2 * var(--sp-b-inset) - 2 * var(--sp-b-gap)) / 2.6);
  --sp-b-th: calc(var(--sp-b-tw) * 0.5625);
  --sp-b-lap: calc(var(--sp-b-th) * 0.42);
}
@container (min-width: 440px) {
  .sp-b-in { --sp-b-inset: 20px; --sp-b-gap: 10px; --sp-b-tw: calc((100cqw - 2 * var(--sp-b-inset) - 3 * var(--sp-b-gap)) / 3.6); }
}
@container (min-width: 640px) {
  .sp-b-in { --sp-b-inset: 28px; --sp-b-gap: 12px; --sp-b-tw: calc((100cqw - 2 * var(--sp-b-inset) - 5 * var(--sp-b-gap)) / 5.4); }
}
.sp-b-ledge { padding-bottom: calc(var(--sp-b-lap) + 12px); }
.sp-b-strip { margin-top: calc(-1 * (var(--sp-b-lap) + 12px)); }
.sp-b-scroll { padding: 12px 0 28px; scrollbar-width: none; }
.sp-b-scroll::-webkit-scrollbar { display: none; }
.sp-b-row { gap: var(--sp-b-gap); padding-inline: var(--sp-b-inset); }
.sp-b-thumb { width: var(--sp-b-tw); transition: transform 220ms cubic-bezier(0.23, 1, 0.32, 1); }
.sp-b-veil { transition: opacity 200ms ease; }
.sp-b-bar { transform: scaleX(0); transition: transform 500ms linear; }
.sp-b-cover { transition: opacity 320ms cubic-bezier(0.23, 1, 0.32, 1); }
/* 플레이어는 보기만 — 조작은 소리 버튼·썸네일 띠. 모션 줄이기에서는 네이티브 컨트롤을 연다 */
.sp-b-screen iframe { pointer-events: none; }

@keyframes sp-b-bloom-move {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(var(--sp-b-dx), var(--sp-b-dy), 0) scale(var(--sp-b-s)); }
}
@keyframes sp-b-bloom-fade {
  0%, 12% { opacity: 1; }
  55% { opacity: 0.7; }
  100% { opacity: 0; }
}
/* 번짐 — 흐림은 185px 짜리 원본 층에만 걸고 확대는 transform 이 한다(넓은 면을 다시 칠하지 않는다) */
@keyframes sp-b-bloom-blur {
  from { filter: blur(0); }
  65%, to { filter: blur(9px); }
}
@keyframes sp-b-wall-in {
  from { opacity: 0; transform: scale(1.06); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes sp-b-title-in {
  from { opacity: 0; transform: translate3d(0, 6px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes sp-b-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* 전환 한 번이 이 섹션의 모션 예산이다 — 번짐 960ms 는 그 한 순간에만 쓴다 */
.sp-b-bloom {
  transform-origin: center;
  will-change: transform, opacity, filter;
  animation:
    sp-b-bloom-move 960ms cubic-bezier(0.45, 0.05, 0.2, 1) both,
    sp-b-bloom-fade 960ms linear both,
    sp-b-bloom-blur 960ms linear both;
}
.sp-b-wall-in { animation: sp-b-wall-in 960ms cubic-bezier(0.23, 1, 0.32, 1) both; }
.sp-b-title { animation: sp-b-title-in 420ms cubic-bezier(0.23, 1, 0.32, 1) 120ms both; }

@media (prefers-reduced-motion: reduce) {
  .sp-b-bloom { display: none; }
  .sp-b-wall-in { animation: sp-b-fade 200ms ease both; }
  .sp-b-title { animation: sp-b-fade 160ms ease both; }
  .sp-b-thumb { transition-duration: 1ms; }
  .sp-b-cover { transition-duration: 160ms; }
  .sp-b-bar { transition-duration: 1ms; }
  .sp-b-screen iframe { pointer-events: auto; }
}
`;

const clock = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = String(Math.floor(sec % 60)).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
};

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ───────────── 골격(로딩·본체 공용 — 같은 자리, 같은 크기) ───────────── */

const Shell = ({ wall, children }: { wall?: ReactNode; children: ReactNode }) => (
  <>
    <style>{CSS}</style>
    <h2 className="sr-only">{SECTION_LABEL}</h2>
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {wall}
    </div>
    <div className="relative z-10 px-[6vw]">
      <div className="mx-auto max-w-[1320px]">
        <div className="sp-b-stage">
          <div className="sp-b-in">{children}</div>
        </div>
      </div>
    </div>
  </>
);

const SECTION_CLASS = 'relative w-full overflow-hidden pt-12 pb-14 md:pt-16 md:pb-20';
const HEAD_CLASS =
  'mb-3 flex min-h-12 items-end justify-between gap-4 px-2 md:mb-4 md:gap-8 md:px-2.5';
const BOARD_CLASS =
  'relative rounded-[26px] border border-white/70 bg-white/45 p-2 shadow-2xl shadow-b1-text/15 backdrop-blur-xl md:rounded-[32px] md:p-2.5';
const SCREEN_CLASS =
  'relative aspect-video w-full overflow-hidden rounded-[18px] md:rounded-[22px]';
const THUMB_CLASS =
  'sp-b-thumb relative block aspect-video shrink-0 overflow-hidden rounded-[10px] md:rounded-xl';

const Skeleton = () => (
  <section aria-label={SECTION_LABEL} aria-busy className={SECTION_CLASS}>
    <Shell>
      <div className={HEAD_CLASS}>
        <div className="bg-b1-border/70 mb-1 h-5 w-[min(60%,22rem)] rounded-full motion-safe:animate-pulse" />
        <div className="h-11 w-11 shrink-0" />
      </div>
      <div className={cn(BOARD_CLASS, 'sp-b-ledge')}>
        <div className={cn(SCREEN_CLASS, 'bg-b1-border/60 motion-safe:animate-pulse')} />
      </div>
      <div className="sp-b-strip relative z-10">
        <div className="sp-b-scroll overflow-hidden">
          <div className="sp-b-row mx-auto flex w-max">
            {Array.from({ length: SKELETON_THUMBS }, (_, i) => (
              <div
                key={i}
                className={cn(
                  THUMB_CLASS,
                  'bg-b1-border ring-1 ring-white/80 motion-safe:animate-pulse'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </Shell>
  </section>
);

export const NoticeReelSkeleton = Skeleton;

/* ───────────── 본체 ───────────── */

type Bloom = {
  k: number;
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  dx: number;
  dy: number;
  s: number;
};

const Wall = ({ video, entering }: { video: HomeVideo; entering?: boolean }) => (
  <div className={cn('absolute inset-0', entering && 'sp-b-wall-in')}>
    <YoutubeThumb
      src={video.thumbnail}
      alt=""
      fill
      sizes="320px"
      // 섹션 전체를 덮는 배경이라 폰에서는 16:9 보다 세로로 길다 — 검은 띠가 든 4:3 크기는 쓰지 않는다
      wide
      className="scale-125 object-cover blur-3xl saturate-150"
    />
  </div>
);

const Billboard = ({ notices }: { notices: HomeVideo[] }) => {
  const n = notices.length;
  const hasQueue = n > 1;

  // index = 화면이 가리키는 영상(띠·제목·벽), mounted = 플레이어가 실제로 물고 있는 영상. 전환 중 SWAP_MS 동안만 다르다.
  const [rawIndex, setIndex] = useState(0);
  const [rawMounted, setMounted] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [cover, setCover] = useState(true);
  const [bloom, setBloom] = useState<Bloom | null>(null);
  const [edge, setEdge] = useState({ l: false, r: false });
  // 가리키거나 포커스한 후보의 큰 포스터를 미리 받아 둔다 — 누르는 순간 액자에 선명하게 깔린다
  const [warmId, setWarmId] = useState<string | null>(null);

  const index = Math.min(rawIndex, n - 1);
  const mounted = Math.min(rawMounted, n - 1);
  const current = notices[index];
  const playing = notices[mounted];
  const upcoming = notices[(index + 1) % n];
  const prev = prevIndex !== null && prevIndex !== index ? notices[prevIndex] : undefined;
  const warm = notices.find(v => v.id === warmId && v.id !== current.id && v.id !== upcoming.id);
  const settled = index === mounted;

  const sectionRef = useRef<HTMLElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const swapTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // 유튜브 플레이어(IFrame API 스크립트 + iframe)는 릴이 한 화면 앞까지 왔을 때 만든다 — 첫 로딩에서 뺀다.
  const near = useNearViewport(sectionRef, '100% 0px');
  const bloomSeq = useRef(0);
  const live = useRef({ index, mounted, soundOn: false, next: () => {} });

  const audio = useAudioFocus('reel');

  const go = (to: number) => {
    if (to === index || to < 0 || to >= n) return;
    const section = sectionRef.current;
    const thumb = thumbRefs.current[to];
    const scroller = scrollerRef.current;
    if (section && thumb && scroller && !prefersReducedMotion()) {
      const s = section.getBoundingClientRect();
      const t = thumb.getBoundingClientRect();
      const sc = scroller.getBoundingClientRect();
      // 띠 밖으로 흘러 나가 있는 썸네일은 띠 가장자리에서 번지기 시작한다
      const left = Math.min(Math.max(t.left, sc.left), sc.right - t.width);
      const x = left - s.left;
      const y = t.top - s.top;
      bloomSeq.current += 1;
      setBloom({
        k: bloomSeq.current,
        src: notices[to].thumbnail,
        x,
        y,
        w: t.width,
        h: t.height,
        dx: s.width / 2 - (x + t.width / 2),
        dy: s.height / 2 - (y + t.height / 2),
        s: Math.max(s.width / t.width, s.height / t.height) * 1.06,
      });
    }
    setPrevIndex(index);
    setIndex(to);
    setCover(true);
    clearTimeout(swapTimer.current);
    swapTimer.current = setTimeout(() => {
      // 되돌아와 이미 재생 중인 영상을 다시 고른 경우 — 바꿀 플레이어가 없으니 포스터만 걷는다
      if (live.current.mounted === to) setCover(false);
      else setMounted(to);
    }, SWAP_MS);
  };

  // 플레이어 콜백이 언제나 최신 상태를 보도록 렌더 뒤에 맞춰 둔다
  useEffect(() => {
    live.current = { index, mounted, soundOn: audio.active, next: () => go((index + 1) % n) };
  });
  useEffect(() => () => clearTimeout(swapTimer.current), []);

  // 메인 플레이어 — 섹션에 iframe 은 이것 하나
  const playingId = playing.id;
  const playingTitle = playing.title;
  const single = n === 1;
  useEffect(() => {
    const el = screenRef.current;
    if (!el || !near) return;
    let fallback: ReturnType<typeof setTimeout> | undefined;
    let watch: ReturnType<typeof setInterval> | undefined;
    const reveal = () => {
      clearInterval(watch);
      if (live.current.index === live.current.mounted) setCover(false);
    };
    // PLAYING 은 첫 프레임보다 먼저 온다 — 재생 시간이 실제로 흐르기 시작한 뒤에 포스터를 걷는다
    const revealWhenMoving = (p: YTPlayer) => {
      if (watch) return;
      const t0 = p.getCurrentTime();
      watch = setInterval(() => {
        if (p.getCurrentTime() - t0 > 0.25) reveal();
      }, 100);
    };
    // 모션 줄이기 — 자동재생·자동 로테이션을 끄고 플레이어의 네이티브 컨트롤로 사용자가 직접 재생한다
    const reduced = prefersReducedMotion();
    const destroy = createPlayer(el, playingId, {
      autoplay: !reduced,
      controls: reduced,
      loop: single,
      onReady: p => {
        playerRef.current = p;
        const frame = p.getIframe();
        frame.title = playingTitle;
        // 로테이션은 릴이 몰고 간다 — 플레이어는 보기만 하고, 조작은 소리 버튼 하나(키보드 포커스도 넘긴다)
        if (!reduced) frame.tabIndex = -1;
        if (live.current.soundOn) p.unMute();
        // 자동재생이 막힌 환경에서도 포스터가 플레이어를 계속 가리고 있지 않도록
        fallback = setTimeout(reveal, reduced ? 0 : 3200);
      },
      onStateChange: (state, p) => {
        if (state === 1) revealWhenMoving(p);
      },
      onEnded: () => {
        if (!reduced) live.current.next();
      },
    });
    return () => {
      clearTimeout(fallback);
      clearInterval(watch);
      playerRef.current = null;
      destroy();
    };
  }, [playingId, playingTitle, single, near]);

  // 홈 단일 소리 규칙 — 다른 영상이 소리를 가져가면 내 것은 스스로 꺼진다
  useEffect(() => {
    if (!audio.active) playerRef.current?.mute();
  }, [audio.active]);
  const toggleSound = () => {
    if (audio.active) {
      audio.release();
      playerRef.current?.mute();
    } else {
      audio.claim();
      playerRef.current?.unMute();
    }
  };

  // 재생 중인 썸네일의 진행선 — 다음 전환까지 남은 길이
  useEffect(() => {
    const tick = () => {
      const bar = barRef.current;
      if (!bar) return;
      let ratio = 0;
      const p = playerRef.current;
      if (p && settled) {
        try {
          ratio = p.getCurrentTime() / (p.getDuration() || 1);
        } catch {
          ratio = 0;
        }
      }
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [settled, index]);

  // 띠가 흐를 때 — 재생 중인 썸네일을 띠 가운데로(페이지 스크롤은 건드리지 않는다)
  useEffect(() => {
    const sc = scrollerRef.current;
    const th = thumbRefs.current[index];
    if (!sc || !th || sc.scrollWidth <= sc.clientWidth) return;
    const scRect = sc.getBoundingClientRect();
    const thRect = th.getBoundingClientRect();
    sc.scrollTo({
      left: sc.scrollLeft + (thRect.left - scRect.left) - (sc.clientWidth - thRect.width) / 2,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }, [index]);

  // 띠 가장자리 — 더 있는 쪽만 흐려진다
  useEffect(() => {
    const sc = scrollerRef.current;
    if (!sc) return;
    const read = () => {
      const l = sc.scrollLeft > 4;
      const r = sc.scrollLeft + sc.clientWidth < sc.scrollWidth - 4;
      setEdge(e => (e.l === l && e.r === r ? e : { l, r }));
    };
    const ro = new ResizeObserver(read);
    ro.observe(sc);
    if (sc.firstElementChild) ro.observe(sc.firstElementChild);
    sc.addEventListener('scroll', read, { passive: true });
    return () => {
      ro.disconnect();
      sc.removeEventListener('scroll', read);
    };
  }, [n]);

  const mask = `linear-gradient(to right, transparent 0, black ${edge.l ? 56 : 0}px, black calc(100% - ${edge.r ? 56 : 0}px), transparent 100%)`;
  const soundLabel = audio.active ? LABELS.mute : LABELS.unmute;

  return (
    <section ref={sectionRef} aria-label={SECTION_LABEL} className={SECTION_CLASS}>
      <Shell
        wall={
          <>
            {prev && <Wall key={prev.id} video={prev} />}
            <Wall key={current.id} video={current} entering={!!prev} />
            {bloom && (
              <div
                key={bloom.k}
                className="sp-b-bloom absolute overflow-hidden rounded-xl"
                style={
                  {
                    left: bloom.x,
                    top: bloom.y,
                    width: bloom.w,
                    height: bloom.h,
                    '--sp-b-dx': `${bloom.dx}px`,
                    '--sp-b-dy': `${bloom.dy}px`,
                    '--sp-b-s': bloom.s,
                  } as CSSProperties
                }
                onAnimationEnd={e => e.animationName === 'sp-b-bloom-move' && setBloom(null)}
              >
                <YoutubeThumb
                  src={bloom.src}
                  alt=""
                  fill
                  sizes={THUMB_SIZES}
                  className="object-cover"
                />
              </div>
            )}
            {/* 밝은 스크림 — 벽은 가운데에서만 색을 띠고 위·아래는 페이지 배경으로 돌아간다(이웃과 이음새 없음) */}
            <div className="bg-b1-bg/60 absolute inset-0" />
            <div className="from-b1-bg to-b1-bg/0 absolute inset-x-0 top-0 h-[34%] bg-gradient-to-b" />
            <div className="from-b1-bg to-b1-bg/0 absolute inset-x-0 bottom-0 h-[26%] bg-gradient-to-t" />
          </>
        }
      >
        <div className={HEAD_CLASS}>
          <h3
            key={current.id}
            className="sp-b-title text-b1-text text-title pb-1 leading-[1.4] font-semibold tracking-[-0.015em] text-balance md:text-[21px]"
          >
            {current.title}
            {current.durationSec !== null && (
              <span className="b1-mono text-b1-sub text-caption md:text-body-sm ml-2.5 font-normal tracking-normal whitespace-nowrap">
                <span className="sr-only">길이 </span>
                {clock(current.durationSec)}
              </span>
            )}
          </h3>
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundLabel}
            className={cn(
              'focus-visible:ring-b1-accent focus-visible:ring-offset-b1-bg text-label inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 max-sm:w-11 sm:px-4',
              audio.active
                ? 'border-b1-text bg-b1-text text-white'
                : 'border-b1-border bg-b1-surface/80 text-b1-text hover:border-b1-sub'
            )}
          >
            {audio.active ? <Volume2 size={17} aria-hidden /> : <VolumeX size={17} aria-hidden />}
            <span className="max-sm:sr-only">{soundLabel}</span>
          </button>
        </div>

        <div className={cn(BOARD_CLASS, hasQueue && 'sp-b-ledge')}>
          <div className={cn(SCREEN_CLASS, 'bg-b1-text')}>
            <div
              ref={screenRef}
              className="sp-b-screen absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full"
            />
            <div
              aria-hidden
              className={cn(
                'sp-b-cover pointer-events-none absolute inset-0',
                cover ? 'opacity-100' : 'opacity-0'
              )}
            >
              {/* 띠에서 이미 받아 둔 작은 판이 먼저 깔리고, 큰 판이 도착하면 그 위에 얹힌다 — 덮는 순간에 빈 화면·이전 그림이 없다 */}
              <YoutubeThumb
                key={`lo-${current.id}`}
                src={current.thumbnail}
                alt=""
                fill
                sizes={THUMB_SIZES}
                className="object-cover"
              />
              <YoutubeThumb
                key={`hi-${current.id}`}
                src={current.thumbnail}
                alt=""
                fill
                sizes={SCREEN_SIZES}
                className="object-cover"
              />
              {hasQueue && (
                <YoutubeThumb
                  key={`next-${upcoming.id}`}
                  src={upcoming.thumbnail}
                  alt=""
                  fill
                  sizes={SCREEN_SIZES}
                  className="invisible object-cover"
                />
              )}
              {warm && (
                <YoutubeThumb
                  key={`warm-${warm.id}`}
                  src={warm.thumbnail}
                  alt=""
                  fill
                  sizes={SCREEN_SIZES}
                  className="invisible object-cover"
                />
              )}
            </div>
          </div>
        </div>

        {hasQueue && (
          <div className="sp-b-strip relative z-10">
            <div
              ref={scrollerRef}
              className="sp-b-scroll relative overflow-x-auto"
              style={{ maskImage: mask, WebkitMaskImage: mask }}
            >
              <ul className="sp-b-row mx-auto flex w-max list-none">
                {notices.map((v, i) => {
                  const active = i === index;
                  return (
                    <li key={v.id} className="flex">
                      <button
                        type="button"
                        ref={el => {
                          thumbRefs.current[i] = el;
                        }}
                        onClick={() => go(i)}
                        onPointerEnter={() => setWarmId(v.id)}
                        onFocus={() => setWarmId(v.id)}
                        aria-label={v.title}
                        aria-current={active ? 'true' : undefined}
                        title={v.title}
                        className={cn(
                          THUMB_CLASS,
                          'group bg-b1-border focus-visible:ring-b1-accent cursor-pointer ring-1 ring-white/80 outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                          active
                            ? 'shadow-b1-text/40 -translate-y-2 shadow-xl'
                            : 'shadow-b1-text/25 shadow-lg hover:-translate-y-1'
                        )}
                      >
                        <YoutubeThumb
                          src={v.thumbnail}
                          alt=""
                          fill
                          sizes={THUMB_SIZES}
                          className="object-cover"
                        />
                        <span
                          aria-hidden
                          className={cn(
                            'sp-b-veil bg-b1-bg/25 absolute inset-0 group-hover:opacity-0 group-focus-visible:opacity-0',
                            active && 'opacity-0'
                          )}
                        />
                        {active && (
                          <span
                            aria-hidden
                            className="absolute inset-x-0 bottom-0 h-[3px] bg-white/40"
                          >
                            <span
                              ref={barRef}
                              className="sp-b-bar bg-b1-accent block h-full origin-left"
                            />
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </Shell>
    </section>
  );
};

export const NoticeReel = () => {
  const feed = useHomeVideoFeed();
  if (feed.status === 'loading') return <Skeleton />;
  if (feed.notices.length === 0) return null;
  return <Billboard notices={feed.notices} />;
};
