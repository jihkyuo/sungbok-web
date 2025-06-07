import {
  Pagination,
  type PaginationProps,
} from '@/shared/components/features/Pagination/Pagination';
import {
  PaginationGrid,
  type PaginationGridProps,
} from '@/shared/components/features/Pagination/PaginationGrid';

interface PaginationListProps extends PaginationGridProps {
  pagination: PaginationProps;
}

export const PaginationList = ({ pagination, ...props }: PaginationListProps) => {
  return (
    <div>
      <PaginationGrid {...props} />
      <Pagination {...pagination} />
    </div>
  );
};
