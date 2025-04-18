export const WorshipTextArea = () => {
  return (
    <div className={'flex flex-col gap-10 break-keep'}>
      <Title />
      <Subtitle />
    </div>
  );
};

const Title = () => {
  return (
    <div className={'text-2xl font-bold tracking-wide whitespace-pre-wrap'}>
      <h2 className={'text-blue-600'}>예배(말씀,기도, 찬양, 감사)를 통해</h2>
    </div>
  );
};

const Subtitle = () => {
  return (
    <p className="text-xl leading-8 font-bold whitespace-pre-wrap">
      {`건강하게
세워져가고
있습니다.`}
    </p>
  );
};

// 성경구절 스타일
// const Subtitle = () => {
//   return (
//     <div className="relative text-2xl font-bold whitespace-pre-wrap">
//       <span className="absolute top-0 left-0 -translate-x-6 transform font-serif text-4xl text-blue-600">
//         &ldquo;
//       </span>
//       <br />
//       <p className="mx-2">
//         {`예수께서 가라사대 \n 내가 곧 길이요 진리요 생명이니 \n나로 말미암지 않고는 아버지께로 올 자가
//         없느니라 \n`}
//       </p>
//       <p className="mt-2 text-right text-lg">(요한복음 14:6)</p>
//       <br />
//       <br />
//       <span className="absolute right-0 bottom-0 translate-x-4 transform font-serif text-4xl text-blue-600">
//         &rdquo;
//       </span>
//     </div>
//   );
// };
