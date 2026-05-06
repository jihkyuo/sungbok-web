import { Reveal } from '@/shared/components/features/Reveal';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const VISITOR_INFO = [
  { label: '오시는 길', value: '서울시 동대문구 장안벚꽃로 139' },
  { label: '주차', value: '교회 주차장 이용' },
  { label: '문의', value: '02-2245-5840' },
  { label: '메일', value: 'sungbok1979@naver.com' },
];

const NEWS_ITEMS = [
  { tag: '공지', date: '05.05', title: '어버이주일 가정 예배 안내' },
  { tag: '소식', date: '05.02', title: '새가족 환영회 5월 12일 진행' },
  { tag: '교육', date: '04.28', title: '여름 단기선교 신청 접수 시작' },
  { tag: '행사', date: '04.20', title: '청년 연합 찬양집회 안내' },
];

export const VisitorAndNews = () => {
  return (
    <section className="px-5 py-10 md:px-10 md:py-24">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <Reveal className="md:col-span-6">
          <div className="bg-b1-accent text-b1-bg flex h-full flex-col rounded-2xl px-6 py-8 md:px-9 md:py-11">
            <div className="b1-mono mb-4 text-[11px] tracking-[0.05em] text-white/60">
              FOR FIRST-TIME VISITORS
            </div>
            <h2 className="m-0 text-[28px] leading-[1.2] font-bold tracking-[-0.02em] md:text-[36px]">
              처음 오신 분께,
              <br />
              부담 없이 오세요.
            </h2>
            <p className="mt-5 flex-1 text-[15px] leading-[1.75] text-white/[0.78]">
              예배 30분 전 도착하시면 안내 위원이 자리를 안내해 드립니다.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {VISITOR_INFO.map(c => (
                <div key={c.label} className="rounded-lg bg-white/[0.08] px-3.5 py-3.5">
                  <div className="b1-mono mb-1 text-[10px] tracking-[0.06em] text-white/55">
                    {c.label.toUpperCase()}
                  </div>
                  <div className="text-[13px] font-medium">{c.value}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={100} className="md:col-span-6">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-b1-text m-0 text-[22px] font-bold tracking-[-0.02em] md:text-[28px]">
              교회 소식
            </h2>
            <Link href="/news" className="b1-mono b1-link text-b1-sub text-[12px] no-underline">
              ALL
              <ArrowRight size={12} strokeWidth={2} />
            </Link>
          </div>
          <div className="bg-b1-surface border-b1-border overflow-hidden rounded-2xl border">
            {NEWS_ITEMS.map((n, i) => (
              <Link
                key={n.title}
                href="/news"
                className={`text-b1-text hover:bg-b1-bg flex items-center gap-4 px-5 py-[18px] no-underline transition-colors ${
                  i < NEWS_ITEMS.length - 1 ? 'border-b1-border border-b' : ''
                }`}
              >
                <span className="bg-b1-accent text-b1-bg rounded-full px-2 py-[3px] text-[10px] font-bold tracking-[0.06em]">
                  {n.tag}
                </span>
                <span className="b1-mono text-b1-muted w-[44px] shrink-0 text-[12px]">
                  {n.date}
                </span>
                <span className="flex-1 text-[15px] font-semibold tracking-[-0.01em]">
                  {n.title}
                </span>
                <ArrowRight size={13} strokeWidth={2} className="text-b1-muted shrink-0" />
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};
