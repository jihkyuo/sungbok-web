import PlaylistPagination from '@/domains/worship-video/components/widgets/PlaylistPagination';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '주일예배 | 성복교회' };
// 페이지는 10분마다 다시 만든다. 유튜브 응답은 Data Cache 1시간이라 다시 만들어도 쿼터를 더 쓰지 않는다 —
// 페이지와 데이터를 둘 다 1시간으로 두면 두 시계가 엇갈려 새 재생목록이 최대 약 2시간 늦게 보인다(지금은 약 1시간 10분).
// 열어 둔 페이지는 자동 갱신하지 않는다 — 유튜브 쿼터를 아끼고, 다른 페이지에 갔다 오면 최신으로 보인다.
export const revalidate = 600;

// 구 /worship-video 의 실제 유튜브 재생목록(재생 가능)을 그대로 둔다 — 옛 주소와 홈 설교 링크가 여기로 온다.
// 디자인한 아카이브(domains/worship/SermonArchive)는 B 단계에서 이 데이터를 붙여 교체한다.
export default function Page() {
  return <PlaylistPagination />;
}
