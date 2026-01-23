'use client';

import menuWhiteIcon from '@/assets/icons/menu-white.svg';
import { menuItems } from '@/shared/components/layout/Header/NavigationMenu';
import { cn } from '@/shared/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { createPortal } from 'react-dom';

export const SideMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  // 링크 클릭 시 메뉴 닫기
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const sideMenuContent = (
    <>
      {/* 오버레이 */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 z-[60] md:hidden transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* 사이드 메뉴 패널 */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-64 bg-black/95 backdrop-blur-md z-[70] md:hidden transition-transform duration-300 ease-in-out shadow-2xl',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">메뉴</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-300 transition-colors"
              aria-label="메뉴 닫기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 메뉴 항목들 */}
          <nav className="flex-1 overflow-y-auto py-6">
            <ul className="flex flex-col">
              {menuItems.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className="block px-6 py-4 text-lg font-bold text-white hover:bg-white/10 transition-colors"
                  >
                    {item.children}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
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

      {typeof window !== 'undefined' && createPortal(sideMenuContent, document.body)}
    </>
  );
};
