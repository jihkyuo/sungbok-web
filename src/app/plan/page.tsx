import type { Metadata } from 'next';
import { Download } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
  ACTIONS,
  BLOCKS,
  CROSS_CUTTING,
  LEGACY_ORIGIN,
  NEW_SITE_ORIGIN,
  PDF_HREF,
  PDF_PAGES,
  STATUS_LABEL,
  type Status,
} from './data';

/**
 * 기획 기준 페이지(내부용) — 협업자와 분업을 정하는 미팅에서 새 사이트·레거시와 나란히 놓고 본다.
 * 독 메뉴에 없고 주소로만 진입(noindex). 협업자가 Vercel 배포본에서 보므로 운영에서도 열린다 — 공개 주소에 있다는 점을 안다.
 * 데스크톱 미팅 화면 기준. 내용은 ./data.ts, 정본은 .md/meetings/2026-10-08-pastor-review.md + PDF 원문.
 */
export const metadata: Metadata = {
  title: '홈페이지 기획 기준 | 성복교회(내부)',
  robots: { index: false, follow: false },
};

const STATUS_CLASS: Record<Status, string> = {
  done: 'bg-b1-accent-soft text-b1-accent',
  scaffold: 'bg-b1-placeholder text-b1-sub',
  todo: 'border-b1-border text-b1-sub border',
};

const StatusChip = ({ status }: { status: Status }) => (
  <span
    className={cn(
      'inline-block shrink-0 rounded-full px-2 py-0.5 text-[12px] leading-[1.4] font-medium',
      STATUS_CLASS[status]
    )}
  >
    {STATUS_LABEL[status]}
  </span>
);

const ColTitle = ({ children }: { children: string }) => (
  <h3 className="text-b1-sub mb-3 text-[13px] font-medium tracking-[0.02em]">{children}</h3>
);

const Ext = ({ href, children }: { href: string; children: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="text-b1-text decoration-b1-border hover:decoration-b1-accent underline underline-offset-4"
  >
    {children}
  </a>
);

export default function Page() {
  return (
    <div className="px-[6vw] pb-24">
      <div className="mx-auto w-full max-w-[1320px] pt-[112px] md:pt-[128px]">
        <header className="border-b-b1-border border-b pb-8">
          <p className="text-b1-muted text-caption font-medium">
            내부 문서 · 2026-11-08 정리 · 11-09 갱신
          </p>
          <h1 className="text-b1-text mt-2 text-[40px] leading-[1.05] font-bold tracking-[-0.03em] text-balance md:text-[56px]">
            홈페이지 기획 기준
          </h1>
          <p className="text-b1-sub mt-5 max-w-[760px] text-[17px] leading-[1.7]">
            의뢰자 임경일 목사님의 요구사항(2026-10-08 「홈페이지 수정 사항」 PDF와 같은 날 미팅에서
            확정한 내용)이 모든 작업의 밑바탕이다. 메뉴별로 레거시 · 목사님 요구 · 미팅 확정 · 새
            사이트 현재를 나란히 둔다. 상태는 레포 기준 1차 판정이며 미팅에서 고친다.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[15px]">
            <a
              href={PDF_HREF}
              download="홈페이지 수정 사항 (2026-10-08).pdf"
              className="bg-b1-text text-b1-surface inline-flex items-center gap-2 rounded-full px-4 py-2 font-medium"
            >
              <Download size={16} aria-hidden />
              원문 PDF 내려받기
            </a>
            <Ext href={`${LEGACY_ORIGIN}/`}>레거시 사이트 sungbok.or.kr</Ext>
            <Ext href={`${NEW_SITE_ORIGIN}/`}>새 사이트 메인(Vercel)</Ext>
          </div>
          <nav aria-label="메뉴별 바로가기" className="mt-8 flex flex-wrap gap-2">
            {BLOCKS.map(b => (
              <a
                key={b.id}
                href={`#${b.id}`}
                className="border-b1-border text-b1-sub hover:border-b1-accent hover:text-b1-accent rounded-full border px-3 py-1 text-[14px]"
              >
                {b.title}
              </a>
            ))}
            <a
              href="#cross"
              className="border-b1-border text-b1-sub hover:border-b1-accent hover:text-b1-accent rounded-full border px-3 py-1 text-[14px]"
            >
              공통 사항
            </a>
            <a
              href="#actions"
              className="border-b1-border text-b1-sub hover:border-b1-accent hover:text-b1-accent rounded-full border px-3 py-1 text-[14px]"
            >
              액션
            </a>
            <a
              href="#source"
              className="border-b1-border text-b1-sub hover:border-b1-accent hover:text-b1-accent rounded-full border px-3 py-1 text-[14px]"
            >
              원문
            </a>
          </nav>
          <p className="text-b1-sub mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
            <span>상태 범례</span>
            {(['done', 'scaffold', 'todo'] as const).map(s => (
              <StatusChip key={s} status={s} />
            ))}
            <span>
              D = 미팅에서 결정 · O = 미결 (번호는 회의록과 같음. O9 보상·계약은 이 페이지 범위 밖)
            </span>
          </p>
        </header>

        {BLOCKS.map(b => (
          <section
            key={b.id}
            id={b.id}
            className="border-b-b1-border scroll-mt-[96px] border-b py-12"
          >
            <h2 className="text-b1-text text-[28px] leading-[1.15] font-bold tracking-[-0.02em]">
              {b.title}
            </h2>
            <div className="mt-7 grid gap-8 lg:grid-cols-[0.8fr_1.1fr_1.4fr_1.5fr]">
              <div>
                <ColTitle>레거시</ColTitle>
                <ul className="space-y-1.5 text-[15px] leading-[1.6]">
                  {b.legacy.map(l => (
                    <li key={l.href + l.label}>
                      <Ext href={l.href}>{l.label}</Ext>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <ColTitle>목사님 요구 (원문)</ColTitle>
                <ul className="space-y-3">
                  {b.request.map(r => (
                    <li
                      key={r}
                      className="border-l-b1-accent text-b1-text border-l-2 pl-3 text-[15px] leading-[1.65]"
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <ColTitle>미팅 확정 · 미결</ColTitle>
                <ul className="space-y-2.5 text-[15px] leading-[1.6]">
                  {b.decisions.map(d => (
                    <li key={d.id + d.text} className="flex gap-2">
                      <span className="text-b1-accent shrink-0 text-[13px] leading-[1.9] font-semibold">
                        {d.id}
                      </span>
                      <span className="text-b1-text">{d.text}</span>
                    </li>
                  ))}
                  {b.open.map(o => (
                    <li key={o.id} className="flex gap-2">
                      <span className="text-b1-sub shrink-0 text-[13px] leading-[1.9] font-semibold">
                        {o.id}
                      </span>
                      <span className="text-b1-sub">{o.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <ColTitle>새 사이트 현재</ColTitle>
                <ul className="space-y-2.5 text-[15px] leading-[1.6]">
                  {b.current.map(c => (
                    <li key={c.href + c.label} className="flex items-start gap-2">
                      <StatusChip status={c.status} />
                      <span>
                        <Ext href={`${NEW_SITE_ORIGIN}${c.href}`}>{c.label}</Ext>
                        {c.note && (
                          <span className="text-b1-sub block text-[13.5px] leading-[1.55]">
                            {c.note}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                {b.remarks && (
                  <ul className="border-t-b1-border text-b1-sub mt-4 space-y-1.5 border-t pt-3 text-[13.5px] leading-[1.55]">
                    {b.remarks.map(r => (
                      <li key={r}>· {r}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        ))}

        <section id="cross" className="border-b-b1-border scroll-mt-[96px] border-b py-12">
          <h2 className="text-b1-text text-[28px] leading-[1.15] font-bold tracking-[-0.02em]">
            공통 사항
          </h2>
          <dl className="mt-7 grid gap-x-10 gap-y-6 md:grid-cols-2">
            {CROSS_CUTTING.map(c => (
              <div key={c.title}>
                <dt className="text-b1-text flex items-baseline gap-2 text-[16px] font-semibold">
                  {c.title}
                  {c.ref && (
                    <span className="text-b1-muted font-mono text-[12px] font-normal">{c.ref}</span>
                  )}
                </dt>
                <dd className="text-b1-sub mt-1 text-[15px] leading-[1.65]">{c.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="actions" className="border-b-b1-border scroll-mt-[96px] border-b py-12">
          <h2 className="text-b1-text text-[28px] leading-[1.15] font-bold tracking-[-0.02em]">
            미팅에서 나온 액션
          </h2>
          <p className="text-b1-sub mt-2 text-[15px]">
            2026-10-08 시점. 분업은 이 목록과 위의 「새 사이트 현재」를 보고 정한다.
          </p>
          <div className="mt-7 grid gap-8 md:grid-cols-3">
            {ACTIONS.map(a => (
              <div key={a.owner}>
                <ColTitle>{a.owner}</ColTitle>
                <ul className="space-y-2 text-[15px] leading-[1.6]">
                  {a.items.map(i => (
                    <li key={i} className="text-b1-text">
                      · {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="source" className="scroll-mt-[96px] py-12">
          <h2 className="text-b1-text text-[28px] leading-[1.15] font-bold tracking-[-0.02em]">
            원문 — 「홈페이지 수정 사항」 (임경일 목사님, 2026-10-08)
          </h2>
          <p className="text-b1-sub mt-2 text-[15px]">
            3쪽 그대로(클릭하면 원본 크기). 9번 항목은 원문에서 비어 있다. 미팅 녹음의 전체 기록은
            레포{' '}
            <code className="font-mono text-[13.5px]">
              .md/meetings/2026-10-08-pastor-review.md
            </code>{' '}
            에 있다.
          </p>
          <div className="mt-7 grid gap-6 md:grid-cols-3">
            {PDF_PAGES.map((src, i) => (
              <a key={src} href={src} target="_blank" rel="noreferrer" title="원본 크기로 열기">
                {/* eslint-disable-next-line @next/next/no-img-element -- 정적 PDF 렌더 이미지, 최적화 불필요 */}
                <img
                  src={src}
                  alt={`홈페이지 수정 사항 PDF ${i + 1}쪽`}
                  width={794}
                  height={1123}
                  loading="lazy"
                  className="border-b1-border bg-b1-surface w-full border"
                />
              </a>
            ))}
          </div>
          <a
            href={PDF_HREF}
            download="홈페이지 수정 사항 (2026-10-08).pdf"
            className="text-b1-text decoration-b1-border hover:decoration-b1-accent mt-6 inline-flex items-center gap-2 text-[15px] underline underline-offset-4"
          >
            <Download size={16} aria-hidden />
            원문 PDF 내려받기
          </a>
        </section>
      </div>
    </div>
  );
}
