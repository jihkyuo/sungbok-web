// 예배 › 주일예배 본문 — 설교 아카이브. 독자: 성도(지난 주 설교 다시 보기). 주연은 영상.
// 메타 행(설교자) → 최신 설교 featured → 지난 설교 3열 그리드(최신순).
// TODO(B): 유튜브 연동으로 교체 — domains/worship-video 의 API·훅을 이 디자인에 이식한다(지금은 참조 0, 삭제 금지).
// 그때 featured/카드를 <a href={videoUrl}>, '더 보기' 페이지네이션, 교회 채널 링크를 붙인다.
// 지금은 홈과 같은 스탠드인(RecentSermons/data) + 날짜를 한 주씩 물려 9장. 목적지 없는 링크·죽은 버튼은 두지 않는다.
import {
  LATEST_SERMON,
  POSTER,
  SERMON_STILLS,
} from '@/domains/home/components/widgets/RecentSermons/data';
import { Reveal } from '@/shared/components/features/Reveal';
import { Play } from 'lucide-react';
import Image from 'next/image';

const PREACHER = LATEST_SERMON.preacher;

const shift = (d: string, weeks: number) => {
  const [y, m, day] = d.split('.').map(Number);
  const t = new Date(y, m - 1, day - weeks * 7);
  return `${t.getFullYear()}.${String(t.getMonth() + 1).padStart(2, '0')}.${String(t.getDate()).padStart(2, '0')}`;
};
const LIST = [
  ...SERMON_STILLS.slice(1),
  ...SERMON_STILLS.slice(1, 5).map(s => ({ ...s, date: shift(s.date, 6) })),
];

export const SermonArchive = () => (
  <>
    <Reveal>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-b1-sub text-[15px]">{PREACHER} · 매주 주일</p>
      </div>
    </Reveal>

    <Reveal delay={80}>
      <section
        aria-labelledby="latest"
        className="mt-8 grid grid-cols-1 gap-6 md:mt-10 md:grid-cols-12 md:gap-10"
      >
        {/* TODO(B): 유튜브 연동 시 <a href={videoUrl}> 로. 목적지 없는 링크를 두지 않기 위해 지금은 div. */}
        <div
          role="img"
          aria-label={`${LATEST_SERMON.title} 설교 영상 썸네일`}
          className="relative block aspect-video overflow-hidden rounded-2xl md:col-span-8"
        >
          <Image
            src={POSTER}
            alt=""
            fill
            preload
            className="object-cover"
            sizes="(min-width: 768px) 66vw, 100vw"
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent"
          />
          <span className="absolute inset-0 grid place-items-center">
            <span
              className="grid h-16 w-16 place-items-center rounded-full bg-white/95 shadow-[0_12px_28px_-10px_rgba(15,23,42,0.5)]" /* design-lint-ignore: 재생 버튼 1회성 그림자 */
            >
              <Play className="text-b1-accent ml-1 h-6 w-6 fill-current" />
            </span>
          </span>
        </div>
        <div className="flex flex-col justify-center md:col-span-4">
          <div className="text-b1-accent text-[14px] font-semibold">최근 설교</div>
          <time
            dateTime={LATEST_SERMON.date.replaceAll('.', '-')}
            className="text-b1-sub mt-3 block text-[15px] tabular-nums"
          >
            {LATEST_SERMON.date}
          </time>
          <h2
            id="latest"
            className="text-b1-text mt-2 text-[28px] leading-[1.2] font-bold tracking-[-0.02em] text-balance"
          >
            {LATEST_SERMON.title}
          </h2>
          <p className="text-b1-sub mt-3 text-[16px]">{LATEST_SERMON.scripture}</p>
          <p className="text-b1-text mt-1 text-[15px] font-medium">{LATEST_SERMON.preacher}</p>
          <span className="border-b1-border text-b1-sub mt-5 inline-flex w-fit items-center rounded-full border px-3 py-1 text-[14px]">
            시리즈 · {LATEST_SERMON.series}
          </span>
        </div>
      </section>
    </Reveal>

    <section aria-labelledby="archive" className="mt-16 md:mt-24">
      <Reveal>
        <div className="flex items-baseline justify-between">
          <h2 id="archive" className="text-b1-text text-[22px] font-bold tracking-[-0.02em]">
            지난 설교
          </h2>
          <span className="text-b1-sub text-[14px]">최신순</span>
        </div>
      </Reveal>
      <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
        {LIST.map((s, i) => (
          <li key={`${s.date}-${i}`}>
            <Reveal delay={(i % 3) * 60}>
              <article>
                <div className="relative aspect-video overflow-hidden rounded-xl">
                  <Image
                    src={s.img}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 30vw, 100vw"
                  />
                </div>
                <time
                  dateTime={s.date.replaceAll('.', '-')}
                  className="text-b1-sub mt-3 block text-[14px] tabular-nums"
                >
                  {s.date}
                </time>
                <h3 className="text-b1-text mt-1 text-[17px] leading-snug font-bold">{s.title}</h3>
                <p className="text-b1-sub mt-1 text-[14px]">
                  {s.scripture} · {PREACHER}
                </p>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  </>
);
