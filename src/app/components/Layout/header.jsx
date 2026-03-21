'use client';

import React, { useEffect } from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import DesktopMenu from './NavigationMenu';
import MobileMenu from './MobileMenu';

const Header = () => {
  const { stickyHeader, setStickyHeader } = useUIStore();

  useEffect(() => {
    const isSticky = () => {
      setStickyHeader(window.scrollY > 50);
    };

    window.addEventListener('scroll', isSticky, { passive: true });
    return () => window.removeEventListener('scroll', isSticky);
  }, [setStickyHeader]);

  return (
    <header className={`block w-full ${stickyHeader ? 'fixed inset-x-0 top-0 z-[12]' : 'relative z-10'}`}>
      <DesktopMenu stickyHeader={stickyHeader} />
      <MobileMenu stickyHeader={stickyHeader} />
    </header>
  );
};

export default Header;
