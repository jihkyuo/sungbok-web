// 교회소식 › 주보 본문. 독자: 성도(이번 주 주보, 매주). 주보는 문서 → 종이로 보여준다.
// 최신 호 날짜 → 좌 이번 주 주보(A4 종이 + 크게 보기/PDF) → 우 지난 주보(월별 날짜 목록).
// TODO(E/I): 실제 주보 파일(PDF/이미지) 연결. 지금은 2026년 실제 주일 날짜 + 홈 설교 제목 스탠드인.
import { SERMON_STILLS } from '@/domains/home/components/widgets/RecentSermons/data';
import { Reveal } from '@/shared/components/features/Reveal';
import { cn } from '@/shared/lib/utils';
import { SampleNotice } from '@/shared/components/layout/SampleNotice';
import { Download, Maximize2 } from 'lucide-react';

const ISSUES = [
  { date: '2026-10-04', label: '10월 4일 주일' },
  { date: '2026-09-27', label: '9월 27일 주일' },
  { date: '2026-09-20', label: '9월 20일 주일' },
  { date: '2026-09-13', label: '9월 13일 주일' },
  { date: '2026-09-06', label: '9월 6일 주일' },
].map((it, i) => ({ ...it, title: SERMON_STILLS[i % SERMON_STILLS.length].title }));
const LATEST = ISSUES[0];
const byMonth = ISSUES.reduce<Record<string, typeof ISSUES>>((acc, it) => {
  const key = `${it.date.slice(0, 4)}년 ${Number(it.date.slice(5, 7))}월`;
  (acc[key] ??= []).push(it);
  return acc;
}, {});

const ORDER = ['예배의 부름', '찬송', '기도', '성경봉독', '설교', '봉헌', '축도'];

export const BulletinPage = () => (
  <>
    <SampleNotice what="주보 내용과 날짜" />
    <Reveal>
      <p className="text-b1-sub text-[17px] md:text-[18px]">
        최신 호{' '}
        <time dateTime={LATEST.date} className="text-b1-text font-semibold">
          2026년 {LATEST.label}
        </time>
      </p>
    </Reveal>

    <div className="mt-10 grid grid-cols-1 gap-12 md:mt-12 md:grid-cols-12 md:gap-16">
      <Reveal delay={60} className="md:col-span-7">
        <section aria-labelledby="latest">
          <h2 id="latest" className="text-b1-text text-[20px] font-bold tracking-[-0.01em]">
            이번 주 주보
          </h2>
          <div className="mt-5 flex flex-col items-start gap-6">
            {/* TODO(E): 실제 주보 파일 연결 시 <a href={pdfUrl}> 로. 목적지 없는 링크를 두지 않기 위해 지금은 div. */}
            <div
              className="border-b1-border block w-full max-w-[480px] rounded-md border bg-white p-8 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.35)] md:p-10" /* design-lint-ignore: 종이 카드 1회성 그림자 */
            >
              <div className="aspect-[1/1.3]">
                <div className="flex items-baseline justify-between">
                  <span className="text-b1-text text-[22px] font-bold tracking-[-0.02em]">
                    성복교회
                  </span>
                  <span className="text-b1-sub text-[13px]">주보</span>
                </div>
                <div className="text-b1-sub mt-1 text-[14px] tabular-nums">
                  {LATEST.date.replaceAll('-', '. ')}
                </div>
                <hr className="border-b1-border my-6" />
                <div className="text-b1-text text-[15px] font-bold">주일예배 순서</div>
                <ol className="mt-3 space-y-2.5">
                  {ORDER.map(o => (
                    <li key={o} className="text-b1-sub flex items-baseline gap-2 text-[14px]">
                      <span className="shrink-0">{o}</span>
                      <span
                        aria-hidden
                        className="border-b1-border mb-1 flex-1 border-b border-dotted"
                      />
                    </li>
                  ))}
                </ol>
                <div className="text-b1-text mt-7 text-[15px] font-bold">말씀</div>
                <p className="text-b1-sub mt-1.5 text-[14px]">{LATEST.title}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {/* 파일 연결 전 — 눌리지 않는 상태임을 숨기지 않는다 */}
              <button
                type="button"
                disabled
                className="bg-b1-accent inline-flex items-center gap-2 rounded-full px-5 py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Maximize2 className="h-4 w-4" />
                크게 보기
              </button>
              <button
                type="button"
                disabled
                className="border-b1-border text-b1-text hover:border-b1-accent hover:text-b1-accent inline-flex items-center gap-2 rounded-full border bg-white px-5 py-3 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                PDF 내려받기
              </button>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={120} className="md:col-span-5">
        <section aria-labelledby="archive">
          <h2 id="archive" className="text-b1-text text-[20px] font-bold tracking-[-0.01em]">
            지난 주보
          </h2>
          <div className="mt-5 flex flex-col gap-8">
            {Object.entries(byMonth).map(([month, items]) => (
              <div key={month}>
                <div className="text-b1-sub text-[15px] font-semibold">{month}</div>
                <ul className="border-b1-border divide-b1-border mt-2 divide-y border-t">
                  {items.map(it => {
                    const active = it.date === LATEST.date;
                    return (
                      <li key={it.date}>
                        <div className="flex items-baseline justify-between gap-4 py-3.5">
                          <span
                            className={cn(
                              'flex items-center gap-2.5 text-[16px] whitespace-nowrap',
                              active ? 'text-b1-text font-bold' : 'text-b1-text font-medium'
                            )}
                          >
                            {active && <span className="bg-b1-accent h-1.5 w-1.5 rounded-full" />}
                            <time dateTime={it.date}>{it.label}</time>
                          </span>
                          <span className="text-b1-sub truncate text-[15px]">{it.title}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  </>
);
