import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ResponsiveList } from './responsive-list';

type Row = { id: string; title: string; date: string };
const items: Row[] = [
  { id: '1', title: '11월 2일 주보', date: '2026-11-02' },
  { id: '2', title: '11월 9일 주보', date: '2026-11-09' },
];

describe('ResponsiveList', () => {
  it('renders a table (md+) and a card list (mobile) from the same items', () => {
    render(
      <ResponsiveList
        items={items}
        getKey={r => r.id}
        columns={[
          { key: 'title', header: '제목', cell: r => r.title },
          { key: 'date', header: '날짜', cell: r => r.date },
        ]}
        card={r => <span>{`카드 ${r.title}`}</span>}
      />
    );
    const table = screen.getByRole('table');
    expect(within(table).getByRole('columnheader', { name: '제목' })).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(3);
    const list = screen.getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(within(list).getByText('카드 11월 9일 주보')).toBeInTheDocument();
  });
});
