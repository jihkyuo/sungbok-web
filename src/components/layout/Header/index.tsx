import { HomeLogo } from '@/components/layout/Header/HomeLogo';
import { NavigationMenu } from '@/components/layout/Header/NavigationMenu';
import { SideMenu } from '@/components/layout/Header/SideMenu';

export const Header = () => {
  return (
    <header className="flex items-center justify-between bg-white px-4 py-3">
      <HomeLogo />

      <div className="flex items-center gap-10">
        <NavigationMenu />
        <SideMenu />
      </div>
    </header>
  );
};
