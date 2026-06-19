import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, Globe, Headphones, MapPin, Search, ShoppingCart, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { Badge } from '@/components/ui/badge';
import MiniCartNew from '../Modals/MiniCartNew';
import ModalForm from '../Modals/ModalForm';
import SubmenuAccount from '../Modals/SubmenuAccount';
import { HEADER_NAV_ITEMS, HEADER_PRIMARY_META, HEADER_SECONDARY_META } from './shellContent';
import NotificationBell from './NotificationBell';
import { getLogoUrl } from '@/lib/config/brand';
import dynamic from 'next/dynamic';

const MegaMenu = dynamic(() => import('../Modals/MegaMenu/MegaMenu'), { ssr: false });
const MEGA_MENU_ENTER_START_MS = 20;
const MEGA_MENU_EXIT_MS = 180;
const MEGA_MENU_PANEL_ID = 'desktop-mega-menu-panel';
const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Helper function to generate initials from name
const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const DesktopTopStrip = ({ topStripVisible, topStripOverHero, collapsible = true }) => {
  // collapsible=false: strip keeps constant 46px height; visibility controlled by parent rendering it conditionally
  // collapsible=true: strip animates max-height/opacity for the in-flow over-hero case (no doc-height oscillation since parent is fixed)
  const collapseClass = collapsible
    ? `overflow-hidden transition-[max-height,opacity,background-color,border-color] duration-200 ease-out motion-reduce:transition-none ${
        topStripVisible ? 'max-h-[46px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
      }`
    : 'h-[46px]';
  const surfaceClass = topStripVisible ? (topStripOverHero ? 'border-b border-transparent bg-transparent' : 'border-b border-[#ededed] bg-white') : 'border-b-0 bg-transparent';
  return (
    <div aria-hidden={topStripVisible ? undefined : true} className={`hidden lg:block ${collapseClass} ${surfaceClass}`}>
      <div className="mx-auto flex h-[46px] w-full items-center justify-between gap-4 px-4 md:px-8 xl:px-[60px] text-[#18181b]">
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center gap-2 text-[14px]">
            <Smartphone className="size-[18px]" />
            <span>{HEADER_PRIMARY_META[0].label}</span>
          </div>
          <div className="inline-flex items-center gap-2 text-[14px]">
            <Headphones className="size-[18px]" />
            <span>{HEADER_PRIMARY_META[1].label}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-[13px] text-[14px]">
            <Globe className="size-[18px]" />
            <span>{HEADER_SECONDARY_META[0]}</span>
          </div>
          <div className="inline-flex items-center gap-[13px] text-[14px]">
            <span>{HEADER_SECONDARY_META[1]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DesktopMainBar = ({ stickyHeader, mainBarTransparent }) => {
  const headerBarRef = useRef(null);

  useEffect(() => {
    const headerBar = headerBarRef.current;
    if (!headerBar) return undefined;
    if (!stickyHeader) return undefined;
    const settleTimer = window.setTimeout(() => {
      headerBar.setAttribute('data-weelp-sticky-settled', 'true');
    }, 80);
    return () => window.clearTimeout(settleTimer);
  }, [stickyHeader]);

  return (
    <div className="hidden lg:block h-[66px]" data-testid="desktop-header-slot">
      <div
        ref={headerBarRef}
        data-testid="desktop-header-bar"
        data-weelp-sticky-header={stickyHeader ? 'true' : undefined}
        data-weelp-sticky-settled={stickyHeader ? 'false' : undefined}
        className={`weelp-sticky-header-transition h-[66px] transition-[background-color,border-color,box-shadow,backdrop-filter] duration-200 ease-[var(--weelp-ease-out)] motion-reduce:transition-none ${
          mainBarTransparent
            ? 'border-b border-transparent bg-transparent shadow-none backdrop-blur-0'
            : stickyHeader
              ? 'border-b border-[#ededed] bg-white shadow-[0_18px_45px_-32px_rgba(18,51,71,0.7)]'
              : 'border-b border-[#ededed] bg-white/95 shadow-none backdrop-blur-[24px]'
        }`}
      >
        <div className="grid h-full w-full items-center gap-4 px-4 py-[8px] md:px-8 xl:px-[60px]" style={{ gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)' }}>
          <Link href="/" className="shrink-0 flex items-center gap-3 justify-self-start focus:outline-none" aria-label="Weelp home">
            <img src={getLogoUrl()} alt="Weelp" className="h-9 w-auto" />
            <span className="text-[18px] font-semibold text-[#18181b]" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}>
              Weelp.
            </span>
          </Link>

          <NavMenuDesktop />

          <HeaderAccount overHero={mainBarTransparent} />
        </div>
      </div>
    </div>
  );
};

const DesktopMenu = ({ stickyHeader, variant = 'solid' }) => {
  const isOverHero = variant === 'over-hero';
  const topStripVisible = !stickyHeader;
  const topStripOverHero = isOverHero && topStripVisible;
  const mainBarTransparent = isOverHero && !stickyHeader;

  return (
    <div className="hidden lg:block w-full">
      <DesktopTopStrip topStripVisible={topStripVisible} topStripOverHero={topStripOverHero} collapsible />
      <DesktopMainBar stickyHeader={stickyHeader} mainBarTransparent={mainBarTransparent} />
    </div>
  );
};

const DESTINATION_ACTIVE_PREFIXES = ['/cities', '/destinations', '/countries', '/regions'];

const NavMenuDesktop = () => {
  const [megaOpen, setMegaOpen] = useState(false);
  const [megaMounted, setMegaMounted] = useState(false);
  const [megaMotionState, setMegaMotionState] = useState('closed');
  const pathname = usePathname();
  const closeTimer = useRef(null);
  const openTimer = useRef(null);
  const enterTimer = useRef(null);
  const exitTimer = useRef(null);
  const megaTriggerRef = useRef(null);
  const megaPanelRef = useRef(null);

  const isHrefActive = (href) => {
    if (!href || !pathname) return false;
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };
  const isMegaActive = pathname ? DESTINATION_ACTIVE_PREFIXES.some((p) => pathname.startsWith(p)) : false;

  const linkClass = (active) =>
    `group/nav relative flex items-center gap-2 whitespace-nowrap rounded-sm text-[15px] font-medium transition-[color] duration-200 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181b]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white xl:text-[16px] hover:text-[#18181b]/70 ${
      active ? 'text-[#18181b]/70' : 'text-black'
    }`;

  const indicator = (active) => (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute -bottom-2 left-0 h-px w-full origin-left rounded-full bg-weelp-sage-deep transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none group-hover/nav:scale-x-100 group-hover/nav:opacity-100 ${
        active ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
      }`}
    />
  );

  const clearOpenTimer = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const clearEnterTimer = useCallback(() => {
    if (enterTimer.current) clearTimeout(enterTimer.current);
  }, []);

  const clearExitTimer = useCallback(() => {
    if (exitTimer.current) clearTimeout(exitTimer.current);
  }, []);

  const openMega = useCallback(() => {
    clearOpenTimer();
    clearCloseTimer();
    clearEnterTimer();
    clearExitTimer();
    setMegaMounted(true);
    setMegaOpen(true);
    setMegaMotionState('opening');
    enterTimer.current = setTimeout(
      () => {
        setMegaMotionState('open');
      },
      prefersReducedMotion() ? 0 : MEGA_MENU_ENTER_START_MS,
    );
  }, [clearCloseTimer, clearEnterTimer, clearExitTimer, clearOpenTimer]);

  const closeMega = useCallback(() => {
    clearOpenTimer();
    clearEnterTimer();
    setMegaOpen(false);
    setMegaMotionState('closing');
    clearExitTimer();
    exitTimer.current = setTimeout(
      () => {
        setMegaMounted(false);
        setMegaMotionState('closed');
      },
      prefersReducedMotion() ? 0 : MEGA_MENU_EXIT_MS,
    );
  }, [clearEnterTimer, clearExitTimer, clearOpenTimer]);

  const scheduleOpen = useCallback(() => {
    clearCloseTimer();
    clearExitTimer();
    clearOpenTimer();
    if (megaOpen) return;
    openTimer.current = setTimeout(openMega, 100);
  }, [clearCloseTimer, clearExitTimer, clearOpenTimer, megaOpen, openMega]);

  const scheduleClose = useCallback(() => {
    clearOpenTimer();
    clearCloseTimer();
    closeTimer.current = setTimeout(closeMega, 150);
  }, [clearCloseTimer, clearOpenTimer, closeMega]);

  const isInMegaFocusScope = useCallback((target) => {
    if (!target || !(target instanceof Node)) return false;
    return megaTriggerRef.current?.contains(target) || megaPanelRef.current?.contains(target);
  }, []);

  const handleMegaBlur = useCallback(
    (event) => {
      if (isInMegaFocusScope(event.relatedTarget)) return;
      scheduleClose();
    },
    [isInMegaFocusScope, scheduleClose],
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeMega();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeMega]);

  useEffect(() => {
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
      if (enterTimer.current) clearTimeout(enterTimer.current);
      if (exitTimer.current) clearTimeout(exitTimer.current);
    };
  }, []);

  const megaPanelInteractive = megaMotionState === 'open';

  return (
    <nav aria-label="Primary" className="relative flex items-center justify-center">
      <ul className="flex items-center gap-5 xl:gap-9">
        {HEADER_NAV_ITEMS.map((nav, index) => {
          if (nav.hasMegaMenu) {
            const active = megaOpen || isMegaActive;
            return (
              <li key={nav.title} onMouseEnter={scheduleOpen} onMouseLeave={scheduleClose}>
                <button
                  ref={megaTriggerRef}
                  type="button"
                  className={linkClass(active)}
                  onClick={() => (megaOpen ? closeMega() : openMega())}
                  onFocus={scheduleOpen}
                  onBlur={handleMegaBlur}
                  aria-controls={MEGA_MENU_PANEL_ID}
                  aria-expanded={megaOpen}
                  aria-haspopup="dialog"
                >
                  {index === 0 && (
                    <MapPin
                      className={`size-[15px] transition-[color,transform] duration-200 ease-out motion-reduce:transition-none group-hover/nav:-translate-y-0.5 group-hover/nav:text-[#18181b]/70 ${
                        active ? 'text-[#18181b]/70' : 'text-black'
                      }`}
                      strokeWidth={1.24}
                    />
                  )}
                  {nav.title}
                  {indicator(active)}
                </button>
              </li>
            );
          }
          const active = isHrefActive(nav.href);
          return (
            <li key={nav.title}>
              <Link className={linkClass(active)} href={nav.href} aria-current={active ? 'page' : undefined}>
                {index === 0 && (
                  <MapPin
                    className={`size-[15px] transition-[color,transform] duration-200 ease-out motion-reduce:transition-none group-hover/nav:-translate-y-0.5 group-hover/nav:text-[#18181b]/70 ${
                      active ? 'text-[#18181b]/70' : 'text-black'
                    }`}
                    strokeWidth={1.24}
                  />
                )}
                {nav.title}
                {indicator(active)}
              </Link>
            </li>
          );
        })}
      </ul>

      {megaMounted && (
        <div
          ref={megaPanelRef}
          id={MEGA_MENU_PANEL_ID}
          data-testid="desktop-mega-menu-panel"
          data-state={megaMotionState}
          role="dialog"
          aria-label="Explore destinations"
          aria-hidden={megaPanelInteractive ? undefined : true}
          inert={megaPanelInteractive ? undefined : true}
          className={`absolute left-1/2 top-full z-[9999] mt-3 -translate-x-1/2 transform-gpu transition-[opacity,transform] duration-[180ms] ease-[var(--weelp-ease-out)] will-change-[opacity,transform] motion-reduce:transition-none ${
            megaMotionState === 'open' ? 'translate-y-0 opacity-100' : megaMotionState === 'opening' ? 'pointer-events-none -translate-y-2 opacity-0' : 'pointer-events-none -translate-y-1 opacity-0'
          }`}
          onMouseEnter={scheduleOpen}
          onMouseLeave={scheduleClose}
          onFocus={scheduleOpen}
          onBlur={handleMegaBlur}
        >
          <MegaMenu />
        </div>
      )}
    </nav>
  );
};

export const HeaderAccount = ({ overHero = false }) => {
  const { data: session } = useSession();
  const isMiniCartOpen = useMiniCartStore((state) => state.isMiniCartOpen);
  const setMiniCartOpen = useMiniCartStore((state) => state.setMiniCartOpen);
  const cartItems = useMiniCartStore((state) => state.cartItems);
  const cartItemCount = cartItems?.length ?? 0;
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const submenuOpenTimer = useRef(null);
  const submenuCloseTimer = useRef(null);

  const iconChip = overHero ? 'bg-white/85 backdrop-blur-md shadow-[0_4px_14px_rgba(0,0,0,0.12)]' : '';

  const clearSubmenuTimers = useCallback(() => {
    if (submenuOpenTimer.current) clearTimeout(submenuOpenTimer.current);
    if (submenuCloseTimer.current) clearTimeout(submenuCloseTimer.current);
  }, []);

  const openSubmenu = useCallback(() => {
    clearSubmenuTimers();
    setShowSubmenu(true);
  }, [clearSubmenuTimers]);

  const scheduleCloseSubmenu = useCallback(() => {
    clearSubmenuTimers();
    submenuCloseTimer.current = setTimeout(() => setShowSubmenu(false), 180);
  }, [clearSubmenuTimers]);

  useEffect(() => () => clearSubmenuTimers(), [clearSubmenuTimers]);

  const handleShowForm = () => {
    setShowForm((prev) => !prev);
  };

  // Extract user data
  const user = session?.user || {};
  const { name = '', avatar } = user;
  const userInitials = getInitials(name);
  const avatarSrc = avatar;
  const isLoggedIn = !!session;

  // HanldeShowCart
  const handleShowCart = () => {
    setMiniCartOpen(!isMiniCartOpen);
  };

  return (
    <div className="relative justify-self-end">
      <ul className="flex items-center gap-5 xl:gap-[24px]">
        <li>
          <button
            type="button"
            aria-label="Search trips"
            onClick={() => setShowForm(true)}
            className={`relative flex h-11 w-11 items-center justify-center rounded-full text-[#18181b] transition-colors duration-200 ease-out motion-reduce:transition-none hover:text-weelp-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${iconChip}`}
          >
            <Search className="size-5" strokeWidth={1.5} />
          </button>
        </li>
        <li>
          <button
            type="button"
            aria-label={cartItemCount > 0 ? `Open cart, ${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'}` : 'Open cart'}
            className={`relative flex h-11 w-11 items-center justify-center rounded-full text-[#18181b] transition-colors duration-200 ease-out motion-reduce:transition-none hover:text-weelp-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${iconChip}`}
            onClick={handleShowCart}
          >
            <span className="relative inline-flex">
              <ShoppingCart className="size-5" strokeWidth={1.5} />
              {cartItemCount > 0 && (
                <Badge key={cartItemCount} className="absolute -right-3.5 -top-2.5 animate-badge-pulse">
                  {cartItemCount}
                </Badge>
              )}
            </span>
          </button>
        </li>
        <li className={overHero ? `flex h-11 w-11 items-center justify-center rounded-full ${iconChip}` : undefined}>
          <NotificationBell />
        </li>
        <li onMouseEnter={openSubmenu} onMouseLeave={scheduleCloseSubmenu}>
          <button
            type="button"
            aria-label="Open account menu"
            aria-expanded={!!showSubmenu}
            onFocus={openSubmenu}
            className={`flex h-11 w-[65px] items-center justify-center gap-2 rounded-[30px] border border-[#e4e4e7] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${iconChip}`}
          >
            {isLoggedIn && avatarSrc ? (
              <img src={avatarSrc} alt={name || 'user'} className="h-8 w-8 rounded-full object-cover shrink-0" />
            ) : isLoggedIn ? (
              <span className="h-8 w-8 rounded-full flex items-center justify-center bg-weelp-sage-deep text-white font-semibold text-sm shrink-0">{userInitials}</span>
            ) : (
              <svg width="32" height="32" viewBox="0 0 36 36" fill="none" className="shrink-0">
                <defs>
                  <clipPath id="header-avatar-clip">
                    <circle cx="18" cy="18" r="18" />
                  </clipPath>
                </defs>
                <circle cx="18" cy="18" r="18" fill="#B3B3B3" />
                <g clipPath="url(#header-avatar-clip)">
                  <circle cx="18" cy="14" r="6.5" fill="white" />
                  <ellipse cx="18" cy="34" rx="12" ry="10" fill="white" />
                </g>
              </svg>
            )}
            <ChevronDown className="size-[16px] text-[#18181b]/70 shrink-0" strokeWidth={1.5} />
          </button>
        </li>
      </ul>

      {/* AccountSubMenu */}
      {showSubmenu && (
        <div onMouseEnter={openSubmenu} onMouseLeave={scheduleCloseSubmenu}>
          <SubmenuAccount showSubmenu={showSubmenu} setShowSubmenu={setShowSubmenu} />
        </div>
      )}

      {/* Mini Cart With React Portal */}
      {isMiniCartOpen && createPortal(<MiniCartNew />, document.body)}

      {/* Search Modal */}
      {showForm && createPortal(<ModalForm showForm={showForm} setShowForm={setShowForm} handleShowForm={handleShowForm} />, document.body)}
    </div>
  );
};

export default DesktopMenu;
