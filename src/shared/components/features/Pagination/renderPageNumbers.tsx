import * as OriginPagination from '@/shared/components/ui/pagination';
import { ReactNode } from 'react';

interface Props {
  totalPageCount: number;
  page: number;
  navToPage: (page: number) => void;
}

export const renderPageNumbers = ({ totalPageCount, page, navToPage }: Props) => {
  const items: ReactNode[] = [];
  const maxVisiblePages = 5;

  if (totalPageCount <= maxVisiblePages) {
    for (let i = 1; i <= totalPageCount; i++) {
      items.push(
        <OriginPagination.PaginationItem key={i}>
          <OriginPagination.PaginationLink onClick={() => navToPage(i)} isActive={page === i}>
            {i}
          </OriginPagination.PaginationLink>
        </OriginPagination.PaginationItem>
      );
    }
  } else {
    items.push(
      <OriginPagination.PaginationItem key={1}>
        <OriginPagination.PaginationLink onClick={() => navToPage(1)} isActive={page === 1}>
          1
        </OriginPagination.PaginationLink>
      </OriginPagination.PaginationItem>
    );

    if (page > 4) {
      items.push(
        <OriginPagination.PaginationItem key="ellipsis-start">
          <OriginPagination.PaginationEllipsis
            onClick={() => navToPage(Math.max(page - maxVisiblePages, 2))}
            className={'cursor-pointer rounded-md hover:bg-gray-100 hover:text-blue-600'}
          />
        </OriginPagination.PaginationItem>
      );
    }

    const start = Math.max(2, page - 2);
    const end = Math.min(totalPageCount - 1, page + 2);

    for (let i = start; i <= end; i++) {
      items.push(
        <OriginPagination.PaginationItem key={i}>
          <OriginPagination.PaginationLink onClick={() => navToPage(i)} isActive={page === i}>
            {i}
          </OriginPagination.PaginationLink>
        </OriginPagination.PaginationItem>
      );
    }

    if (page < totalPageCount - 3) {
      items.push(
        <OriginPagination.PaginationItem key="ellipsis-end">
          <OriginPagination.PaginationEllipsis
            onClick={() => navToPage(Math.min(page + maxVisiblePages, totalPageCount - 1))}
            className={'cursor-pointer rounded-md hover:bg-gray-100 hover:text-blue-600'}
          />
        </OriginPagination.PaginationItem>
      );
    }

    items.push(
      <OriginPagination.PaginationItem key={totalPageCount}>
        <OriginPagination.PaginationLink
          onClick={() => navToPage(totalPageCount)}
          isActive={page === totalPageCount}
        >
          {totalPageCount}
        </OriginPagination.PaginationLink>
      </OriginPagination.PaginationItem>
    );
  }

  return items;
};
