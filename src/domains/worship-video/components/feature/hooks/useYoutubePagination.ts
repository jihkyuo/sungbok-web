import { worshipVideoQueryKeys } from '@/domains/worship-video/api/queryKeys';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface Props {
  pageSize?: number;
  playlistId: string;
}

export const useYoutubePagination = ({ pageSize = 10, playlistId }: Props) => {
  const queryClient = useQueryClient();
  const [playlistPages, setPlaylistPages] = useState<{
    [page: number]: gapi.client.youtube.PlaylistItem[];
  }>({});
  const { data, isFetched } = useSuspenseQuery(
    worshipVideoQueryKeys.playlist.byId({ playlistId: playlistId, maxResults: pageSize })
  );

  const collectPage = (page: number, items: gapi.client.youtube.PlaylistItem[]) => {
    setPlaylistPages(prev => ({
      ...prev,
      [page]: items,
    }));
  };

  const recursiveRequest = async (currentPage: number, pageToken?: string) => {
    const response = await queryClient.fetchQuery(
      worshipVideoQueryKeys.playlist.byId({
        playlistId: playlistId,
        maxResults: pageSize,
        pageToken,
      })
    );
    collectPage(currentPage, response.items ?? []);
    if (response.nextPageToken) {
      await recursiveRequest(currentPage + 1, response.nextPageToken);
    }
  };

  useEffect(() => {
    if (!isFetched) return;

    collectPage(1, data.items ?? []);
    if (data.nextPageToken) {
      recursiveRequest(2, data.nextPageToken);
    }
  }, [isFetched]);

  const getPage = (page: number) => {
    if (playlistPages[page]) {
      return playlistPages[page];
    }
    return [];
  };

  return { firstData: data, playlistPages, getPage };
};
