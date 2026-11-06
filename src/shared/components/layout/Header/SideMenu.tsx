'use client';

import menuIcon from '@/assets/icons/menu-black.svg';
import { sectionHref, siteNav } from '@/shared/config/siteNav';
import { cn } from '@/shared/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export const SideMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 클라이언트에서만 마운트되었는지 확인
  useEffect(() => {
    setMounted(true);
  }, []);

  // 링크 클릭 시 메뉴 닫기
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const sideMenuContent = (
    <>
      {/* 오버레이 */}
      <div
        className={cn(
          'fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* 사이드 메뉴 패널 */}
      <div
        className={cn(
          'fixed top-0 right-0 z-[70] h-full w-full bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-5">
            <h2 className="text-xl font-bold text-gray-900">메뉴</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
              aria-label="메뉴 닫기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 메뉴 항목들 */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="flex flex-col">
              {siteNav.map((item, index) => (
                <li key={item.slug}>
                  <Link
                    href={sectionHref(item)}
                    onClick={handleLinkClick}
                    className="block border-l-4 border-transparent px-6 py-4 text-base font-semibold text-gray-800 transition-all duration-200 hover:border-gray-900 hover:bg-gray-100 hover:text-gray-900"
                  >
                    {item.label}
                  </Link>
                  {index < siteNav.length - 1 && <div className="mx-6 border-b border-gray-100" />}
                </li>
              ))}
            </ul>
          </nav>

          {/* 하단 여백 */}
          <div className="h-4" />
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="-mr-[11px] flex size-11 cursor-pointer items-center justify-center lg:hidden"
        aria-label="메뉴 열기"
      >
        <Image src={menuIcon} alt="menu" width={22} height={22} />
      </button>

      {mounted && createPortal(sideMenuContent, document.body)}
    </>
  );
};
