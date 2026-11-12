import { SectionShell } from '@/shared/components/layout/SectionShell';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const pathname = vi.hoisted(() => ({ current: '/about/pastor' }));
vi.mock('next/navigation', () => ({ usePathname: () => pathname.current }));

// 확정 머리 S1: 페이지명 h1 + 형제 알약(현재 aria-current) + 본문. 하위 없는 섹션은 알약 없이 섹션명.
describe('SectionShell (S1)', () => {
  it('현재 페이지명을 h1로, 형제를 알약 링크로, 본문을 그대로 렌더한다', () => {
    pathname.current = '/about/pastor';
    render(
      <SectionShell section="about">
        <p>본문</p>
      </SectionShell>
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('담임목사');
    const current = screen.getByRole('link', { name: '담임목사' });
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveAttribute('href', '/about/pastor');
    expect(screen.getByRole('link', { name: '연혁' })).toHaveAttribute('href', '/about/history');
    // 알약 5 + 휴대폰용 이전·다음 꺾쇠 2
    expect(screen.getAllByRole('link')).toHaveLength(7);
    expect(screen.getByText('본문')).toBeInTheDocument();
  });

  // 휴대폰(md 미만)에서 알약 줄 양옆의 꺾쇠 — 누르면 바로 옆 형제 페이지로 간다(줄을 미는 버튼이 아니다).
  it('이전·다음 꺾쇠는 바로 옆 형제 페이지로 가는 링크다', () => {
    pathname.current = '/about/pastor';
    render(
      <SectionShell section="about">
        <p>본문</p>
      </SectionShell>
    );
    expect(screen.getByRole('link', { name: '이전 메뉴: 원로목사' })).toHaveAttribute(
      'href',
      '/about/pastor-emeritus'
    );
    expect(screen.getByRole('link', { name: '다음 메뉴: 섬기는 이들' })).toHaveAttribute(
      'href',
      '/about/staff'
    );
  });

  it('첫 메뉴에서는 다음 꺾쇠만, 마지막 메뉴에서는 이전 꺾쇠만 둔다', () => {
    pathname.current = '/about/pastor-emeritus';
    const { unmount } = render(
      <SectionShell section="about">
        <p>본문</p>
      </SectionShell>
    );
    expect(screen.queryByRole('link', { name: /^이전 메뉴/ })).toBeNull();
    expect(screen.getByRole('link', { name: '다음 메뉴: 담임목사' })).toBeInTheDocument();
    unmount();

    pathname.current = '/about/history';
    render(
      <SectionShell section="about">
        <p>본문</p>
      </SectionShell>
    );
    expect(screen.getByRole('link', { name: '이전 메뉴: 양육·훈련' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^다음 메뉴/ })).toBeNull();
  });

  it('하위가 없는 섹션은 섹션명을 제목으로 쓰고 알약을 그리지 않는다', () => {
    pathname.current = '/location';
    render(
      <SectionShell section="location">
        <p>본문</p>
      </SectionShell>
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('찾아오시는 길');
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('섹션명 eyebrow 를 두지 않는다 (독이 이미 섹션을 표시)', () => {
    pathname.current = '/about/pastor';
    const { container } = render(
      <SectionShell section="about">
        <p>본문</p>
      </SectionShell>
    );
    expect(container.querySelector('header p')).toBeNull();
  });
});
