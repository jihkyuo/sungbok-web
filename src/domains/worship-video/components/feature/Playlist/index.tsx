'use client';

import { worshipVideoQueryKeys } from '@/domains/worship-video/api/queryKeys';
import { Pagination } from '@/shared/components/features/Pagination';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface Props {
  playlistId: string;
}

export const Playlist = ({ playlistId }: Props) => {
  const limit = 5;
  const { data } = useSuspenseQuery(
    worshipVideoQueryKeys.playlist.byId({ id: [playlistId], maxResults: limit })
  );
  console.log(data);

  const [page, setPage] = useState(1);

  return <Pagination total={100} currentPage={page} pageSize={limit} onChange={setPage} />;
};
