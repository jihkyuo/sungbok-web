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
    expect(screen.getAllByRole('link')).toHaveLength(5);
    expect(screen.getByText('본문')).toBeInTheDocument();
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
