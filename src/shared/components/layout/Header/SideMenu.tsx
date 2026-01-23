'use client';

import menuWhiteIcon from '@/assets/icons/menu-white.svg';
import { menuItems } from '@/shared/components/layout/Header/NavigationMenu';
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
          'fixed inset-0 bg-black/40 z-[60] md:hidden transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* 사이드 메뉴 패널 */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full bg-white z-[70] md:hidden transition-transform duration-300 ease-in-out shadow-2xl',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">메뉴</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-900"
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
              {menuItems.map((item, index) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className="block px-6 py-4 text-base font-semibold text-gray-800 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 border-l-4 border-transparent hover:border-gray-900"
                  >
                    {item.children}
                  </Link>
                  {index < menuItems.length - 1 && (
                    <div className="mx-6 border-b border-gray-100" />
                  )}
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
        className="cursor-pointer md:hidden"
        aria-label="메뉴 열기"
      >
        <Image src={menuWhiteIcon} alt="menu" width={24} height={24} />
      </button>

      {mounted && createPortal(sideMenuContent, document.body)}
    </>
  );
};
