/**
 * 실데이터 연결 전 화면에 보이는 값이 예시임을 밝히는 한 줄.
 * 사실 진술 원칙 — 지어낸 시간·장소·날짜가 사실처럼 읽히지 않게 한다. 데이터가 연결되면 제거.
 */
export const SampleNotice = ({ what }: { what: string }) => (
  <p className="border-b1-border text-b1-sub mb-8 inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-1.5 text-[14px]">
    <span className="bg-b1-sub inline-block h-1.5 w-1.5 rounded-full" />
    {what}은 디자인 확인용 예시입니다. 실제 자료 연결 전입니다.
  </p>
);
