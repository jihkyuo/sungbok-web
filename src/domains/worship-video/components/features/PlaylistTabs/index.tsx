'use client';

import { usePlaylists } from '@/domains/worship-video/api/usePlaylistVideos';
import { Playlist } from '@/domains/worship-video/components/features/Playlist';
import { QueryStatus } from '@/domains/worship-video/components/features/StatusText';
import { Tabs } from '@/shared/components/features/Tabs';
import { FOCUS_RING } from '@/shared/components/ui/focusRing';
import { cn } from '@/shared/lib/utils';
import { useState } from 'react';

/**
 * 주일예배 재생목록 탭. 서버가 재생목록·첫 탭 영상을 미리 채워 두면(HydrationBoundary) 첫 화면부터 영상이 보이고,
 * 못 채웠으면(빌드 중 실패 등) 화면이 직접 받는다. 다른 탭은 열 때 받는다(Radix 는 고른 탭 내용만 그린다).
 */
export const PlaylistTabs = () => {
  const q = usePlaylists();
  // 사용자가 고른 탭. 재생목록을 다시 받았는데(창 복귀 등) 그 탭이 빠졌으면 고른 것을 비운다(렌더 중 상태 맞추기) —
  // 탭 버튼만 남고 내용이 비지 않게 첫 탭으로 보이고, 그 재생목록이 다시 생겨도 저절로 옛 탭으로 튀지 않는다.
  const [picked, setPicked] = useState<string>();
  if (picked && q.data && !q.data.some(p => p.id === picked)) setPicked(undefined);

  const options = (q.data ?? []).map(({ id, title }) => ({
    label: title,
    value: id,
    content: <Playlist playlistId={id} />,
  }));

  return (
    // 상태 문구와 탭을 같은 상자 안에서 바꿔 끼운다 — «다시 시도» 뒤 포커스가 이 상자에 남아, 불러오는 중이 되든
    // 탭이 나타나든 문서 맨 위로 튀지 않는다.
    // 포커스 링은 키보드로 «다시 시도» 를 눌러 여기로 옮겨졌을 때만 보인다(focus-visible)
    <div
      data-focus-host
      tabIndex={-1}
      className={cn('rounded focus-visible:outline-hidden', FOCUS_RING)}
    >
      {options.length > 0 ? (
        // 처음엔 첫 탭 — 고른 탭이 없으면 영상이 하나도 보이지 않는다.
        <Tabs options={options} value={picked ?? options[0].value} onValueChange={setPicked} />
      ) : (
        // 알림 영역은 불러오는 중 ↔ 실패 ↔ 없음 사이에서 그대로 남는다 — 화면낭독기가 바뀐 문구를 읽게.
        <QueryStatus query={q} empty="아직 등록된 영상 재생목록이 없습니다." />
      )}
    </div>
  );
};
