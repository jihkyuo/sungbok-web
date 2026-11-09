import { PageNumbers } from '@/shared/components/features/Pagination/PageNumbers';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// 시드(컴포넌트 렌더 + RTL): 페이지 번호/생략부호 분기를 검증.
// 쪽 번호는 PaginationLink(button, data-slot="pagination-link"),
// 건너뛰기는 PaginationJump(button, data-slot="pagination-jump") — data-slot 으로 쿼리한다.
// PC 에 보이는 칸만 센다 — 휴대폰 전용 칸(li.sm:hidden)은 빼고(jsdom 은 CSS 를 적용하지 않는다)
const onDesktop = (c: HTMLElement, slot: string) =>
  [...c.querySelectorAll(`[data-slot="${slot}"]`)].filter(
    el => !el.closest('li')?.classList.contains('sm:hidden')
  );
const links = (c: HTMLElement) => onDesktop(c, 'pagination-link');
const jumps = (c: HTMLElement) => onDesktop(c, 'pagination-jump');

describe('PageNumbers', () => {
  it('전체 페이지가 5 이하면 모든 번호를 노출하고 생략부호는 없다', () => {
    const { container } = render(<PageNumbers totalPageCount={3} page={1} navToPage={vi.fn()} />);
    expect(links(container)).toHaveLength(3);
    expect(jumps(container)).toHaveLength(0);
  });

  it('가운데 페이지에서는 양쪽에 생략부호가 등장한다', () => {
    const { container } = render(<PageNumbers totalPageCount={12} page={6} navToPage={vi.fn()} />);
    // 1, 4,5,6,7,8, 12 = 7개 링크 + 양쪽 생략부호 2개
    expect(links(container)).toHaveLength(7);
    expect(jumps(container)).toHaveLength(2);
    expect(container.querySelector('[data-active="true"]')).toHaveTextContent('6');
  });

  it('생략부호가 한 쪽만 가리게 되면 그 쪽 번호를 그냥 보인다', () => {
    const { container } = render(<PageNumbers totalPageCount={20} page={5} navToPage={vi.fn()} />);
    // 1,2,3,4,5,6,7, 20 — 앞쪽은 2 하나만 가려질 자리라 생략부호 대신 2 를 보인다
    expect(links(container)).toHaveLength(8);
    expect(jumps(container)).toHaveLength(1);
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
  });

  it('첫 페이지에서는 끝쪽 생략부호만 등장한다', () => {
    const { container } = render(<PageNumbers totalPageCount={10} page={1} navToPage={vi.fn()} />);
    // 1, 2,3, 10 = 4개 링크 + 끝쪽 생략부호 1개
    expect(links(container)).toHaveLength(4);
    expect(jumps(container)).toHaveLength(1);
  });

  it('생략부호 클릭 시 5칸 점프 위치로 navToPage 를 호출한다', async () => {
    const navToPage = vi.fn();
    const { container } = render(
      <PageNumbers totalPageCount={20} page={10} navToPage={navToPage} />
    );
    const [startJump, endJump] = jumps(container);

    await userEvent.click(startJump);
    expect(navToPage).toHaveBeenLastCalledWith(5); // max(10 - 5, 2)

    await userEvent.click(endJump);
    expect(navToPage).toHaveBeenLastCalledWith(15); // min(10 + 5, 20 - 1)
  });

  it('생략부호는 키보드로 누를 수 있고 화면낭독기가 도착할 쪽을 읽는다', async () => {
    const navToPage = vi.fn();
    render(<PageNumbers totalPageCount={20} page={10} navToPage={navToPage} />);
    const back = screen.getByRole('button', { name: '5페이지로 건너뛰기' });
    expect(screen.getByRole('button', { name: '15페이지로 건너뛰기' })).toBeInTheDocument();
    back.focus();
    await userEvent.keyboard('{Enter}');
    expect(navToPage).toHaveBeenLastCalledWith(5);
  });

  it('번호 클릭 시 해당 페이지로 navToPage 를 호출한다', async () => {
    const navToPage = vi.fn();
    render(<PageNumbers totalPageCount={3} page={1} navToPage={navToPage} />);

    await userEvent.click(screen.getByText('2'));
    expect(navToPage).toHaveBeenCalledWith(2);
  });

  it('휴대폰에서는 지금 쪽 양옆 번호를 숨기고, 필요하면 휴대폰 전용 건너뛰기를 보인다', () => {
    const { container } = render(<PageNumbers totalPageCount={20} page={4} navToPage={vi.fn()} />);
    const item = (name: string) => screen.getByRole('button', { name }).closest('li')!;
    expect(item('4')).not.toHaveClass('max-sm:hidden');
    expect(item('3')).toHaveClass('max-sm:hidden');
    expect(item('2페이지로 건너뛰기')).toHaveClass('sm:hidden'); // PC 는 2·3 이 보여 건너뛰기 없음
    expect(item('1')).not.toHaveClass('max-sm:hidden');
    expect(item('20')).not.toHaveClass('max-sm:hidden');
    expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1); // 한 벌만 그린다
  });
});
