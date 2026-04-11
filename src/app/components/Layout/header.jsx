'use client';

import React from 'react';
import DesktopMenu from './NavigationMenu';
import MobileMenu from './MobileMenu';

const Header = () => {
  return (
    <header className="block w-full relative z-10">
      <DesktopMenu stickyHeader={false} />
      <MobileMenu stickyHeader={false} />
    </header>
  );
};

export default Header;
