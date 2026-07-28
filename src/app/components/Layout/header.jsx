'use client';

import React, { useEffect, useLayoutEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import DesktopMenu, { DesktopTopStrip, DesktopMainBar } from './NavigationMenu';
import MobileMenu, { MobileTopStrip } from './MobileMenu';
import MiniCartNew from '../Modals/MiniCartNew';
import useMiniCartStore from '@/lib/store/useMiniCartStore';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const Header = () => {
  const pathname = usePathname();
  const variant = pathname === '/' ? 'over-hero' : 'solid';
  const threshold = 80;

  const [isScrolled, setIsScrolled] = useState(false);
  const isMiniCartOpen = useMiniCartStore((state) => state.isMiniCartOpen);
  const miniCartPortalTarget = typeof document !== 'undefined' ? document.body : null;

  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let frame = 0;
    const update = () => {
      frame = 0;
      setIsScrolled(window.scrollY > threshold);
    };

    update();

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [threshold]);

  if (variant === 'over-hero') {
    // Home page: the whole header is fixed-positioned and overlays the hero. It
    // is out of normal flow, so the strip collapse animation inside cannot shift
    // page content. Keep the existing combined layout.
    return (
      <header className="fixed top-0 left-0 right-0 z-[99999]" data-weelp-header-variant={variant}>
        <DesktopMenu stickyHeader={isScrolled} variant={variant} />
        <MobileMenu stickyHeader={isScrolled} variant={variant} />
        {miniCartPortalTarget && isMiniCartOpen ? createPortal(<MiniCartNew />, miniCartPortalTarget) : null}
      </header>
    );
  }

  // Solid (non-home) variant:
  // The top strips are rendered as siblings above <header> so they sit in normal
  // flow and scroll off naturally. <header> itself is the sticky element across
  // mobile, tablet, and desktop, so child menus do not switch height or position
  // around the scroll threshold.
  return (
    <>
      <DesktopTopStrip topStripVisible topStripOverHero={false} collapsible={false} />
      <div className="lg:hidden">
        <MobileTopStrip topStripVisible topStripOverHero={false} collapsible={false} />
      </div>
      <header className="sticky top-0 z-[99999] block w-full" data-weelp-header-variant={variant}>
        <DesktopMainBar stickyHeader={isScrolled} mainBarTransparent={false} />
        <MobileMenu stickyHeader={isScrolled} variant={variant} showTopStrip={false} />
        {miniCartPortalTarget && isMiniCartOpen ? createPortal(<MiniCartNew />, miniCartPortalTarget) : null}
      </header>
    </>
  );
};

export default Header;
