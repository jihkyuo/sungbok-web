import { DockNav } from '@/shared/components/layout/Header/DockNav';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ usePathname: () => '/about/pastor' }));
// 모바일 메뉴는 포털·아이콘 자산을 끌어와 이 테스트와 무관 — 격리한다.
vi.mock('@/shared/components/layout/Header/SideMenu', () => ({ SideMenu: () => null }));

// 회귀 잠금: 드롭다운 하위 링크가 상위 href 로 가던 버그(SUBMENUS 상수 시절).
// 패널은 hover한 섹션의 하위만 그린다(시안 A 승격, 2026-10-18).
describe('DockNav 링크', () => {
  it('상위 링크는 첫 하위 페이지로, 하위 링크는 자기 페이지로 간다', () => {
    render(<DockNav />);
    expect(screen.getByRole('link', { name: '교회소개' })).toHaveAttribute(
      'href',
      '/about/pastor-emeritus'
    );
    expect(screen.getByRole('link', { name: '찾아오시는 길' })).toHaveAttribute(
      'href',
      '/location'
    );

    fireEvent.mouseEnter(screen.getByRole('link', { name: '교회소개' }));
    expect(screen.getByRole('link', { name: '담임목사' })).toHaveAttribute('href', '/about/pastor');

    fireEvent.mouseEnter(screen.getByRole('link', { name: '예배' }));
    expect(screen.getByRole('link', { name: '주일예배' })).toHaveAttribute(
      'href',
      '/worship/sunday'
    );
  });

  it('펼치면 hover한 섹션의 하위만 보이고, 하위가 없는 섹션은 패널을 열지 않는다', () => {
    render(<DockNav />);
    fireEvent.mouseEnter(screen.getByRole('link', { name: '교회소개' }));
    expect(
      screen.getAllByRole('link', { name: /원로목사|담임목사|섬기는 이들|양육·훈련|연혁/ })
    ).toHaveLength(5);
    expect(screen.queryByRole('link', { name: '주일예배' })).toBeNull();
    expect(screen.getByRole('link', { name: '교회소개' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: '찾아오시는 길' })).not.toHaveAttribute('aria-expanded');
  });
});

// 회귀 잠금: 링크를 눌러 이동한 뒤에도 패널이 열린 채 화면을 가리던 버그(2026-10-25).
describe('DockNav 닫힘', () => {
  it('하위 링크를 누르면 패널이 닫힌다', () => {
    render(<DockNav />);
    fireEvent.mouseEnter(screen.getByRole('link', { name: '교회소개' }));
    fireEvent.click(screen.getByRole('link', { name: '담임목사' }));
    expect(screen.getByRole('link', { name: '교회소개' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('펼쳐진 상위 링크를 누르면 패널이 닫힌다', () => {
    render(<DockNav />);
    fireEvent.mouseEnter(screen.getByRole('link', { name: '교회소개' }));
    fireEvent.click(screen.getByRole('link', { name: '교회소개' }));
    expect(screen.getByRole('link', { name: '교회소개' })).toHaveAttribute('aria-expanded', 'false');
  });
});
