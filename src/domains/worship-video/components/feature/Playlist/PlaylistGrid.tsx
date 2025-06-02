import type { PlaylistResponseDto } from '@/domains/worship-video/api/dto/response.dto';

interface Props {
  items: PlaylistResponseDto['items'];
}

// TODO
// 페이지네이션 번호별 api 호출 방법 알아내기(2번째 페이지 호출~3번째 ... 등)
// 그리드 레이아웃 깔끔하게 개선
// api 응답으로 영상 재생 방법 알아내기
// 그리드 제목 표시 방법 강구(디자인)

export const PlaylistGrid = ({ items = [] }: Props) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {items.map(item => (
        <div key={item.id}>
          <img
            src={item.snippet?.thumbnails?.high?.url}
            alt={item.snippet?.title}
            className="h-full w-full object-cover"
          />
          {item.snippet?.title}
        </div>
      ))}
    </div>
  );
};
