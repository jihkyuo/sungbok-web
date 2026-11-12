import SermonLibrary from '@/domains/worship-video/components/widgets/SermonLibrary';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '주일예배 | 성복교회' };
// 페이지는 10분마다 다시 만든다. 유튜브 응답은 Data Cache 1시간이라 다시 만들어도 쿼터를 더 쓰지 않는다 —
// 페이지와 데이터를 둘 다 1시간으로 두면 두 시계가 엇갈려 새 영상이 최대 약 2시간 늦게 보인다(지금은 약 1시간 10분).
// 열어 둔 페이지는 자동 갱신하지 않는다 — 유튜브 쿼터를 아끼고, 다른 페이지에 갔다 오면 최신으로 보인다.
export const revalidate = 600;

// 설교 영상(G안) — 페이지 안 플레이어·설명란·설교 목록·찾기. 영상은 유튜브 «주일 예배 설교» 재생목록에서 온다
// (config/worshipPages). 옛 주소 /worship-video 와 홈 설교 링크가 여기로 온다.
export default function Page() {
  return <SermonLibrary page="sunday" />;
}
