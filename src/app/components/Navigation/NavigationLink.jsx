'use client';

import Link from 'next/link';
import { useNavigationStore } from '@/lib/store/useNavigationStore';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NavigationLink({ href, children, className = '', ...props }) {
  const pathname = usePathname();
  const isNavigating = useNavigationStore((state) => state.isNavigating);
  const setNavigating = useNavigationStore((state) => state.setNavigating);
  const [isInternalNavigating, setIsInternalNavigating] = useState(false);

  const handleClick = (e) => {
    // Don't prevent default - let Next.js handle navigation
    // Just set navigation state for the loader
    setNavigating(true);
    setIsInternalNavigating(true);
  };

  // Clear navigation state when pathname changes
  useEffect(() => {
    if (isInternalNavigating) {
      setIsInternalNavigating(false);
      // Small delay to let page render
      setTimeout(() => {
        setNavigating(false);
      }, 300);
    }
  }, [pathname, isInternalNavigating, setNavigating]);

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}