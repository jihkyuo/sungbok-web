import { HomeLogo } from '@/shared/components/layout/Header/HomeLogo';
import { NavigationMenu } from '@/shared/components/layout/Header/NavigationMenu';
import { SideMenu } from '@/shared/components/layout/Header/SideMenu';
import { ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';

export const Header = () => {
  return (
    <header className="bg-b1-bg border-b-b1-border sticky top-0 right-0 left-0 z-50 border-b">
      <div className="flex items-center justify-between gap-6 px-5 py-4 md:px-10 md:py-[18px]">
        <HomeLogo />

        <NavigationMenu />

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="검색"
            className="text-b1-sub hover:bg-b1-text/[0.04] flex items-center justify-center rounded-md p-2 transition-colors"
          >
            <Search size={18} strokeWidth={1.6} />
          </button>

          <Link
            href="/about"
            className="bg-b1-accent text-b1-bg hidden items-center gap-2 rounded-full px-[18px] py-2.5 text-[13px] font-semibold transition-all duration-300 ease-out hover:opacity-90 active:scale-[0.97] md:inline-flex"
          >
            처음 오셨나요?
            <ArrowRight size={13} strokeWidth={2} />
          </Link>

          <SideMenu />
        </div>
      </div>
    </header>
  );
};
