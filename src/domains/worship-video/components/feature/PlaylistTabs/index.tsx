'use client';

import { Playlist } from '@/domains/worship-video/components/feature/Playlist';
import { Tabs } from '@/shared/components/features/Tabs';
import type { youtube_v3 } from 'googleapis';
import { Suspense } from 'react';

interface Props {
  playlist: youtube_v3.Schema$PlaylistListResponse;
}

export const PlaylistTabs = ({ playlist }: Props) => {
  const playlistOptions =
    playlist.items?.map(item => {
      const playlistId = item.id ?? '';
      return {
        label: item.snippet?.title ?? '',
        value: playlistId,
        content: (
          <Suspense fallback={<div>Playlist Loading...</div>}>
            <Playlist playlistId={playlistId} />
          </Suspense>
        ),
      };
    }) ?? [];

  return <Tabs options={playlistOptions} />;
};
