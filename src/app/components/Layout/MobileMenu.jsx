import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ArrowLeft, ChevronRight, Globe, MenuIcon, Search, ShoppingCart, Smartphone, UserRound, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { useMegaMenu } from '@/hooks/api/public/menu/megaMenu';
import { HEADER_NAV_ITEMS, HEADER_SECONDARY_META } from './shellContent';
import { getLogoUrl } from '@/lib/config/brand';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const brandFont = 'var(--font-interTight), Inter Tight, sans-serif';
const HOME_HEADER_TEXT_CLASS = 'text-black dark:text-black';

// Helper function to generate initials from name
const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const MobileMenu = ({ stickyHeader, variant = 'solid' }) => {
  const isOverHero = variant === 'over-hero';
  const topStripVisible = !stickyHeader;
  const mainBarTransparent = isOverHero && !stickyHeader;
  const topStripTransparent = isOverHero && topStripVisible;
  const topStripSurfaceClass = topStripTransparent ? 'border-transparent bg-transparent text-black dark:text-black' : 'border-border bg-card text-foreground';
  const topStripOfferPillClass = topStripTransparent ? 'border-black/10 bg-transparent text-black dark:text-black' : 'border-border bg-background/80';
  const topStripLocalePillClass = topStripTransparent
    ? 'border-transparent bg-background/85 text-foreground backdrop-blur-md shadow-[0_4px_14px_rgba(0,0,0,0.12)] dark:shadow-none'
    : 'border-border bg-background text-foreground';
  const topStripSpacingClass = topStripTransparent ? 'px-3 pb-1.5 pt-[18px] sm:px-4' : 'px-3 py-2.5 sm:px-4 sm:py-3';
  const topStripInnerPaddingClass = topStripTransparent ? 'py-0.5' : 'py-1 sm:py-1.5';

  return (
    <div data-weelp-mobile-menu="true" className={`lg:hidden w-full ${stickyHeader ? 'fixed top-0 left-0 right-0 z-40 shadow-md dark:shadow-none' : ''}`}>
      <div
        aria-hidden={topStripVisible ? undefined : true}
        className={`${topStripVisible ? 'border-b' : 'border-b-0'} overflow-hidden transition-[max-height,padding] duration-[220ms] ease-[var(--weelp-ease-out)] motion-reduce:transition-none ${topStripSurfaceClass} ${
          topStripVisible ? 'max-h-24' : 'max-h-0 pointer-events-none'
        }`}
      >
        <div className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] sm:text-[11px] sm:tracking-[0.14em] ${topStripSpacingClass}`}>
          <div className={`inline-flex min-w-0 items-center gap-1.5 rounded-full border px-2.5 sm:gap-2 sm:px-3 ${topStripInnerPaddingClass} ${topStripOfferPillClass}`}>
            <Smartphone className="size-3.5 shrink-0" />
            <span className="truncate">Get Exclusive offer on the App</span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 sm:px-3 ${topStripInnerPaddingClass} ${topStripLocalePillClass}`}>
              <Globe className="size-3.5 shrink-0" />
              <span>{HEADER_SECONDARY_META[0]}</span>
            </div>
            <div className={`rounded-full border px-2.5 sm:px-3 ${topStripInnerPaddingClass} ${topStripLocalePillClass}`}>{HEADER_SECONDARY_META[1]}</div>
          </div>
        </div>
      </div>

      <div
        className={`${
          mainBarTransparent ? 'border-b border-transparent bg-transparent' : 'border-b border-border bg-card'
        } px-4 py-3 transition-[background-color,border-color,box-shadow,opacity,transform] duration-200 ease-[var(--weelp-ease-out)] motion-reduce:transition-none`}
      >
        <MobileMenuSlider brandTextClass={mainBarTransparent ? HOME_HEADER_TEXT_CLASS : 'text-foreground'} />
      </div>
    </div>
  );
};

const MobileMenuSlider = ({ brandTextClass = 'text-foreground' }) => {
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
        <div className="h-11 w-11 rounded-full border border-border bg-background" />
        <Link href="/" className={`flex items-center gap-2 ${brandTextClass}`}>
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
          <Button
            variant="ghost"
            aria-label="Open main navigation"
            className="h-11 w-11 rounded-full border border-border bg-background p-0 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <MenuIcon className="size-5" />
          </Button>
        </SheetTrigger>

        <Link href="/" className={`flex items-center gap-2 ${brandTextClass}`}>
          <img src={getLogoUrl()} alt="Weelp" className="h-8 w-auto" />
          <span className="text-[18px] font-semibold" style={{ fontFamily: brandFont }}>
            Weelp.
          </span>
        </Link>

        <HeaderAccountMobile />
      </div>

      <SheetContent side="left" className="flex w-full max-w-[360px] flex-col gap-0 overflow-hidden border-r border-border bg-card p-0">
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
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
        {level > 0 ? (
          <button
            type="button"
            onClick={back}
            aria-label="Back to previous menu"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground active:bg-muted active:scale-95 transition-transform duration-150 ease-[var(--weelp-ease-out)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ArrowLeft className="size-4" />
          </button>
        ) : (
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <img src={getLogoUrl()} alt="Weelp" className="h-7 w-auto" />
            <span className="text-[16px] font-semibold" style={{ fontFamily: brandFont }}>
              Weelp.
            </span>
          </Link>
        )}
        <span className="flex-1 truncate text-sm font-semibold text-foreground">{title}</span>
        <SheetClose
          aria-label="Close main navigation"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <X className="size-4" />
        </SheetClose>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div className="flex h-full w-[300%] transition-transform duration-300 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${level * (100 / 3)}%)` }}>
          <PanelRegions onOpenRegion={setSelectedRegion} regionItems={regionItems} isLoading={isLoading} error={error} isCurrent={level === 0} />
          <PanelCountries region={selectedRegion} onOpenCountry={setSelectedCountry} isCurrent={level === 1} />
          <PanelCities country={selectedCountry} isCurrent={level === 2} />
        </div>
      </div>
    </div>
  );
};

const PanelRegions = ({ onOpenRegion, regionItems, isLoading, error, isCurrent }) => (
  <div className={`h-full w-1/3 overflow-y-auto px-4 py-5 transition-opacity duration-200 ease-[var(--weelp-ease-out)] motion-reduce:transition-none ${isCurrent ? 'opacity-100' : 'opacity-0'}`}>
    <div className="flex flex-col gap-2">
      {HEADER_NAV_ITEMS.map(({ title, href, hasMegaMenu }) => {
        if (hasMegaMenu) return null;
        return (
          <Link
            key={title}
            href={href}
            className="rounded-[18px] border border-border bg-background px-4 py-3.5 text-[15px] font-semibold text-foreground hover:text-muted-foreground shadow-[0_18px_32px_-28px_rgba(18,51,71,0.7)] dark:shadow-none"
          >
            {title}
          </Link>
        );
      })}
    </div>

    <div className="mt-5 flex gap-2.5">
      <Link href="/user/login" className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground">
        <UserRound className="size-4" />
        Account
      </Link>
      <Link
        href="/explore-creators"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Search trips"
      >
        <Search className="size-4" />
      </Link>
    </div>

    <div className="mt-7">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Explore destinations</p>
      <div className="mt-3 overflow-hidden rounded-[18px] border border-border bg-background">
        {isLoading && <div className="px-4 py-6 text-sm text-muted-foreground">Loading...</div>}
        {error && <div className="px-4 py-6 text-sm text-red-500">Couldn&rsquo;t load destinations.</div>}
        {!isLoading &&
          !error &&
          regionItems.map((region, i) => (
            <button
              key={region.id}
              type="button"
              onClick={() => onOpenRegion(region)}
              className={`group/row flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-[15px] font-medium text-foreground active:bg-muted ${i > 0 ? 'border-t border-border' : ''}`}
            >
              <span className="truncate">{region.name}</span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-[var(--weelp-ease-out)] motion-reduce:transition-none group-hover/row:translate-x-0.5 group-active/row:translate-x-0.5" />
            </button>
          ))}
      </div>
    </div>
  </div>
);

const PanelCountries = ({ region, onOpenCountry, isCurrent }) => (
  <div className={`h-full w-1/3 overflow-y-auto px-4 py-5 transition-opacity duration-200 ease-[var(--weelp-ease-out)] motion-reduce:transition-none ${isCurrent ? 'opacity-100' : 'opacity-0'}`}>
    {region ? (
      <div className="overflow-hidden rounded-[18px] border border-border bg-background">
        {region.countries?.length > 0 ? (
          region.countries.map((country, i) => (
            <button
              key={country.id}
              type="button"
              onClick={() => onOpenCountry(country)}
              className={`group/row flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-[15px] font-medium text-foreground active:bg-muted ${i > 0 ? 'border-t border-border' : ''}`}
            >
              <span className="truncate">{country.name}</span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-[var(--weelp-ease-out)] motion-reduce:transition-none group-hover/row:translate-x-0.5 group-active/row:translate-x-0.5" />
            </button>
          ))
        ) : (
          <div className="px-4 py-6 text-sm text-muted-foreground">No destinations yet.</div>
        )}
      </div>
    ) : null}
  </div>
);

const PanelCities = ({ country, isCurrent }) => (
  <div className={`h-full w-1/3 overflow-y-auto px-4 py-5 transition-opacity duration-200 ease-[var(--weelp-ease-out)] motion-reduce:transition-none ${isCurrent ? 'opacity-100' : 'opacity-0'}`}>
    {country ? (
      <div className="overflow-hidden rounded-[18px] border border-border bg-background">
        {country.cities?.length > 0 ? (
          country.cities.map((city, i) => (
            <Link
              key={city.id ?? city.slug ?? i}
              href={`/cities/${city.slug}`}
              className={`group/row flex items-center justify-between gap-3 px-4 py-3.5 text-[15px] font-medium text-foreground active:bg-muted ${i > 0 ? 'border-t border-border' : ''}`}
            >
              <span className="truncate">{city.name}</span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-[var(--weelp-ease-out)] motion-reduce:transition-none group-hover/row:translate-x-0.5 group-active/row:translate-x-0.5" />
            </Link>
          ))
        ) : (
          <div className="px-4 py-6 text-sm text-muted-foreground">No cities yet.</div>
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
  const cartItemCount = cartItems?.length ?? 0;

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
        <ThemeToggle className="border border-border bg-background text-foreground focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background" />
        <button
          type="button"
          aria-label={cartItemCount > 0 ? `Open cart, ${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'}` : 'Open cart'}
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={handleShowCart}
        >
          <ShoppingCart className="size-[18px]" />
          {cartItemCount > 0 && (
            <Badge key={cartItemCount} className="absolute bottom-1/4 left-1/2 animate-badge-pulse">
              {cartItemCount}
            </Badge>
          )}
        </button>
        {isLoggedIn && avatarSrc ? (
          <Link
            href={accountLink}
            aria-label="Open account"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <img src={avatarSrc} alt={name || 'user'} className="h-full w-full object-cover" />
          </Link>
        ) : isLoggedIn ? (
          <Link
            href={accountLink}
            aria-label="Open account"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-weelp-sage-deep text-white font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {userInitials}
          </Link>
        ) : (
          <Link
            href="/user/login"
            aria-label="Sign in"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <UserRound className="size-[18px]" />
          </Link>
        )}
      </div>

    </div>
  );
};

export default MobileMenu;
