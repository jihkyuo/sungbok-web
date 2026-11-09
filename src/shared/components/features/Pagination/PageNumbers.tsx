import * as OriginPagination from '@/shared/components/ui/pagination';
import { ReactNode } from 'react';

interface Props {
  totalPageCount: number;
  page: number;
  navToPage: (page: number) => void;
}

const MAX_VISIBLE = 5;
const JUMP = 5;

/**
 * 쪽 번호 줄 — 1 … (현재 ±2) … 끝. 생략부호는 누르면 5쪽씩 건너뛴다.
 * 생략부호가 한 쪽만 가리게 되면(예: 1 … 3) 생략부호 대신 그 쪽 번호를 보인다 — 같은 자리를 차지하면서 한 쪽만 건너뛰는 건 헷갈린다.
 */
export const PageNumbers = ({ totalPageCount, page, navToPage }: Props) => {
  const link = (i: number) => (
    <OriginPagination.PaginationItem key={i}>
      <OriginPagination.PaginationLink onClick={() => navToPage(i)} isActive={page === i}>
        {i}
      </OriginPagination.PaginationLink>
    </OriginPagination.PaginationItem>
  );

  if (totalPageCount <= MAX_VISIBLE) {
    return <>{Array.from({ length: totalPageCount }, (_, k) => link(k + 1))}</>;
  }

  let start = Math.max(2, page - 2);
  let end = Math.min(totalPageCount - 1, page + 2);
  if (start === 3) start = 2;
  if (end === totalPageCount - 2) end = totalPageCount - 1;

  const items: ReactNode[] = [link(1)];
  if (start > 2) {
    items.push(
      <OriginPagination.PaginationItem key="ellipsis-start">
        <OriginPagination.PaginationJump
          onClick={() => navToPage(Math.max(page - JUMP, 2))}
          aria-label="앞쪽 페이지로 건너뛰기"
        />
      </OriginPagination.PaginationItem>
    );
  }
  for (let i = start; i <= end; i++) items.push(link(i));
  if (end < totalPageCount - 1) {
    items.push(
      <OriginPagination.PaginationItem key="ellipsis-end">
        <OriginPagination.PaginationJump
          onClick={() => navToPage(Math.min(page + JUMP, totalPageCount - 1))}
          aria-label="뒤쪽 페이지로 건너뛰기"
        />
      </OriginPagination.PaginationItem>
    );
  }
  items.push(link(totalPageCount));
  return <>{items}</>;
};
