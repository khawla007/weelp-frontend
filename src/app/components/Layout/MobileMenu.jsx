import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ChevronDown, Globe, Headphones, MenuIcon, Search, ShoppingCart, Smartphone, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import dynamic from 'next/dynamic';
import { useNavigationMenu } from '@/hooks/api/public/menu/menu';
import { HEADER_NAV_ITEMS, HEADER_SECONDARY_META } from './shellContent';

const MiniCartNew = dynamic(() => import('../Modals/MiniCartNew', { ssr: false })); // lazy load minicart

// Helper function to generate initials from name
const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const MobileMenu = ({ stickyHeader }) => {
  return (
    <div className="lg:hidden w-full">
      <div className={`${stickyHeader ? 'hidden' : 'block'} border-b border-[#E5E4E1] bg-[#ecf2f4]`}>
        <div className="flex items-center justify-between gap-3 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1A1918]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f0c76d] bg-[#fff4d8] px-3 py-1.5">
            <Smartphone className="size-3.5" />
            <span>Get Exclusive offer on the App</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E4E1] bg-white/80 px-3 py-1.5">
              <Globe className="size-3.5" />
              <span>{HEADER_SECONDARY_META[0]}</span>
            </div>
            <div className="rounded-full border border-[#E5E4E1] bg-white/80 px-3 py-1.5">{HEADER_SECONDARY_META[1]}</div>
          </div>
        </div>
      </div>

      <div className={`${stickyHeader ? 'fixed top-0 left-0 right-0 z-[99999] shadow-md' : ''} border-b border-[#E5E4E1] bg-[#f8f9f9] px-4 py-3`}>
        <MobileMenuSlider />
      </div>
    </div>
  );
};

const MobileMenuSlider = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Render a matching skeleton during SSR to avoid Radix Dialog hydration mismatch
  // (Radix generates different aria-controls IDs on server vs client)
  if (!mounted) {
    return (
      <div className="flex justify-between items-center">
        <div className="h-11 w-11 rounded-full border border-[#E5E4E1] bg-white" />
        <Link href="/" className="text-[1.9rem] font-bold tracking-[-0.06em] text-[#1A1918]">
          Weelp.
        </Link>
        <HeaderAccountMobile />
      </div>
    );
  }

  return (
    <Sheet>
      <div className="flex justify-between items-center">
        <SheetTrigger asChild>
          <Button variant="ghost" className="h-11 w-11 rounded-full border border-[#E5E4E1] bg-white p-0 text-[#1A1918]">
            <MenuIcon className="size-5" />
          </Button>
        </SheetTrigger>

        <Link href="/" className="text-[1.9rem] font-bold tracking-[-0.06em] text-[#1A1918]">
          Weelp.
        </Link>

        <HeaderAccountMobile />
      </div>

      <SheetContent side="left" className="w-full max-w-[360px] border-r border-[#E5E4E1] bg-[#f8f9f9] px-0">
        <SheetHeader>
          <SheetTitle className="sr-only">Main navigation</SheetTitle>
          <SheetDescription className="sr-only">Browse the modern Weelp navigation.</SheetDescription>
        </SheetHeader>

        <div className="border-b border-[#E5E4E1] px-6 pb-5 pt-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-[2rem] font-bold tracking-[-0.06em] text-[#1A1918]">
              Weelp.
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E4E1] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1A1918]">
              <Headphones className="size-3.5" />
              <span>Helpline</span>
            </div>
          </div>
          <p className="mt-4 max-w-[240px] text-sm leading-6 text-[#6D6C6A]">Plan stays, experiences, and transfers in one calmer booking flow.</p>
        </div>

        <NavigationMenuMobile />
      </SheetContent>
    </Sheet>
  );
};

const NavigationMenuMobile = () => {
  const [selectedItem, setSelectedItem] = useState('');
  const { data, isLoading: isNavMenuLoading, error: isNavMenuError } = useNavigationMenu(); // fetch region through api
  const regions = data?.data || [];

  const handleSelectedItem = (region) => {
    if (region === selectedItem) {
      setSelectedItem('');
    } else {
      setSelectedItem(region);
    }
  };

  return (
    <div className="px-6 py-6">
      <div className="flex flex-col gap-2">
        {HEADER_NAV_ITEMS.map(({ title, href }) => (
          <Link key={title} href={href} className="rounded-[22px] border border-[#E5E4E1] bg-white px-4 py-4 text-base font-semibold text-[#1A1918] shadow-[0_18px_32px_-28px_rgba(18,51,71,0.7)]">
            {title}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <Link href="/user/login" className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#E5E4E1] bg-white px-4 py-3 text-sm font-semibold text-[#1A1918]">
          <UserRound className="size-4" />
          Account
        </Link>
        <Link href="/explore" className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E5E4E1] bg-white text-[#1A1918]" aria-label="Search trips">
          <Search className="size-4" />
        </Link>
      </div>

      {!isNavMenuError && !isNavMenuLoading && regions.length > 0 && (
        <div className="mt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D6C6A]">Featured regions</p>
          <div className="mt-3 space-y-2">
            {regions.map(({ region, cities }) => (
              <div key={region} className="rounded-[22px] border border-[#E5E4E1] bg-white px-4 py-3">
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-left text-sm font-semibold uppercase tracking-[0.12em] text-[#1A1918]"
                  onClick={() => handleSelectedItem(region)}
                >
                  <span>{region}</span>
                  <ChevronDown className={`size-4 transition-transform ${selectedItem === region ? 'rotate-180' : ''}`} />
                </button>
                {selectedItem === region && cities?.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2 border-t border-[#ecf2f4] pt-3 text-sm text-[#6D6C6A]">
                    {cities.map((city, index) => (
                      <Link key={city.id || index} href={`/cities/${city?.slug}`}>
                        {city.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const HeaderAccountMobile = () => {
  const { data: session } = useSession();
  const isMiniCartOpen = useMiniCartStore((state) => state.isMiniCartOpen);
  const setMiniCartOpen = useMiniCartStore((state) => state.setMiniCartOpen);
  const cartItems = useMiniCartStore((state) => state.cartItems);

  // Extract user data
  const user = session?.user || {};
  const { name = '', role = '', avatar } = user;
  const userInitials = getInitials(name);
  const avatarSrc = avatar;
  const isLoggedIn = !!session;
  const isAdmin = role === 'super_admin';
  const accountLink = isAdmin ? '/dashboard/admin' : '/dashboard/customer';

  const handleShowCart = () => {
    setMiniCartOpen(!isMiniCartOpen);
  };
  return (
    <div>
      <div className="flex gap-2">
        <button type="button" className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E4E1] bg-white text-[#1A1918]" onClick={handleShowCart}>
          <ShoppingCart className="size-[18px]" />
          {cartItems?.length > 0 && <Badge className={'absolute bottom-1/4  left-1/2 scale-75 '}>{cartItems?.length}</Badge>}
        </button>
        {isLoggedIn && avatarSrc ? (
          <Link href={accountLink} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E4E1] bg-white overflow-hidden">
            <img src={avatarSrc} alt={name || 'user'} className="h-full w-full object-cover" />
          </Link>
        ) : isLoggedIn ? (
          <Link href={accountLink} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E4E1] text-white font-semibold" style={{ backgroundColor: '#568f7c' }}>
            {userInitials}
          </Link>
        ) : (
          <Link href="/user/login" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E4E1] bg-white text-[#1A1918]">
            <UserRound className="size-[18px]" />
          </Link>
        )}
      </div>

      {isMiniCartOpen && createPortal(<MiniCartNew />, document.body)}
    </div>
  );
};

export default MobileMenu;
