import React, { useState } from 'react';
import { DollarSign, Globe, Headphones, UserRound, ChevronRight, ShoppingCart, Search, Smartphone } from 'lucide-react';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { NAV_MENU_ITEMS } from '@/constants/shared'; // static configuraitn nav menu
import { createPortal } from 'react-dom';
import ModalForm from '../Modals/ModalForm';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { Badge } from '@/components/ui/badge';
import MiniCartNew from '../Modals/MiniCartNew';
import SubmenuAccount from '../Modals/SubmenuAccount';

const MegaMenu = dynamic(() => import('../Modals/MegaMenu/MegaMenu'), { ssr: false }); // lazy load Mega Menu

const DesktopMenu = ({ stickyHeader }) => {
  return (
    <div className="relative hidden lg:block">
      {/* Top Bar */}
      <div className={`${stickyHeader ? 'hidden' : 'flex'} text-black bg-[#EAEAEA] px-12 py-3 w-full items-center justify-between`}>
        <div className="topheader offer flex space-x-3 items-center">
          {/* <Link href={'/region/asia'}>Country</Link> */}

          <Smartphone size={20} className="text-grayDark" />
          <Link href="/Get Exclusive offer on the App" className="text-Nileblue text-sm">
            Get Exclusive offer on the App
          </Link>
          <a href="/Helpline" className="flex items-center text-Nileblue text-sm">
            <Headphones className="mr-2" />
            Helpline
          </a>
        </div>

        <div className="topheader-language flex space-x-6">
          <a href="/Get Exclusive offer on the App" className="flex items-center text-Nileblue text-sm">
            <Globe className="mr-2" />
            English
          </a>
          <a href="/Helpline" className="flex items-center text-Nileblue text-sm">
            <DollarSign className="mr-2" />
            Helpline
          </a>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="flex text-black px-12 py-4 w-full items-center justify-between bg-white">
        <div className="logo">
          <Link href="/">
            <img src="/assets/images/SiteLogo.png" alt="Logo" className="h-10" />
          </Link>
        </div>

        <NavMenuDesktop />

        {/* Account  */}
        <HeaderAccount />
      </div>
    </div>
  );
};

const NavMenuDesktop = () => {
  return (
    <NavigationMenu viewport="false" className="w-fit menu z-20">
      <NavigationMenuList className="flex gap-2">
        <NavigationMenuItem className="!text-Bluewhale font-medium">
          <NavigationMenuTrigger>Home</NavigationMenuTrigger>
          <NavigationMenuContent>
            <MegaMenu />
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Navigaitons */}
        {NAV_MENU_ITEMS.map((nav, index) => {
          return (
            <Button key={index} asChild variant="link">
              <Link className="!text-Bluewhale font-medium hover:no-underline" href={nav.href}>
                {nav.title}
              </Link>
            </Button>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export const HeaderAccount = () => {
  const { isMiniCartOpen, setMiniCartOpen, cartItems } = useMiniCartStore(); //mini cart store
  const [showSubmenu, setShowSubmenu] = useState(null);
  const [showForm, setShowForm] = useState(null);

  // for handle Submenu
  const handleSubmenu = () => {
    setShowSubmenu(!showSubmenu);
  };

  // Handle handleShowForm
  const handleShowForm = () => {
    setShowForm(!showForm);
  };

  // HanldeShowCart
  const handleShowCart = () => {
    setMiniCartOpen(!isMiniCartOpen);
  };

  return (
    <div>
      <ul className="flex items-center gap-6">
        {/* forspacing */}
        <li className="appearance-none"></li>
        <li className="appearance-none"></li>

        <li>
          <button className="relative" onClick={handleShowCart}>
            <ShoppingCart className="text-xs" size={20} />
            {cartItems?.length > 0 && <Badge className={'absolute bottom-1/4  left-1/2 scale-75 '}>{cartItems?.length}</Badge>}
          </button>
        </li>
        <li>
          <button onClick={handleShowForm}>
            <Search className="text-xs" size={20} />
          </button>
        </li>

        <li>
          <button className="flex items-center gap-1 py-1 px-2 border border-gray-300 rounded-full shadow-sm transition" onClick={handleSubmenu}>
            <div className="w-8 h-8 bg-[#b3b3b3] rounded-full  flex items-center justify-center ">
              <UserRound className="text-gray-600 fill-white stroke-white w-5 h-5 scale-125" />
            </div>

            <ChevronRight
              className={`transition-transform ease-in-out duration-500 ${showSubmenu ? 'rotate-0' : 'rotate-90'}`}
              size={16} // Optional: adjust icon size
            />
          </button>
        </li>
      </ul>

      {/* AccountSubMenu */}
      {showSubmenu && <SubmenuAccount showSubmenu={showSubmenu} setShowSubmenu={setShowSubmenu} />}

      {/* Show Form */}
      <ModalForm showForm={showForm} setShowForm={setShowForm} handleShowForm={handleShowForm} />

      {/* Mini Cart With React Portal */}
      {isMiniCartOpen && createPortal(<MiniCartNew />, document.body)}
    </div>
  );
};

export default DesktopMenu;
