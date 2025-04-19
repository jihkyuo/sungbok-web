import {
  Table as OriginTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface TableOptions {
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableColumn<TDataSource> {
  title: React.ReactNode;
  row: (data: TDataSource) => React.ReactNode;
  columnOptions?: TableOptions;
  rowOptions?: TableOptions;
}

interface TableProps<TDataSource> {
  dataSource: TDataSource[];
  columns: TableColumn<TDataSource>[];
  rowKey: (data: TDataSource) => string;
  rowsOptions?: TableOptions;
  columnsOptions?: TableOptions;
  className?: string;
}

export const Table = <TDataSource,>({
  dataSource,
  columns,
  rowKey,
  rowsOptions,
  columnsOptions,
  className,
}: TableProps<TDataSource>) => {
  return (
    <OriginTable className={className}>
      <TableHeader>
        <TableRow>
          {columns.map((column, idx) => (
            <TableHead
              className={cn(
                columnsOptions?.className,
                column.columnOptions?.className,
                column.columnOptions?.align === 'center' && 'text-center',
                column.columnOptions?.align === 'right' && 'text-right'
              )}
              key={idx}
            >
              {column.title}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {dataSource.map(data => (
          <TableRow key={rowKey(data)}>
            {columns.map((column, idx) => (
              <TableCell
                className={cn(
                  rowsOptions?.className,
                  column.rowOptions?.className,
                  column.rowOptions?.align === 'center' && 'text-center',
                  column.rowOptions?.align === 'right' && 'text-right'
                )}
                key={`${rowKey(data)}-${idx}`}
              >
                {column.row(data)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </OriginTable>
  );
};
