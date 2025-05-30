'use client';

import { HomeLogo } from '@/shared/components/layout/Header/HomeLogo';
import { NavigationMenu } from '@/shared/components/layout/Header/NavigationMenu';
import { SideMenu } from '@/shared/components/layout/Header/SideMenu';
import { useIsScrolled } from '@/shared/lib/hooks/useIsScrolled';
import { cn } from '@/shared/lib/utils';

export const Header = () => {
  const { isScrolled } = useIsScrolled();

  return (
    <header
      style={{ backdropFilter: isScrolled ? 'blur(4px)' : 'none' }}
      className={cn(
        'fixed top-0 right-0 left-0 z-50 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-30 py-6 text-white transition-all duration-800',
        {
          'bg-[rgba(0,0,0,0.4)]': isScrolled,
        }
      )}
    >
      <HomeLogo />

      <div className="flex items-center gap-10">
        <NavigationMenu />
        <SideMenu />
      </div>
    </header>
  );
};
