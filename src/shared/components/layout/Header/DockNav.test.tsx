import { DockNav } from '@/shared/components/layout/Header/DockNav';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ usePathname: () => '/about/pastor' }));
// 모바일 메뉴는 포털·아이콘 자산을 끌어와 이 테스트와 무관 — 격리한다.
vi.mock('@/shared/components/layout/Header/SideMenu', () => ({ SideMenu: () => null }));

// 회귀 잠금: 드롭다운 하위 링크가 상위 href 로 가던 버그(SUBMENUS 상수 시절).
describe('DockNav 링크', () => {
  it('상위 링크는 첫 하위 페이지로, 하위 링크는 자기 페이지로 간다', () => {
    render(<DockNav />);
    expect(screen.getByRole('link', { name: '교회소개' })).toHaveAttribute(
      'href',
      '/about/pastor-emeritus'
    );
    expect(screen.getByRole('link', { name: '담임목사' })).toHaveAttribute('href', '/about/pastor');
    expect(screen.getByRole('link', { name: '주일예배' })).toHaveAttribute(
      'href',
      '/worship/sunday'
    );
    expect(screen.getByRole('link', { name: '찾아오시는 길' })).toHaveAttribute(
      'href',
      '/location'
    );
  });

  it('하위가 없는 섹션은 드롭다운을 그리지 않는다', () => {
    render(<DockNav />);
    expect(
      screen.getAllByRole('link', { name: /원로목사|담임목사|섬기는 이들|양육·훈련|연혁/ })
    ).toHaveLength(5);
    expect(screen.getAllByRole('link', { name: '찾아오시는 길' })).toHaveLength(1);
  });
});
