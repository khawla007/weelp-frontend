import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ChevronDown, Globe, Headphones, MenuIcon, ShoppingCart, UserRound } from 'lucide-react';
import Link from 'next/link';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu';
import Image from 'next/image';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Badge } from '@/components/ui/badge';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import dynamic from 'next/dynamic';
import { useNavigationMenu } from '@/hooks/api/public/menu/menu';
import { NAV_MENU_ITEMS } from '@/constants/shared';

const MiniCartNew = dynamic(() => import('../Modals/MiniCartNew', { ssr: false })); // lazy load minicart

const MobileMenu = ({ stickyHeader }) => {
  return (
    <div className="relative lg:hidden">
      {/* Top Bar */}
      <div className={`${stickyHeader ? 'hidden' : 'flex'} text-black bg-Brightgray px-12 py-4 w-full items-center justify-between `}>
        <Link href="/Helpline" className="flex items-center text-Nileblue text-sm">
          <Headphones className="mr-2" />
          Helpline
        </Link>

        <div className="topheader-language flex space-x-6">
          <Link href="/Get Exclusive offer on the App" className="flex items-center text-Nileblue text-sm">
            <Globe className="mr-2" />
            English
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="p-2 bg-white">
        <MobileMenuSlider />
      </div>
    </div>
  );
};

const MobileMenuSlider = () => {
  return (
    <Sheet>
      <div className="flex justify-between items-center">
        <SheetTrigger asChild>
          <Button variant="link">
            <MenuIcon />
          </Button>
        </SheetTrigger>

        {/* Site Logo */}
        <div className="logo">
          <Link href="/">
            <Image src="/assets/images/SiteLogo.png" alt="Logo" width={120} height={120} />
          </Link>
        </div>

        {/* Mobile Account and MiniCart */}
        <HeaderAccountMobile />
      </div>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle className="sr-only">Edit profile</SheetTitle>
          <SheetDescription className="sr-only">Make changes to your profile here. Click save when you&apos;re done.</SheetDescription>
        </SheetHeader>

        {/* Site Logo */}
        <div className="logo">
          <Link href="/">
            <Image src="/assets/images/SiteLogo.png" alt="Logo" width={120} height={120} />
          </Link>
        </div>

        {/* Mobile Navigation Menu */}
        <NavigationMenuMobile />
      </SheetContent>
    </Sheet>
  );
};

// Nav Items
const NavigationMenuMobile = () => {
  const [selectedItem, setSelectedItem] = useState('');
  const { data, isLoading: isNavMenuLoading, error: isNavMenuError } = useNavigationMenu(); // fetch region through api
  if (isNavMenuError) return <span className="text-red-400">Someting went wrong</span>;
  if (isNavMenuLoading) return <span className="loader"></span>;
  const regions = data?.data || [];

  // Handle Selcted Item
  const handleSelectedItem = (region) => {
    if (region === selectedItem) {
      setSelectedItem('');
    } else {
      setSelectedItem(region);
    }
  };

  return (
    <NavigationMenu className="flex-col items-start py-4 w-full min-w-full">
      <NavigationMenuList className="flex-col items-start w-full gap-2 min-w-full p-2">
        <NavigationMenuItem key={'home'} className="!ml-0">
          <Link href="/" className="text-2xl">
            Home
          </Link>
        </NavigationMenuItem>

        {regions.map(({ region, cities }, index) => {
          return (
            <NavigationMenuItem key={region} className="!ml-0 w-full relative" onClick={() => handleSelectedItem(region)}>
              <span className="text-2xl w-full">{region}</span>

              <ChevronDown size={20} className={`absolute left-full sm:left-[150%] top-4 transition-transform ${selectedItem === region ? 'rotate-180' : 'rotate-0'}`} />
              {selectedItem === region && cities?.length > 0 && (
                <ul className="px-4 w-full flex flex-col text-sm">
                  {cities.map((city, index) => (
                    <Link key={city.id || index} href={`/city/${city?.slug}`}>
                      {city.name}
                    </Link>
                  ))}
                </ul>
              )}
            </NavigationMenuItem>
          );
        })}

        {NAV_MENU_ITEMS.map(({ title, href }, index) => {
          return (
            <NavigationMenuItem key={index} className="!ml-0">
              <Link href={href} className="text-2xl">
                {title}
              </Link>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

// My Account Mobile
const HeaderAccountMobile = () => {
  const { isMiniCartOpen, setMiniCartOpen, cartItems } = useMiniCartStore(); //mini cart store

  // HanldeShowCart
  const handleShowCart = () => {
    setMiniCartOpen(!isMiniCartOpen);
  };
  return (
    <div>
      <div className="flex gap-4">
        <button className="relative" onClick={handleShowCart}>
          <ShoppingCart className="text-xs" size={20} />
          {cartItems?.length > 0 && <Badge className={'absolute bottom-1/4  left-1/2 scale-75 '}>{cartItems?.length}</Badge>}
        </button>
        <Link href="/user/login">
          <UserRound />
        </Link>
      </div>

      {/* Minicart */}
      {isMiniCartOpen && createPortal(<MiniCartNew />, document.body)}
    </div>
  );
};

export default MobileMenu;
