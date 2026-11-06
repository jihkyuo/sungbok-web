import PlaylistPagination from '@/domains/worship-video/components/widgets/PlaylistPagination';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '주일예배 | 성복교회' };

// 구 /worship-video 의 실제 유튜브 재생목록(재생 가능)을 그대로 둔다 — 옛 주소와 홈 설교 링크가 여기로 온다.
// 디자인한 아카이브(domains/worship/SermonArchive)는 B 단계에서 이 데이터를 붙여 교체한다.
export default function Page() {
  return <PlaylistPagination />;
}
