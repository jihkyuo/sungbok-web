export const WorshipTextArea = () => {
  return (
    <div className={'flex flex-col items-center justify-center gap-10 text-center break-keep'}>
      <Title />
      <Subtitle />
    </div>
  );
};

const Title = () => {
  return (
    <div className={'text-5xl leading-15 font-bold tracking-wide'}>
      <h2>우리는</h2>
      <h2 className={'text-blue-600'}>주의 움직이는 교회</h2>
    </div>
  );
};

const Subtitle = () => {
  return (
    <div className="relative text-2xl font-bold whitespace-pre-wrap">
      <span className="absolute top-0 left-0 -translate-x-6 transform font-serif text-4xl text-blue-600">
        &ldquo;
      </span>
      <br />
      <p className="mx-2">
        {`예수께서 가라사대 \n 내가 곧 길이요 진리요 생명이니 \n나로 말미암지 않고는 아버지께로 올 자가
        없느니라 \n`}
      </p>
      <p className="mt-2 text-right text-lg">(요한복음 14:6)</p>
      <br />
      <br />
      <span className="absolute right-0 bottom-0 translate-x-4 transform font-serif text-4xl text-blue-600">
        &rdquo;
      </span>
    </div>
  );
};
