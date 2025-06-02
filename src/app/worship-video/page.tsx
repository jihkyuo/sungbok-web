import { lazy, Suspense } from 'react';

const PlaylistPagination = lazy(
  () => import('@/domains/worship-video/components/widgets/PlaylistPagination')
);

export default function WorshipVideoPage() {
  return (
    <div>
      <div className={'h-60'} />
      <Suspense fallback={<div>Loading...</div>}>
        <PlaylistPagination />
      </Suspense>
    </div>
  );
}
