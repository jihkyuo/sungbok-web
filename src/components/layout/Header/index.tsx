'use client';

import { HomeLogo } from '@/components/layout/Header/HomeLogo';
import { NavigationMenu } from '@/components/layout/Header/NavigationMenu';
import { SideMenu } from '@/components/layout/Header/SideMenu';
import { useIsScrolled } from '@/hooks/useIsScrolled';
import { cn } from '@/lib/utils';

export const Header = () => {
  const { isScrolled } = useIsScrolled({ scrollThreshold: 700 });

  return (
    <header
      style={{ backdropFilter: isScrolled ? 'blur(4px)' : 'none' }}
      className={cn(
        'fixed top-0 right-0 left-0 z-50 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-30 py-6 text-white transition-all duration-200',
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
