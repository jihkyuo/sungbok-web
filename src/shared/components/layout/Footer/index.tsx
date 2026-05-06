'use client';

import { useState } from 'react';

const FOOTER_COLUMNS = [
  { heading: '예배', items: ['주일예배', '수요예배', '새벽기도회', '특별예배'] },
  { heading: '공동체', items: ['새가족', '주일학교', '청년부', '소그룹'] },
  { heading: '말씀', items: ['설교 아카이브', '시리즈', '본문별', '청년 영상'] },
  { heading: '연결', items: ['오시는 길', '연락처', '온라인 헌금', '주보'] },
] as const;

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSent(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-b1-surface border-t-b1-border border-t px-5 pt-10 pb-6 md:px-10 md:pt-14 md:pb-8">
      <div className="grid grid-cols-1 gap-7 pb-10 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] md:gap-8">
        <div>
          <div className="text-[18px] font-bold">
            성복교회
            <span className="b1-mono text-b1-muted ml-1 text-[12px] font-medium">SUNGBOK</span>
          </div>
          <p className="text-b1-sub mt-2 max-w-[280px] text-[13px] leading-[1.7]">
            한 사람을 환대하는 공동체. 말씀과 기도, 따뜻한 이웃됨으로 함께 걷습니다.
          </p>
          <form onSubmit={onSubmit} className="mt-5 flex max-w-[320px]">
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setSent(false);
              }}
              placeholder={sent ? '신청 완료 · 감사합니다' : '주보 알림 · 이메일'}
              className="border-b1-border bg-b1-bg flex-1 rounded-l-lg border border-r-0 px-3.5 py-2.5 text-[13px] outline-none"
            />
            <button
              type="submit"
              className="border-b1-accent bg-b1-accent text-b1-bg rounded-r-lg border px-4 text-[13px] font-semibold transition-all duration-300 ease-out hover:opacity-90 active:scale-[0.97]"
            >
              구독
            </button>
          </form>
        </div>

        {FOOTER_COLUMNS.map(col => (
          <div key={col.heading}>
            <div className="b1-mono text-b1-muted mb-3 text-[10px] tracking-[0.08em]">
              {col.heading.toUpperCase()} · {col.heading}
            </div>
            <ul className="flex flex-col gap-[7px]">
              {col.items.map(item => (
                <li key={item}>
                  <a
                    href="#"
                    onClick={e => e.preventDefault()}
                    className="text-b1-text text-[13px] no-underline hover:opacity-70"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t-b1-border flex flex-wrap justify-between gap-3 border-t pt-5">
        <div className="b1-mono text-b1-muted text-[11px] tracking-[0.04em]">
          © 2026 SUNGBOK · 대한예수교장로회 (합동)
        </div>
        <div className="b1-mono text-b1-muted text-[11px] tracking-[0.04em]">
          SEOUL · 02-2245-5840 · sungbok1979@naver.com
        </div>
      </div>
    </footer>
  );
};
