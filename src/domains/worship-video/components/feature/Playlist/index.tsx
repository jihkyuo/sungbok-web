'use client';

import { worshipVideoQueryKeys } from '@/domains/worship-video/api/queryKeys';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/components/ui/pagination';
import { useSuspenseQuery } from '@tanstack/react-query';

interface Props {
  playlistId: string;
}

export const Playlist = ({ playlistId }: Props) => {
  console.log(playlistId);
  const { data } = useSuspenseQuery(worshipVideoQueryKeys.playlist.byId({ id: [playlistId] }));
  console.log(data);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
