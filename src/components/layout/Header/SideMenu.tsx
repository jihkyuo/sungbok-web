import menuIcon from '@/assets/icons/hamburger_menu.svg';
import Image from 'next/image';

export const SideMenu = () => {
  return <Image src={menuIcon} alt="menu" className="cursor-pointer" width={30} height={30} />;
};
