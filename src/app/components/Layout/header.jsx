'use client';

import React, { useEffect, useLayoutEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import DesktopMenu from './NavigationMenu';
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

  const positionClass = variant === 'over-hero' ? 'fixed top-0 left-0 right-0 z-[99999]' : 'block w-full relative z-40 lg:sticky lg:top-0 lg:z-[99999]';

  return (
    <header className={positionClass} data-weelp-header-variant={variant}>
      <DesktopMenu stickyHeader={isScrolled} variant={variant} />
      <MobileMenu stickyHeader={isScrolled} variant={variant} />
    </header>
  );
};

export default Header;
