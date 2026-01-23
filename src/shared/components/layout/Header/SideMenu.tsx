// import menuBlackIcon from '@/assets/icons/menu-black.svg';
import menuWhiteIcon from '@/assets/icons/menu-white.svg';
import Image from 'next/image';

export const SideMenu = () => {
  return (
    <Image
      src={menuWhiteIcon}
      alt="menu"
      className="cursor-pointer md:hidden"
      width={24}
      height={24}
    />
  );
};
