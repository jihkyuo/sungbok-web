'use client';

import { renderPageNumbers } from '@/shared/components/features/Pagination/renderPageNumbers';
import * as OriginPagination from '@/shared/components/ui/pagination';
import { useEffect, useState } from 'react';

const DEFAULT_PAGE_SIZE = 5;

interface Props {
  total: number;
  currentPage?: number;
  pageSize?: number;
  onChange?: (page: number) => void;
}

export const Pagination = ({
  total,
  currentPage,
  pageSize = DEFAULT_PAGE_SIZE,
  onChange,
}: Props) => {
  const [page, setPage] = useState(currentPage ?? 1);
  const totalPageCount = Math.ceil(total / pageSize);

  useEffect(() => {
    if (currentPage !== undefined) {
      setPage(currentPage);
    }
  }, [currentPage]);

  const navToPage = (page: number) => {
    if (currentPage === undefined) {
      setPage(page);
    }
    onChange?.(page);
  };

  return (
    <OriginPagination.Pagination>
      <OriginPagination.PaginationContent>
        <OriginPagination.PaginationItem>
          <OriginPagination.PaginationPrevious
            onClick={() => navToPage(Math.max(page - 1, 1))}
            aria-disabled={page === 1}
            tabIndex={page === 1 ? -1 : undefined}
            className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </OriginPagination.PaginationItem>

        {renderPageNumbers({ totalPageCount, page, navToPage })}

        <OriginPagination.PaginationItem>
          <OriginPagination.PaginationNext
            onClick={() => navToPage(Math.min(page + 1, totalPageCount))}
            aria-disabled={page === totalPageCount}
            tabIndex={page === totalPageCount ? -1 : undefined}
            className={
              page === totalPageCount ? 'pointer-events-none opacity-50' : 'cursor-pointer'
            }
          />
        </OriginPagination.PaginationItem>
      </OriginPagination.PaginationContent>
    </OriginPagination.Pagination>
  );
};
