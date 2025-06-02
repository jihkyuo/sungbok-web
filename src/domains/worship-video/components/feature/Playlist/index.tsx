'use client';

import { worshipVideoQueryKeys } from '@/domains/worship-video/api/queryKeys';
import { Pagination } from '@/shared/components/features/Pagination';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface Props {
  playlistId: string;
}

export const Playlist = ({ playlistId }: Props) => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data } = useSuspenseQuery(
    worshipVideoQueryKeys.playlist.byId({ playlistId: playlistId, maxResults: pageSize })
  );
  console.log(data);

  return (
    <Pagination
      total={data.pageInfo?.totalResults ?? 0}
      currentPage={page}
      pageSize={pageSize}
      onChange={setPage}
    />
  );
};
