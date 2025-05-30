interface Info {
  [key: string]: {
    label: string;
    value: string;
  };
}

const info: Info = {
  chief: {
    label: '담임목사',
    value: '이요셉',
  },
  phone: {
    label: 'Tel',
    value: '02-2245-5840',
  },
  email: {
    label: 'E-mail',
    value: 'sungbok1979@naver.com',
  },
  address: {
    label: '주소',
    value: '서울시 동대문구 장안벚꽃로 139',
  },
};

export const Footer = () => {
  return (
    <footer className="flex h-110 flex-col items-center justify-end gap-20 bg-black px-10 py-10 font-bold whitespace-nowrap text-white">
      <div className={'flex flex-col items-center'}>
        <h3 className={'mb-10 text-3xl sm:text-5xl'}>성복교회</h3>

        <ul className={'flex flex-wrap justify-center gap-x-10 gap-y-2 sm:gap-y-4'}>
          {Object.entries(info).map(([key, row]) => (
            <li className={'flex gap-2 text-lg'} key={key}>
              <span>{row.label}</span>
              <span className={'opacity-50'}>{row.value}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={'flex flex-col items-center gap-2'}>
        <div className={'text-lg'}>개인정보처리방침</div>

        <p className="text-sm opacity-50">
          Copyright <span className={'text-lg'}>성복교회</span> All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};
