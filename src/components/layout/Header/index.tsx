import { HomeLogo } from '@/components/layout/Header/HomeLogo';
import { NavigationMenu } from '@/components/layout/Header/NavigationMenu';
import { SideMenu } from '@/components/layout/Header/SideMenu';

export const Header = () => {
  return (
    <header
      style={{ backdropFilter: 'blur(4px)' }}
      className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between bg-[rgba(0,0,0,0.4)] px-10 py-4 text-white"
    >
      <HomeLogo />

      <div className="flex items-center gap-10">
        <NavigationMenu />
        <SideMenu />
      </div>
    </header>
  );
};
