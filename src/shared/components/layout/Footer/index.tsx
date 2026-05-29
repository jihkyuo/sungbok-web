import { Reveal } from '@/shared/components/features/Reveal';

const CHURCH = {
  name: '성복교회',
  wordmark: 'SUNGBOK',
  pastorLabel: '담임목사',
  pastor: '이요셉',
  tel: '02-2245-5840',
  telHref: 'tel:02-2245-5840',
  email: 'sungbok1979@naver.com',
  emailHref: 'mailto:sungbok1979@naver.com',
  address: '서울시 동대문구 장안벚꽃로 139',
  copyright: '© 2026 성복교회. All rights reserved.',
} as const;

const Dot = () => <span className="text-b1-border px-2.5">·</span>;

export const Footer = () => (
  <footer className="bg-b1-surface border-t-b1-border relative z-10 border-t px-5 py-16 text-center md:py-20">
    <Reveal>
      <div className="text-b1-text text-[26px] font-bold tracking-[-0.01em] md:text-[30px]">
        {CHURCH.name}
        <span className="b1-mono text-b1-muted ml-2 align-middle text-[12px] font-medium tracking-[0.12em]">
          {CHURCH.wordmark}
        </span>
      </div>

      <p className="text-b1-sub mx-auto mt-5 flex max-w-[640px] flex-wrap items-center justify-center text-[13px] leading-[1.9] md:text-[14px]">
        <span>
          {CHURCH.pastorLabel} {CHURCH.pastor}
        </span>
        <Dot />
        <a href={CHURCH.telHref} className="hover:text-b1-text transition-colors">
          {CHURCH.tel}
        </a>
        <Dot />
        <a href={CHURCH.emailHref} className="hover:text-b1-text transition-colors">
          {CHURCH.email}
        </a>
        <Dot />
        <span>{CHURCH.address}</span>
      </p>

      <div className="b1-mono text-b1-muted mt-8 text-[11px] tracking-[0.04em]">{CHURCH.copyright}</div>
    </Reveal>
  </footer>
);
