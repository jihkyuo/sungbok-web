import { renderPageNumbers } from '@/shared/components/features/Pagination/renderPageNumbers';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// 시드(컴포넌트 렌더 + RTL): 페이지 번호/생략부호 분기를 검증.
// PaginationLink 는 role="link" 가 아닌 div(data-slot="pagination-link"),
// PaginationEllipsis 는 span(data-slot="pagination-ellipsis") 이므로 data-slot 으로 쿼리한다.
const links = (c: HTMLElement) => c.querySelectorAll('[data-slot="pagination-link"]');
const ellipses = (c: HTMLElement) => c.querySelectorAll('[data-slot="pagination-ellipsis"]');

describe('renderPageNumbers', () => {
  it('전체 페이지가 5 이하면 모든 번호를 노출하고 생략부호는 없다', () => {
    const { container } = render(
      <>{renderPageNumbers({ totalPageCount: 3, page: 1, navToPage: vi.fn() })}</>
    );
    expect(links(container)).toHaveLength(3);
    expect(ellipses(container)).toHaveLength(0);
  });

  it('가운데 페이지에서는 양쪽에 생략부호가 등장한다', () => {
    const { container } = render(
      <>{renderPageNumbers({ totalPageCount: 10, page: 5, navToPage: vi.fn() })}</>
    );
    // 1, 3,4,5,6,7, 10 = 7개 링크 + 양쪽 생략부호 2개
    expect(links(container)).toHaveLength(7);
    expect(ellipses(container)).toHaveLength(2);
    expect(container.querySelector('[data-active="true"]')).toHaveTextContent('5');
  });

  it('첫 페이지에서는 끝쪽 생략부호만 등장한다', () => {
    const { container } = render(
      <>{renderPageNumbers({ totalPageCount: 10, page: 1, navToPage: vi.fn() })}</>
    );
    // 1, 2,3, 10 = 4개 링크 + 끝쪽 생략부호 1개
    expect(links(container)).toHaveLength(4);
    expect(ellipses(container)).toHaveLength(1);
  });

  it('생략부호 클릭 시 5칸 점프 위치로 navToPage 를 호출한다', async () => {
    const navToPage = vi.fn();
    const { container } = render(
      <>{renderPageNumbers({ totalPageCount: 20, page: 10, navToPage })}</>
    );
    const [startEllipsis, endEllipsis] = ellipses(container);

    await userEvent.click(startEllipsis);
    expect(navToPage).toHaveBeenLastCalledWith(5); // max(10 - 5, 2)

    await userEvent.click(endEllipsis);
    expect(navToPage).toHaveBeenLastCalledWith(15); // min(10 + 5, 20 - 1)
  });

  it('번호 클릭 시 해당 페이지로 navToPage 를 호출한다', async () => {
    const navToPage = vi.fn();
    render(<>{renderPageNumbers({ totalPageCount: 3, page: 1, navToPage })}</>);

    await userEvent.click(screen.getByText('2'));
    expect(navToPage).toHaveBeenCalledWith(2);
  });
});
