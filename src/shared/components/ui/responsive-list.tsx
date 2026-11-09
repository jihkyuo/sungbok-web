import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

export type ResponsiveListColumn<T> = {
  key: string;
  header: string;
  cell: (item: T) => ReactNode;
};

type ResponsiveListProps<T> = {
  items: T[];
  columns: ResponsiveListColumn<T>[];
  /** 휴대폰(md 미만)에서 한 항목을 그리는 카드 */
  card: (item: T) => ReactNode;
  getKey: (item: T) => string;
  className?: string;
};

/**
 * 관리자 목록의 기본 틀 — md 이상은 표, 그 아래는 카드 목록.
 * 둘 다 렌더하고 CSS 로 바꾼다(폭을 JS 로 재지 않아 첫 렌더부터 맞는 쪽이 보인다).
 */
export function ResponsiveList<T>({ items, columns, card, getKey, className }: ResponsiveListProps<T>) {
  return (
    <div data-slot="responsive-list" className={className}>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(c => (
                <TableHead key={c.key}>{c.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow key={getKey(item)}>
                {columns.map(c => (
                  <TableCell key={c.key}>{c.cell(item)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ul className={cn('m-0 flex list-none flex-col gap-3 p-0 md:hidden')}>
        {items.map(item => (
          <li key={getKey(item)}>{card(item)}</li>
        ))}
      </ul>
    </div>
  );
}
