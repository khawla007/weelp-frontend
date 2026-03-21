'use client';

import Link from 'next/link';

// Simple wrapper - useNavigationEvents hook handles all navigation tracking
export default function NavigationLink({ href, children, className = '', ...props }) {
  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}
