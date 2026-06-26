'use client';

import React, { useEffect, useLayoutEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import DesktopMenu, { DesktopTopStrip, DesktopMainBar } from './NavigationMenu';
import MobileMenu from './MobileMenu';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const Header = () => {
  const pathname = usePathname();
  const variant = pathname === '/' ? 'over-hero' : 'solid';
  const threshold = 80;

  const [isScrolled, setIsScrolled] = useState(false);

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
      <header className={`fixed top-0 left-0 right-0 z-[99999] ${isScrolled ? 'lg:top-0' : 'lg:top-[14px]'}`} data-weelp-header-variant={variant}>
        <DesktopMenu stickyHeader={isScrolled} variant={variant} />
        <MobileMenu stickyHeader={isScrolled} variant={variant} />
      </header>
    );
  }

  // Solid (non-home) variant:
  // The top strip is rendered as a sibling above <header> so it sits in normal
  // flow and scrolls off naturally. <header> itself is the sticky element and
  // only contains the main bar (constant 66px). Because the sticky element's
  // height never changes, the document height stays constant on scroll, which
  // prevents the browser scroll-anchoring loop that previously caused the
  // header to visibly blink/jump around the 80px threshold.
  return (
    <>
      <DesktopTopStrip topStripVisible topStripOverHero={false} collapsible={false} />
      <header className="block w-full relative z-40 lg:sticky lg:top-0 lg:z-[99999]" data-weelp-header-variant={variant}>
        <DesktopMainBar stickyHeader={isScrolled} mainBarTransparent={false} />
        <MobileMenu stickyHeader={isScrolled} variant={variant} />
      </header>
    </>
  );
};

export default Header;
