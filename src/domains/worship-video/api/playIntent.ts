// 설교 링크를 누를 때 다음 화면(설교 한 편 페이지)에 남기는 표시 — 화면 밖(모듈)에 둔다: 설교 페이지는 설교마다
// 새로 만들어지므로(Next 가 주소의 영상 id 로 화면을 가른다) 화면 안의 상태로는 넘겨줄 수 없다.
//
//  · 들어오자마자 재생: 목록·옆 목록·이전/다음에서 눌러 넘어온 설교만 자동재생한다. 주소로 바로 들어온 경우
//    (공유 링크·새로고침)에는 표시가 없어 플레이어가 멈춘 채로 뜬다(누르지 않았는데 소리가 나면 안 된다).
//    설교 페이지는 읽은 뒤 지운다(clearPlay) — 뒤로·앞으로 가기로 다시 들어온 것은 «누른 것» 이 아니다.
//  · 이전/다음 포커스: 누른 버튼은 화면째 사라진다. 어느 쪽을 눌렀는지 남겨 새 화면이 같은 쪽 버튼에
//    키보드 포커스를 되돌려 놓는다(이어서 넘길 수 있게).

let wanted: string | null = null;

/** 이 영상은 설교 페이지에 들어오자마자 재생한다 — 설교 링크를 누를 때 부른다. */
export const requestPlay = (videoId: string) => {
  wanted = videoId;
};

/** 그 영상에 재생 요청이 걸려 있는지. 읽어도 지워지지 않는다(렌더 중 여러 번 읽힌다). */
export const wantsPlay = (videoId: string) => wanted === videoId;

/** 그 영상의 재생 요청을 지운다 — 설교 페이지가 요청을 쓴 뒤에 부른다. 다른 영상의 요청은 건드리지 않는다. */
export const clearPlay = (videoId: string) => {
  if (wanted === videoId) wanted = null;
};

export type StepDirection = 'older' | 'newer';
let stepped: StepDirection | null = null;

/** 이전(older)·다음(newer) 중 어느 쪽을 눌렀는지 남긴다. */
export const requestStepFocus = (dir: StepDirection) => {
  stepped = dir;
};

/** 누른 쪽을 꺼낸다(한 번 꺼내면 지워진다). 이전/다음으로 온 것이 아니면 null. */
export const takeStepFocus = (): StepDirection | null => {
  const dir = stepped;
  stepped = null;
  return dir;
};

/** 전부 지우기 — 테스트용 */
export const clearPlayIntent = () => {
  wanted = null;
  stepped = null;
};
