'use client';

import React, { useEffect } from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import { useIsClient } from '@/hooks/useIsClient';
import DesktopMenu from './NavigationMenu';
import MobileMenu from './MobileMenu';

const Header = () => {
  const isClient = useIsClient(); // hydration
  const { stickyHeader, setStickyHeader } = useUIStore();

  useEffect(() => {
    window.addEventListener('scroll', isSticky);
    return () => {
      window.removeEventListener('scroll', isSticky);
    };
  }, []);

  // sticky header
  const isSticky = () => {
    if (window.scrollY > 50) {
      setStickyHeader(true);
    } else {
      setStickyHeader(false);
    }
  };

  if (isClient) {
    return (
      <header className={`block w-full border-b-[1px] ${stickyHeader ? 'fixed z-[12]' : ''}`}>
        <DesktopMenu stickyHeader={stickyHeader} />
        <MobileMenu stickyHeader={stickyHeader} />
      </header>
    );
  }
};

export default Header;
