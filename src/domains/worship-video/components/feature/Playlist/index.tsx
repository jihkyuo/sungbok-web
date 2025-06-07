'use client';

import { useYoutubePagination } from '@/domains/worship-video/components/feature/hooks/useYoutubePagination';
import { PaginationList } from '@/shared/components/features/Pagination/PaginationList';
import Image from 'next/image';
import { useState } from 'react';

// TODO
// 페이지네이션 번호별 api 호출 방법 알아내기(2번째 페이지 호출~3번째 ... 등)
// 그리드 레이아웃 깔끔하게 개선
// api 응답으로 영상 재생 방법 알아내기
// 그리드 제목 표시 방법 강구(디자인)

interface Props {
  playlistId: string;
}

export const Playlist = ({ playlistId }: Props) => {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { firstData, getPage } = useYoutubePagination({ playlistId, pageSize });

  return (
    <div className={'p-10'}>
      <PaginationList
        items={
          getPage(page).map((item, idx) => ({
            key: item.id ?? idx,
            thumbnail: (
              <Image
                className="rounded-lg object-cover"
                src={item.snippet?.thumbnails?.high?.url ?? ''}
                alt={item.snippet?.title ?? ''}
                width={320}
                height={180}
                style={{ width: '100%', height: 'auto' }}
              />
            ),
            title: <div className="line-clamp-1 text-sm font-medium">{item.snippet?.title}</div>,
          })) ?? []
        }
        pagination={{
          total: firstData.pageInfo?.totalResults ?? 0,
          currentPage: page,
          pageSize: pageSize,
          onChange: setPage,
        }}
      />
    </div>
  );
};
