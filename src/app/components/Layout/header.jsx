'use client';

import React, { useEffect, useState } from 'react';
import DesktopMenu from './NavigationMenu';
import MobileMenu from './MobileMenu';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // When scrolled past 46px (height of top bar), activate sticky header
      setIsScrolled(window.scrollY > 46);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="block w-full relative z-10">
      <DesktopMenu stickyHeader={isScrolled} />
      <MobileMenu stickyHeader={isScrolled} />
    </header>
  );
};

export default Header;
