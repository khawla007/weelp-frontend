import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Globe, Headphones, MapPin, Search, ShoppingCart, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import ModalForm from '../Modals/ModalForm';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { Badge } from '@/components/ui/badge';
import MiniCartNew from '../Modals/MiniCartNew';
import SubmenuAccount from '../Modals/SubmenuAccount';
import { HEADER_NAV_ITEMS, HEADER_PRIMARY_META, HEADER_SECONDARY_META } from './shellContent';
import NotificationBell from './NotificationBell';
import { getLogoUrl } from '@/lib/config/brand';
import dynamic from 'next/dynamic';

const MegaMenu = dynamic(() => import('../Modals/MegaMenu/MegaMenu'), { ssr: false });

// Helper function to generate initials from name
const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const DesktopMenu = ({ stickyHeader }) => {
  return (
    <div className="hidden lg:block w-full">
      <div className={`${stickyHeader ? 'hidden' : 'block'} border-b border-[#ededed] bg-[linear-gradient(180deg,#eaeaea_0%,#ffffff66_100%)]`}>
        <div className="mx-auto flex h-[46px] w-full items-center justify-between gap-4 px-4 md:px-8 xl:px-[60px]">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-2 text-[14px] text-[#273f4e]">
              <Smartphone className="size-[18px] text-[#273f4e]" />
              <span>{HEADER_PRIMARY_META[0].label}</span>
            </div>
            <div className="inline-flex items-center gap-2 text-[14px] text-[#273f4e]">
              <Headphones className="size-[18px] text-[#273f4e]" />
              <span>{HEADER_PRIMARY_META[1].label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-[13px] text-[14px] text-[#273f4e]">
              <Globe className="size-[18px] text-[#273f4e]" />
              <span>{HEADER_SECONDARY_META[0]}</span>
            </div>
            <div className="inline-flex items-center gap-[13px] text-[14px] text-[#273f4e]">
              <span>{HEADER_SECONDARY_META[1]}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`border-b border-[#ededed] ${stickyHeader ? 'fixed top-0 left-0 right-0 z-[99999] bg-[#ffffffcc] shadow-[0_18px_45px_-32px_rgba(18,51,71,0.7)] backdrop-blur-[47px]' : 'bg-[#ffffffcc] backdrop-blur-[47px]'}`}
      >
        <div className="grid h-[66px] w-full items-center gap-4 px-4 py-[8px] md:px-8 xl:px-[60px]" style={{ gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)' }}>
          <Link href="/" className="shrink-0 flex items-center gap-3 justify-self-start focus:outline-none">
            <img src={getLogoUrl()} alt="Weelp" className="h-9 w-auto" />
            <span className="text-[18px] font-semibold text-[#142a38]" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}>
              Weelp.
            </span>
          </Link>

          <NavMenuDesktop />

          <HeaderAccount />
        </div>
      </div>
    </div>
  );
};

const NavMenuDesktop = () => {
  const [megaOpen, setMegaOpen] = useState(false);
  const closeTimer = useRef(null);
  const openTimer = useRef(null);

  const scheduleOpen = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => setMegaOpen(true), 100);
  };

  const scheduleClose = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 150);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setMegaOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <nav aria-label="Primary" className="relative flex items-center justify-center">
      <ul className="flex items-center gap-5 xl:gap-9">
        {HEADER_NAV_ITEMS.map((nav, index) => {
          if (nav.hasMegaMenu) {
            return (
              <li key={nav.title} onMouseEnter={scheduleOpen} onMouseLeave={scheduleClose}>
                <button
                  type="button"
                  className="flex items-center gap-2 whitespace-nowrap text-[15px] font-medium text-[#142a38]/70 transition hover:text-[#142a38] focus-visible:outline-none focus-visible:text-[#142a38] xl:text-[16px]"
                  onClick={() => setMegaOpen((v) => !v)}
                  onFocus={scheduleOpen}
                  onBlur={scheduleClose}
                  aria-expanded={megaOpen}
                  aria-haspopup="menu"
                >
                  {index === 0 && <MapPin className="size-[15px] text-[#142a38]/70" strokeWidth={1.24} />}
                  {nav.title}
                </button>
              </li>
            );
          }
          return (
            <li key={nav.title}>
              <Link className="flex items-center gap-2 whitespace-nowrap text-[15px] font-medium text-[#142a38]/70 transition hover:text-[#142a38] xl:text-[16px]" href={nav.href}>
                {index === 0 && <MapPin className="size-[15px] text-[#142a38]/70" strokeWidth={1.24} />}
                {nav.title}
              </Link>
            </li>
          );
        })}
      </ul>

      {megaOpen && (
        <div className="absolute left-1/2 top-full z-[9999] mt-3 -translate-x-1/2" onMouseEnter={scheduleOpen} onMouseLeave={scheduleClose}>
          <MegaMenu />
        </div>
      )}
    </nav>
  );
};

export const HeaderAccount = () => {
  const { data: session } = useSession();
  const isMiniCartOpen = useMiniCartStore((state) => state.isMiniCartOpen);
  const setMiniCartOpen = useMiniCartStore((state) => state.setMiniCartOpen);
  const cartItems = useMiniCartStore((state) => state.cartItems);
  const [showSubmenu, setShowSubmenu] = useState(null);
  const [showForm, setShowForm] = useState(null);

  // Extract user data
  const user = session?.user || {};
  const { name = '', avatar } = user;
  const userInitials = getInitials(name);
  const avatarSrc = avatar;
  const isLoggedIn = !!session;

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
    <div className="relative justify-self-end">
      <ul className="flex items-center gap-5 xl:gap-[24px]">
        <li>
          <button type="button" className="relative flex items-center justify-center text-[#0c2536] transition hover:text-[#142a38]" onClick={handleShowCart}>
            <ShoppingCart className="size-5" strokeWidth={1.5} />
            {cartItems?.length > 0 && <Badge className={'absolute -right-4 -top-2 scale-75'}>{cartItems?.length}</Badge>}
          </button>
        </li>
        <li>
          <NotificationBell />
        </li>
        <li>
          <button type="button" className="flex items-center justify-center text-[#0c2536] transition hover:text-[#142a38]" onClick={handleShowForm}>
            <Search className="size-5" strokeWidth={1.5} />
          </button>
        </li>

        <li>
          <button
            type="button"
            className="flex items-center justify-center gap-2 w-[65px] h-[40px] rounded-[30px] border border-[#d9d9d9] transition hover:bg-gray-50 overflow-hidden"
            onClick={handleSubmenu}
          >
            {isLoggedIn && avatarSrc ? (
              <img src={avatarSrc} alt={name || 'user'} className="h-8 w-8 rounded-full object-cover shrink-0" />
            ) : isLoggedIn ? (
              <span className="h-8 w-8 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0" style={{ backgroundColor: '#568f7c' }}>
                {userInitials}
              </span>
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
            <ChevronDown className="size-[16px] text-[#142a38]/70 shrink-0" strokeWidth={1.5} />
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
