import { Pagination } from '@/shared/components/features/Pagination/Pagination';
import { PaginationJump, PaginationNext } from '@/shared/components/ui/pagination';
import { usePageState } from '@/shared/components/features/Pagination/usePageState';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// Pagination 은 보여주기만 한다 — 쪽 번호 상태는 목록 주인이 usePageState 로 쥔다(실제 Playlist 와 같은 구성).
function Harness({ total, pageSize = 5 }: { total: number; pageSize?: number }) {
  const [page, setPage] = usePageState(total, pageSize);
  return <Pagination total={total} pageSize={pageSize} currentPage={page} onChange={setPage} />;
}

const off = (name: string) =>
  expect(screen.getByRole('button', { name })).toHaveAttribute('aria-disabled', 'true');
const on = (name: string) =>
  expect(screen.getByRole('button', { name })).not.toHaveAttribute('aria-disabled', 'true');
const current = (name: string) =>
  expect(screen.getByRole('button', { name })).toHaveAttribute('aria-current', 'page');

describe('Pagination', () => {
  it('쪽 번호·이전·다음은 키보드로 누를 수 있는 버튼이다', async () => {
    render(<Harness total={20} />);
    screen.getByRole('button', { name: '다음 페이지' }).focus();
    await userEvent.keyboard('{Enter}');
    current('2');
  });

  it('첫 쪽에서 이전, 마지막 쪽에서 다음은 비활성', () => {
    const { rerender } = render(
      <Pagination total={10} pageSize={5} currentPage={1} onChange={vi.fn()} />
    );
    off('이전 페이지');
    on('다음 페이지');
    rerender(<Pagination total={10} pageSize={5} currentPage={2} onChange={vi.fn()} />);
    on('이전 페이지');
    off('다음 페이지');
  });

  it('비활성 이전·다음은 클릭·Enter·Space 모두 onChange 를 부르지 않는다', async () => {
    const onChange = vi.fn();
    render(<Pagination total={10} pageSize={5} currentPage={1} onChange={onChange} />);
    const prev = screen.getByRole('button', { name: '이전 페이지' });
    await userEvent.click(prev);
    prev.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('한 페이지로 다 들어가면(0개·계산 불가 값 포함) 페이지 줄을 그리지 않는다', () => {
    const { rerender } = render(
      <Pagination total={0} pageSize={5} currentPage={1} onChange={vi.fn()} />
    );
    expect(screen.queryByRole('navigation')).toBeNull();
    rerender(<Pagination total={5} pageSize={5} currentPage={1} onChange={vi.fn()} />);
    expect(screen.queryByRole('navigation')).toBeNull();
    rerender(<Pagination total={10} pageSize={0} currentPage={1} onChange={vi.fn()} />);
    expect(screen.queryByRole('navigation')).toBeNull();
    rerender(<Pagination total={Number.NaN} pageSize={5} currentPage={1} onChange={vi.fn()} />);
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('키보드로 마지막 쪽에 닿아도 포커스가 «다음» 버튼에 남는다', async () => {
    render(<Harness total={10} />);
    const next = screen.getByRole('button', { name: '다음 페이지' });
    next.focus();
    await userEvent.keyboard('{Enter}');
    expect(next).toHaveAttribute('aria-disabled', 'true');
    expect(next).toHaveFocus();
  });

  it('스스로 onChange 를 부르지 않는다 — 사용자가 누를 때만', () => {
    const onChange = vi.fn();
    render(<Pagination total={50} pageSize={5} currentPage={2} onChange={onChange} />);
    current('2');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('부모가 이동을 무시하면 화면낭독기도 아무것도 읽지 않는다', async () => {
    render(<Pagination total={50} pageSize={5} currentPage={3} onChange={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: '뒤쪽 페이지로 건너뛰기' }));
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('부모가 늦게 반영해도(전환·비동기) 사라진 버튼 대신 새 쪽 번호로 포커스를 옮긴다', async () => {
    function Late() {
      const [page, setPage] = useState(3);
      return (
        <Pagination
          total={50}
          pageSize={5}
          currentPage={page}
          onChange={p => setTimeout(() => setPage(p), 30)}
        />
      );
    }
    render(<Late />);
    screen.getByRole('button', { name: '뒤쪽 페이지로 건너뛰기' }).focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('button', { name: '8' })).toHaveFocus());
  });

  it('목록 주인과 함께: 항목이 줄면 마지막 쪽으로, 다시 늘어도 옛 쪽으로 튀지 않는다', async () => {
    const { rerender } = render(<Harness total={25} />);
    await userEvent.click(screen.getByRole('button', { name: '5' }));
    current('5');
    rerender(<Harness total={10} />);
    current('2');
    rerender(<Harness total={25} />);
    current('2');
  });

  it('건너뛰기로 생략부호가 사라져도 포커스는 새로 고른 쪽 번호로 간다', async () => {
    render(<Harness total={50} />); // 10쪽
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    screen.getByRole('button', { name: '뒤쪽 페이지로 건너뛰기' }).focus();
    await userEvent.keyboard('{Enter}'); // 3 → 8, 뒤쪽 생략부호는 사라진다(8 다음은 9·10 뿐)
    current('8');
    expect(screen.queryByRole('button', { name: '뒤쪽 페이지로 건너뛰기' })).toBeNull();
    await waitFor(() => expect(screen.getByRole('button', { name: '8' })).toHaveFocus());
  });

  it('사용자가 쪽을 넘길 때만 화면낭독기에 알린다(처음·데이터 갱신 때는 조용히)', async () => {
    const { rerender } = render(<Harness total={20} />);
    expect(screen.getByRole('status')).toHaveTextContent('');
    rerender(<Harness total={30} />); // 데이터만 늘어남 — 알리지 않는다
    expect(screen.getByRole('status')).toHaveTextContent('');
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(screen.getByRole('status')).toHaveTextContent('전체 6페이지 중 3페이지');
  });

  it('지금 쪽 번호를 다시 누르면 아무 일도 없다', async () => {
    const onChange = vi.fn();
    render(<Pagination total={20} pageSize={5} currentPage={2} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('포커스를 옮길 때 화면을 스크롤하지 않는다(목록 위로 올려 준 위치를 되돌리지 않게)', async () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    render(<Harness total={50} />);
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    screen.getByRole('button', { name: '뒤쪽 페이지로 건너뛰기' }).focus();
    focus.mockClear();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(focus).toHaveBeenCalledWith({ preventScroll: true }));
    focus.mockRestore();
  });

  it('누른 버튼이 그대로 있으면 포커스를 건드리지 않는다(Safari 처럼 클릭이 포커스를 안 줘도)', async () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    render(<Harness total={50} />);
    fireEvent.click(screen.getByRole('button', { name: '2' })); // 포커스 없이 클릭만
    current('2');
    await new Promise(r => requestAnimationFrame(() => r(null)));
    expect(focus).not.toHaveBeenCalled();
    focus.mockRestore();
  });

  it('부모가 onChange 를 무시해도 나중에 포커스를 끌어오지 않는다', async () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    const { rerender } = render(
      <Pagination total={50} pageSize={5} currentPage={3} onChange={() => {}} />
    );
    screen.getByRole('button', { name: '뒤쪽 페이지로 건너뛰기' }).focus();
    focus.mockClear();
    await userEvent.keyboard('{Enter}'); // 부모가 무시 — 쪽 그대로
    await new Promise(r => requestAnimationFrame(() => r(null)));
    rerender(<Pagination total={50} pageSize={5} currentPage={9} onChange={() => {}} />); // 나중에 다른 이유로 바뀜
    await new Promise(r => requestAnimationFrame(() => r(null)));
    expect(focus).not.toHaveBeenCalled();
    focus.mockRestore();
  });

  it('무시된 이동 요청은 오래 남지 않는다 — 나중에 다른 이유로 그 쪽이 돼도 포커스를 끌어오지 않는다', async () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    const now = vi.spyOn(Date, 'now');
    const { rerender } = render(
      <Pagination total={50} pageSize={5} currentPage={3} onChange={() => {}} />
    );
    screen.getByRole('button', { name: '뒤쪽 페이지로 건너뛰기' }).focus();
    now.mockReturnValue(10_000);
    await userEvent.keyboard('{Enter}'); // 8 을 요청했지만 부모가 무시
    focus.mockClear();
    now.mockReturnValue(11_100); // 1.1초 뒤
    rerender(<Pagination total={50} pageSize={5} currentPage={8} onChange={() => {}} />);
    expect(focus).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('');
    focus.mockRestore();
    now.mockRestore();
  });

  it('목록이 줄어 쪽이 저절로 당겨질 때는 읽지 않는다(사용자가 넘긴 것이 아니므로)', async () => {
    const { rerender } = render(<Harness total={50} />);
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(screen.getByRole('status')).toHaveTextContent('전체 10페이지 중 3페이지');
    rerender(<Harness total={10} />); // 3 → 2 로 당겨짐
    current('2');
    expect(screen.getByRole('status')).toHaveTextContent('전체 10페이지 중 3페이지');
  });
});

describe('pagination 기본 부품', () => {
  it('aria-disabled 인 이전·다음은 부품 스스로 클릭을 무시한다(호출부 가드 없이도)', async () => {
    const onClick = vi.fn();
    render(<PaginationNext aria-disabled onClick={onClick} />);
    await userEvent.click(screen.getByRole('button', { name: '다음 페이지' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('건너뛰기 버튼은 라벨을 안 줘도 기본 이름이 있다', () => {
    render(<PaginationJump onClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: '페이지 건너뛰기' })).toBeInTheDocument();
  });

  it('비활성이면 클릭 말고 다른 이벤트(onKeyDown 등)도 실행하지 않는다', async () => {
    const onKeyDown = vi.fn();
    render(<PaginationNext aria-disabled onKeyDown={onKeyDown} />);
    screen.getByRole('button', { name: '다음 페이지' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(onKeyDown).not.toHaveBeenCalled();
  });
});
