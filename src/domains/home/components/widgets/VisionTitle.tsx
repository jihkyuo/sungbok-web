'use client';

import { useEffect, useState } from 'react';

export const VisionTitle = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const visions = [
    '삶에 기쁨과 소망을 주는 교회',
    '능력과 말씀과 은혜가 넘치는 교회',
    '하나님의 사랑을 실천하는 교회',
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#f9fafb] via-white to-[#f9fafb] py-60 text-center">
      {/* 배경 장식 요소 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-blue-500 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-purple-500 blur-3xl" />
      </div>

      <div className="relative z-10">
        {visions.map((vision, index) => (
          <h2
            key={index}
            className={`mb-6 text-3xl leading-relaxed font-bold tracking-wide text-gray-800 transition-all duration-1000 sm:text-4xl md:text-5xl ${
              isVisible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-10 opacity-0'
            }`}
            style={{
              transitionDelay: `${index * 200}ms`,
            }}
          >
            {vision}
          </h2>
        ))}
      </div>
    </div>
  );
};
