/**
 * 이 탭에서 이동하는 보통 클릭인지 — 보조 키 없이 누른 왼쪽 버튼.
 * Cmd·Ctrl·Shift·Alt 나 가운데 버튼은 새 탭·새 창으로 여는 클릭이라, «이 탭에서 다음 화면으로 넘어간다» 를
 * 전제로 한 표시(재생 요청·돌아올 자리 등)를 남기면 안 된다.
 */
export const isPlainClick = (e: {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}): boolean => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
