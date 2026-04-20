import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ArrowLeft, ChevronRight, Globe, MenuIcon, Search, ShoppingCart, Smartphone, UserRound, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import dynamic from 'next/dynamic';
import { useMegaMenu } from '@/hooks/api/public/menu/megaMenu';
import { HEADER_NAV_ITEMS, HEADER_SECONDARY_META } from './shellContent';
import { getLogoUrl } from '@/lib/config/brand';

const brandFont = 'var(--font-interTight), Inter Tight, sans-serif';

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
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1A1918] sm:px-4 sm:py-3 sm:text-[11px] sm:tracking-[0.16em]">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#f0c76d] bg-[#fff4d8] px-2.5 py-1 sm:gap-2 sm:px-3 sm:py-1.5">
            <Smartphone className="size-3.5" />
            <span>Get Exclusive offer on the App</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E4E1] bg-white/80 px-2.5 py-1 sm:px-3 sm:py-1.5">
              <Globe className="size-3.5" />
              <span>{HEADER_SECONDARY_META[0]}</span>
            </div>
            <div className="rounded-full border border-[#E5E4E1] bg-white/80 px-2.5 py-1 sm:px-3 sm:py-1.5">{HEADER_SECONDARY_META[1]}</div>
          </div>
        </div>
      </div>

      <div className={`${stickyHeader ? 'fixed top-0 left-0 right-0 z-40 shadow-md' : ''} border-b border-[#E5E4E1] bg-[#f8f9f9] px-4 py-3`}>
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
        <Link href="/" className="flex items-center gap-2 text-[#142a38]">
          <img src={getLogoUrl()} alt="Weelp" className="h-8 w-auto" />
          <span className="text-[18px] font-semibold" style={{ fontFamily: brandFont }}>
            Weelp.
          </span>
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

        <Link href="/" className="flex items-center gap-2 text-[#142a38]">
          <img src={getLogoUrl()} alt="Weelp" className="h-8 w-auto" />
          <span className="text-[18px] font-semibold" style={{ fontFamily: brandFont }}>
            Weelp.
          </span>
        </Link>

        <HeaderAccountMobile />
      </div>

      <SheetContent side="left" className="flex w-full max-w-[360px] flex-col gap-0 overflow-hidden border-r border-[#E5E4E1] bg-[#f8f9f9] p-0">
        <SheetHeader>
          <SheetTitle className="sr-only">Main navigation</SheetTitle>
          <SheetDescription className="sr-only">Browse the modern Weelp navigation.</SheetDescription>
        </SheetHeader>
        <NavigationMenuMobile />
      </SheetContent>
    </Sheet>
  );
};

const TRENDING_REGION_ID = 'trending';

const NavigationMenuMobile = () => {
  const { regions, trending, isLoading, error } = useMegaMenu();
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const regionItems = useMemo(() => {
    const list = [];
    if (trending?.length) list.push({ id: TRENDING_REGION_ID, name: 'Trending Destinations', countries: trending });
    return list.concat(regions.map((r) => ({ id: r.id, name: r.name, countries: r.countries ?? [] })));
  }, [regions, trending]);

  const level = selectedCountry ? 2 : selectedRegion ? 1 : 0;

  const back = () => {
    if (selectedCountry) setSelectedCountry(null);
    else if (selectedRegion) setSelectedRegion(null);
  };

  const title = selectedCountry?.name ?? selectedRegion?.name ?? '';

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-[#E5E4E1] bg-white px-4">
        {level > 0 ? (
          <button type="button" onClick={back} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E4E1] bg-white text-[#1A1918] active:bg-[#f0f0f0]">
            <ArrowLeft className="size-4" />
          </button>
        ) : (
          <Link href="/" className="flex items-center gap-2 text-[#142a38]">
            <img src={getLogoUrl()} alt="Weelp" className="h-7 w-auto" />
            <span className="text-[16px] font-semibold" style={{ fontFamily: brandFont }}>
              Weelp.
            </span>
          </Link>
        )}
        <span className="flex-1 truncate text-sm font-semibold text-[#1A1918]">{title}</span>
        <SheetClose aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E5E4E1] bg-white text-[#1A1918] active:bg-[#f0f0f0]">
          <X className="size-4" />
        </SheetClose>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div className="flex h-full w-[300%] transition-transform duration-300 ease-out" style={{ transform: `translateX(-${level * (100 / 3)}%)` }}>
          <PanelRegions onOpenRegion={setSelectedRegion} regionItems={regionItems} isLoading={isLoading} error={error} />
          <PanelCountries region={selectedRegion} onOpenCountry={setSelectedCountry} />
          <PanelCities country={selectedCountry} />
        </div>
      </div>
    </div>
  );
};

const PanelRegions = ({ onOpenRegion, regionItems, isLoading, error }) => (
  <div className="h-full w-1/3 overflow-y-auto px-4 py-5">
    <div className="flex flex-col gap-2">
      {HEADER_NAV_ITEMS.map(({ title, href, hasMegaMenu }) => {
        if (hasMegaMenu) return null;
        return (
          <Link key={title} href={href} className="rounded-[18px] border border-[#E5E4E1] bg-white px-4 py-3.5 text-[15px] font-semibold text-[#1A1918] shadow-[0_18px_32px_-28px_rgba(18,51,71,0.7)]">
            {title}
          </Link>
        );
      })}
    </div>

    <div className="mt-5 flex gap-2.5">
      <Link href="/user/login" className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#E5E4E1] bg-white px-4 py-3 text-sm font-semibold text-[#1A1918]">
        <UserRound className="size-4" />
        Account
      </Link>
      <Link href="/explore-creators" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E4E1] bg-white text-[#1A1918]" aria-label="Search trips">
        <Search className="size-4" />
      </Link>
    </div>

    <div className="mt-7">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6D6C6A]">Explore destinations</p>
      <div className="mt-3 overflow-hidden rounded-[18px] border border-[#E5E4E1] bg-white">
        {isLoading && <div className="px-4 py-6 text-sm text-[#6D6C6A]">Loading…</div>}
        {error && <div className="px-4 py-6 text-sm text-red-500">Couldn&rsquo;t load destinations.</div>}
        {!isLoading &&
          !error &&
          regionItems.map((region, i) => (
            <button
              key={region.id}
              type="button"
              onClick={() => onOpenRegion(region)}
              className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-[15px] font-medium text-[#1A1918] active:bg-[#f0f0f0] ${i > 0 ? 'border-t border-[#E5E4E1]' : ''}`}
            >
              <span className="truncate">{region.name}</span>
              <ChevronRight className="size-4 shrink-0 text-[#6D6C6A]" />
            </button>
          ))}
      </div>
    </div>
  </div>
);

const PanelCountries = ({ region, onOpenCountry }) => (
  <div className="h-full w-1/3 overflow-y-auto px-4 py-5">
    {region ? (
      <div className="overflow-hidden rounded-[18px] border border-[#E5E4E1] bg-white">
        {region.countries?.length > 0 ? (
          region.countries.map((country, i) => (
            <button
              key={country.id}
              type="button"
              onClick={() => onOpenCountry(country)}
              className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-[15px] font-medium text-[#1A1918] active:bg-[#f0f0f0] ${i > 0 ? 'border-t border-[#E5E4E1]' : ''}`}
            >
              <span className="truncate">{country.name}</span>
              <ChevronRight className="size-4 shrink-0 text-[#6D6C6A]" />
            </button>
          ))
        ) : (
          <div className="px-4 py-6 text-sm text-[#6D6C6A]">No destinations yet.</div>
        )}
      </div>
    ) : null}
  </div>
);

const PanelCities = ({ country }) => (
  <div className="h-full w-1/3 overflow-y-auto px-4 py-5">
    {country ? (
      <div className="overflow-hidden rounded-[18px] border border-[#E5E4E1] bg-white">
        {country.cities?.length > 0 ? (
          country.cities.map((city, i) => (
            <Link
              key={city.id ?? city.slug ?? i}
              href={`/cities/${city.slug}`}
              className={`flex items-center justify-between gap-3 px-4 py-3.5 text-[15px] font-medium text-[#1A1918] active:bg-[#f0f0f0] ${i > 0 ? 'border-t border-[#E5E4E1]' : ''}`}
            >
              <span className="truncate">{city.name}</span>
              <ChevronRight className="size-4 shrink-0 text-[#6D6C6A]" />
            </Link>
          ))
        ) : (
          <div className="px-4 py-6 text-sm text-[#6D6C6A]">No cities yet.</div>
        )}
      </div>
    ) : null}
  </div>
);

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
